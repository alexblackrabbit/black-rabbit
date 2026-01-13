import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Helper: Sleep to respect rate limits
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 🛠️ ROBUST SLACK FETCH
 * Handles Rate Limits (429) automatically
 */
async function slackFetch(url, token, { method = "GET", body = null } = {}) {
  while (true) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") || 1);
      console.log(`⏳ Rate limit hit. Sleeping for ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Slack API request failed");
    return data;
  }
}

/**
 * 🛠️ PAGINATION HELPER
 */
async function slackFetchAllPages(baseUrl, token, itemKey, { limit = 200 } = {}) {
  let all = [];
  let cursor = "";

  while (true) {
    const url = new URL(baseUrl);
    url.searchParams.set("limit", String(limit));
    if (cursor) url.searchParams.set("cursor", cursor);

    try {
      const data = await slackFetch(url.toString(), token);
      const items = data[itemKey] || [];
      all = all.concat(items);
      cursor = data.response_metadata?.next_cursor || "";
      if (!cursor) break;
    } catch (e) {
      console.warn(`Partial fetch failure: ${e.message}`);
      break; 
    }
  }
  return all;
}

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SLACK_BOT_TOKEN) {
      throw new Error("Missing required server environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ---------------------------------------------------------
    // 🆕 STEP 2: FETCH WORKSPACE INFO (TIMEZONE)
    // ---------------------------------------------------------
    const teamData = await slackFetch(
      "https://slack.com/api/team.info",
      SLACK_BOT_TOKEN
    );

    if (teamData.ok && teamData.team) {
      const team = teamData.team;
      console.log(`🏢 Workspace detected: ${team.name} (${team.tz})`);
      
      await supabase.from("slack_workspaces").upsert({
        id: team.id,
        name: team.name,
        timezone: team.tz,               // e.g. "America/Los_Angeles"
        timezone_offset: team.tz_offset  // e.g. -28800
      });
    }
    // ---------------------------------------------------------

    const userCache = new Map();

    // Helper: Cache users to avoid spamming API
    const getAndUpsertUser = async (userId) => {
      if (!userId) return null;
      if (userCache.has(userId)) return userCache.get(userId);

      try {
        const data = await slackFetch(
          `https://slack.com/api/users.info?user=${userId}`,
          SLACK_BOT_TOKEN
        );
        const user = data.user;
        const record = {
          id: user.id,
          name: user.name,
          real_name: user.real_name || user.name,
        };
        userCache.set(userId, record);
        await supabase.from("slack_users").upsert(record);
        return record;
      } catch (e) {
        console.warn(`User fetch failed for ${userId}:`, e.message);
        return null;
      }
    };

    // 1️⃣ List Channels
    const allConvos = await slackFetchAllPages(
      "https://slack.com/api/conversations.list?types=public_channel,private_channel,im,mpim&exclude_archived=true",
      SLACK_BOT_TOKEN,
      "channels"
    );

    let totalMessagesInserted = 0;

    for (const c of allConvos) {
      // Determine Type
      const type = c.is_im ? "im" : c.is_mpim ? "mpim" : c.is_private ? "private" : "public";

      // Save Channel
      await supabase.from("slack_channels").upsert({
        id: c.id,
        name: c.name || null,
        type,
        is_private: !!c.is_private,
        updated_at: new Date().toISOString(),
      });

      // 2️⃣ Auto-join Public Channels
      if (type === "public") {
        try {
          await slackFetch("https://slack.com/api/conversations.join", SLACK_BOT_TOKEN, {
            method: "POST",
            body: { channel: c.id }
          });
        } catch (e) { /* Ignore already_in_channel */ }
      }

      // 3️⃣ Fetch History (Parents)
      const baseHistoryUrl = new URL("https://slack.com/api/conversations.history");
      baseHistoryUrl.searchParams.set("channel", c.id);
      
      const parentMessages = await slackFetchAllPages(
        baseHistoryUrl.toString(),
        SLACK_BOT_TOKEN,
        "messages",
        { limit: 100 }
      );

      const allMessages = [];

      // 4️⃣ THREAD EXPANSION (Deep Ingestion)
      for (const m of parentMessages) {
        allMessages.push(m); // Add the parent

        // If this message has replies, go fetch them!
        if (m.reply_count && m.reply_count > 0) {
            const threadUrl = new URL("https://slack.com/api/conversations.replies");
            threadUrl.searchParams.set("channel", c.id);
            threadUrl.searchParams.set("ts", m.ts);
            
            try {
                // Fetch replies for this specific thread
                const replies = await slackFetchAllPages(
                    threadUrl.toString(), 
                    SLACK_BOT_TOKEN, 
                    "messages"
                );
                // Filter out the parent (replies endpoint returns parent + replies)
                const actualReplies = replies.filter(r => r.ts !== m.ts);
                allMessages.push(...actualReplies);
            } catch (err) {
                console.warn(`Failed to fetch thread ${m.ts}:`, err.message);
            }
        }
      }

      // 5️⃣ Insert into Supabase
      if (!allMessages.length) continue;

      const rows = [];
      for (const m of allMessages) {
        if (!m.user || !m.text) continue;
        
        await getAndUpsertUser(m.user);

        rows.push({
          channel_id: c.id,
          user_id: m.user,
          text: m.text,
          ts: m.ts,
          ts_num: Number(m.ts) // Numeric timestamp for robust sorting
        });
      }

      if (rows.length) {
        const { error } = await supabase
          .from("slack_messages")
          .upsert(rows, { onConflict: "channel_id,ts" });

        if (!error) totalMessagesInserted += rows.length;
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Deep ingestion complete (Parents + Threads + Timezone)",
      channels_processed: allConvos.length,
      messages_processed: totalMessagesInserted,
    });

  } catch (error) {
    console.error("Ingest failed:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

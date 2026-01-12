import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Slack fetch with:
 * - 429 retry (rate limits)
 * - strict error handling
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

    // Rate limiting
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") || 1);
      await sleep(retryAfter * 1000);
      continue;
    }

    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error || "Slack API request failed");
    }

    return data;
  }
}

/**
 * Cursor pagination for Slack endpoints that return response_metadata.next_cursor
 * itemKey is the array name in Slack response (channels/messages/etc).
 */
async function slackFetchAllPages(baseUrl, token, itemKey, { limit = 200 } = {}) {
  let all = [];
  let cursor = "";

  // Slack history endpoints effectively cap at ~100–200; we keep it safe.
  // For conversations.history, we will override to 100 below.
  while (true) {
    const url = new URL(baseUrl);
    url.searchParams.set("limit", String(limit));
    if (cursor) url.searchParams.set("cursor", cursor);

    const data = await slackFetch(url.toString(), token);
    const items = data[itemKey] || [];
    all = all.concat(items);

    cursor = data.response_metadata?.next_cursor || "";
    if (!cursor) break;
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

    /**
     * In-memory user cache (prevents calling users.info repeatedly)
     */
    const userCache = new Map();

    const getAndUpsertUser = async (userId) => {
      if (!userId) return null;
      if (userCache.has(userId)) return userCache.get(userId);

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
    };

    /**
     * 1) List ALL conversations we can see:
     * - public channels (org-wide)
     * - private channels (only those bot is invited to)
     * - im/mpim (only those that include the bot)
     */
    const allConvos = await slackFetchAllPages(
      "https://slack.com/api/conversations.list?types=public_channel,private_channel,im,mpim&exclude_archived=true",
      SLACK_BOT_TOKEN,
      "channels",
      { limit: 200 }
    );

    /**
     * Pull existing last_ingested_ts so we can do incremental ingestion
     */
    const { data: existingChannels, error: existingErr } = await supabase
      .from("slack_channels")
      .select("id,last_ingested_ts");

    if (existingErr) throw existingErr;

    const lastTsByChannel = new Map();
    for (const row of existingChannels || []) {
      lastTsByChannel.set(row.id, Number(row.last_ingested_ts || 0));
    }

    let totalMessagesInserted = 0;

    for (const c of allConvos) {
      // Determine type
      const type = c.is_im
        ? "im"
        : c.is_mpim
          ? "mpim"
          : c.is_private
            ? "private"
            : "public";

      // Save channel metadata
      await supabase.from("slack_channels").upsert({
        id: c.id,
        name: c.name || null, // do NOT invent names for DMs/private
        type,
        is_private: !!c.is_private,
        updated_at: new Date().toISOString(),
      });

      /**
       * 2) Auto-join PUBLIC channels only (org-wide)
       */
      if (type === "public") {
        try {
          await slackFetch(
            "https://slack.com/api/conversations.join",
            SLACK_BOT_TOKEN,
            { method: "POST", body: { channel: c.id } }
          );
        } catch (e) {
          // Safe ignores
          if (!String(e.message).includes("already_in_channel")) {
            // If join fails for another reason, we continue but ingestion might be limited
            console.warn(`Join failed for channel ${c.id}: ${e.message}`);
          }
        }
      }

      /**
       * 3) Incremental history fetch
       * We only ingest messages newer than last_ingested_ts.
       */
      const lastTs = lastTsByChannel.get(c.id) || 0;

      // conversations.history supports "oldest"
      // We fetch pages with cursor; Slack caps per page ~100.
      const baseHistoryUrl = new URL("https://slack.com/api/conversations.history");
      baseHistoryUrl.searchParams.set("channel", c.id);
      baseHistoryUrl.searchParams.set("oldest", String(lastTs));
      baseHistoryUrl.searchParams.set("inclusive", "false");

      const messages = await slackFetchAllPages(
        baseHistoryUrl.toString(),
        SLACK_BOT_TOKEN,
        "messages",
        { limit: 100 } // history safe cap
      );

      if (!messages.length) continue;

      // Batch prepare inserts and track max ts
      let maxTs = lastTs;
      const rows = [];

      for (const m of messages) {
        // Skip bot messages / system messages if no user
        if (!m.user || !m.text) continue;

        // Ensure user exists (cached)
        await getAndUpsertUser(m.user);

        const tsNum = Number(m.ts);
        if (!Number.isNaN(tsNum) && tsNum > maxTs) maxTs = tsNum;

        rows.push({
          channel_id: c.id,
          user_id: m.user,
          text: m.text,
          ts: m.ts,
        });
      }

      if (rows.length) {
        // Upsert using unique index on (channel_id, ts)
        const { error } = await supabase
          .from("slack_messages")
          .upsert(rows, { onConflict: "channel_id,ts" });

        if (error) {
          console.error("Message upsert error:", error);
        } else {
          totalMessagesInserted += rows.length;
        }
      }

      // Update last ingested ts for channel
      await supabase.from("slack_channels").upsert({
        id: c.id,
        last_ingested_ts: maxTs,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Org ingestion complete",
      channels_processed: allConvos.length,
      messages_processed: totalMessagesInserted,
    });
  } catch (error) {
    console.error("Slack ingest failed:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

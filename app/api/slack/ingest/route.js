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
 * Cursor pagination helper
 */
async function slackFetchAllPages(baseUrl, token, itemKey, { limit = 200 } = {}) {
  let all = [];
  let cursor = "";

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
  console.log("🚀 Slack cron fired", new Date().toISOString());

  let run = null;

  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SLACK_BOT_TOKEN) {
      throw new Error("Missing required server environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    /**
     * 🔹 Create ingestion run record (START)
     */
    const { data: runRow, error: runError } = await supabase
      .from("slack_ingestion_runs")
      .insert({
        started_at: new Date(),
        status: "running",
      })
      .select()
      .single();

    if (runError) {
      throw new Error("Failed to create ingestion run record");
    }

    run = runRow;

    /**
     * In-memory user cache
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
     * 1) List all conversations
     */
    const allConvos = await slackFetchAllPages(
      "https://slack.com/api/conversations.list?types=public_channel,private_channel,im,mpim&exclude_archived=true",
      SLACK_BOT_TOKEN,
      "channels",
      { limit: 200 }
    );

    /**
     * Pull last_ingested_ts
     */
    const { data: existingChannels } = await supabase
      .from("slack_channels")
      .select("id,last_ingested_ts");

    const lastTsByChannel = new Map();
    for (const row of existingChannels || []) {
      lastTsByChannel.set(row.id, Number(row.last_ingested_ts || 0));
    }

    let totalMessagesInserted = 0;

    for (const c of allConvos) {
      const type = c.is_im
        ? "im"
        : c.is_mpim
        ? "mpim"
        : c.is_private
        ? "private"
        : "public";

      await supabase.from("slack_channels").upsert({
        id: c.id,
        name: c.name || null,
        type,
        is_private: !!c.is_private,
        updated_at: new Date().toISOString(),
      });

      /**
       * Auto-join PUBLIC channels
       */
      if (type === "public") {
        try {
          await slackFetch(
            "https://slack.com/api/conversations.join",
            SLACK_BOT_TOKEN,
            { method: "POST", body: { channel: c.id } }
          );
        } catch (e) {
          if (!String(e.message).includes("already_in_channel")) {
            console.warn(`Join failed for ${c.id}: ${e.message}`);
          }
        }
      }

      /**
       * Incremental history fetch
       */
      const lastTs = lastTsByChannel.get(c.id) || 0;

      const historyUrl = new URL(
        "https://slack.com/api/conversations.history"
      );
      historyUrl.searchParams.set("channel", c.id);
      historyUrl.searchParams.set("oldest", String(lastTs));
      historyUrl.searchParams.set("inclusive", "false");

      const messages = await slackFetchAllPages(
        historyUrl.toString(),
        SLACK_BOT_TOKEN,
        "messages",
        { limit: 100 }
      );

      if (!messages.length) continue;

      let maxTs = lastTs;
      const rows = [];

      for (const m of messages) {
        if (!m.user || !m.text) continue;

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
        const { error } = await supabase
          .from("slack_messages")
          .upsert(rows, { onConflict: "channel_id,ts" });

        if (!error) {
          totalMessagesInserted += rows.length;
        }
      }

      await supabase.from("slack_channels").upsert({
        id: c.id,
        last_ingested_ts: maxTs,
        updated_at: new Date().toISOString(),
      });
    }

    /**
     * 🔹 Mark run SUCCESS
     */
    await supabase
      .from("slack_ingestion_runs")
      .update({
        finished_at: new Date(),
        status: "success",
        channels_processed: allConvos.length,
        messages_processed: totalMessagesInserted,
      })
      .eq("id", run.id);

    return NextResponse.json({
      status: "success",
      message: "Org ingestion complete",
      channels_processed: allConvos.length,
      messages_processed: totalMessagesInserted,
    });
  } catch (error) {
    console.error("Slack ingest failed:", error);

    if (run?.id) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabase
        .from("slack_ingestion_runs")
        .update({
          finished_at: new Date(),
          status: "error",
          error: error.message,
        })
        .eq("id", run.id);
    }

    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

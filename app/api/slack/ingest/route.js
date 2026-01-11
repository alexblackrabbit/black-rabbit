import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * 🚫 CRITICAL FOR NEXT.JS BUILD
 * This tells Next.js NOT to evaluate this route at build time
 */
export const dynamic = "force-dynamic";

/**
 * Slack API helper
 */
async function slackFetch(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!data.ok) {
    console.error("Slack API error:", data);
    throw new Error(data.error || "Slack API request failed");
  }

  return data;
}

export async function GET() {
  try {
    /**
     * ✅ Read env vars ONLY at runtime
     */
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SLACK_TOKEN) {
      throw new Error("Missing required server environment variables");
    }

    /**
     * ✅ Create Supabase client INSIDE handler
     */
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    /**
     * 1️⃣ Fetch public channels
     */
    const channelsData = await slackFetch(
      "https://slack.com/api/conversations.list?types=public_channel",
      SLACK_TOKEN
    );

    for (const channel of channelsData.channels || []) {
      await supabase.from("slack_channels").upsert({
        id: channel.id,
        name: channel.name,
      });

      /**
       * 2️⃣ Fetch messages for channel
       */
      const messagesData = await slackFetch(
        `https://slack.com/api/conversations.history?channel=${channel.id}`,
        SLACK_TOKEN
      );

      for (const msg of messagesData.messages || []) {
        if (!msg.user || !msg.text) continue;

        /**
         * 3️⃣ Fetch user info
         */
        const userData = await slackFetch(
          `https://slack.com/api/users.info?user=${msg.user}`,
          SLACK_TOKEN
        );

        const user = userData.user;

        await supabase.from("slack_users").upsert({
          id: user.id,
          name: user.name,
          real_name: user.real_name,
        });

        await supabase.from("slack_messages").insert({
          channel_id: channel.id,
          user_id: user.id,
          text: msg.text,
          ts: msg.ts,
        });
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Slack ingestion complete",
    });
  } catch (error) {
    console.error("Slack ingest failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

async function slackFetch(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
    },
  });
  return res.json();
}

export async function GET() {
  // 1️⃣ Fetch all public channels
  const channelsData = await slackFetch(
    "https://slack.com/api/conversations.list?types=public_channel"
  );

  for (const channel of channelsData.channels) {
    await supabase.from("slack_channels").upsert({
      id: channel.id,
      name: channel.name,
    });

    // 2️⃣ Fetch messages per channel
    const messagesData = await slackFetch(
      `https://slack.com/api/conversations.history?channel=${channel.id}`
    );

    for (const msg of messagesData.messages || []) {
      if (!msg.user || !msg.text) continue;

      // 3️⃣ Fetch user
      const userData = await slackFetch(
        `https://slack.com/api/users.info?user=${msg.user}`
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

  return NextResponse.json({ status: "Slack ingestion complete" });
}

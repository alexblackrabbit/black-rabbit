import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1️⃣ Fetch already-tagged message IDs
    const { data: tagged, error: taggedError } = await supabase
      .from("message_tags")
      .select("message_id");

    if (taggedError) throw taggedError;

    const taggedIds = tagged.map((t) => t.message_id);

    // 2️⃣ Fetch untagged Slack messages
    const { data: messages, error } = await supabase
      .from("slack_messages")
      .select(`
        id,
        text,
        slack_users (
          id,
          name,
          real_name
        )
      `)
      .not("id", "in", `($

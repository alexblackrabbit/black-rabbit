import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1️⃣ Fetch messages that are NOT tagged yet
    const { data: messages, error } = await supabase
      .from("slack_messages")
      .select("id, text")
      .not(
        "id",
        "in",
        supabase
          .from("message_tags")
          .select("message_id")
      )
      .limit(20);

    if (error) throw error;
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "no_messages_to_tag" });
    }

    let inserted = 0;

    // 2️⃣ Tag each message with AI
    for (const msg of messages) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are a classifier. Return ONLY valid JSON. No commentary.",
          },
          {
            role: "user",
            content: `
Message:
"${msg.text}"

Classify:
{
  "is_blocker": boolean,
  "is_action_item": boolean,
  "is_urgent": boolean,
  "confidence": number (0 to 1)
}
`,
          },
        ],
      });

      const raw = completion.choices[0].message.content;
      const parsed = JSON.parse(raw);

      // 3️⃣ Write to DB (idempotent)
      const { error: insertError } = await supabase
        .from("message_tags")
        .upsert({
          message_id: msg.id,
          is_blocker: parsed.is_blocker,
          is_action_item: parsed.is_action_item,
          is_urgent: parsed.is_urgent,
          confidence: parsed.confidence,
          model_used: "gpt-4.1",
        });

      if (!insertError) inserted++;
    }

    return NextResponse.json({
      status: "success",
      tagged: inserted,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

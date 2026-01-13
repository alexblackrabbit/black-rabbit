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
      .not("id", "in", `(${taggedIds.join(",") || 0})`)
      .limit(50);

    if (error) throw error;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "no_messages_to_tag" });
    }

    // 3️⃣ Build AI prompt
    const prompt = `
You are an enterprise operations analyst.

For EACH message, return structured tags.
Return ONLY valid JSON.

Schema:
[
  {
    "message_id": number,
    "is_blocker": boolean,
    "is_urgent": boolean,
    "is_decision": boolean,
    "is_question": boolean,
    "is_action_item": boolean,
    "mentioned_users": string[],
    "inferred_owner": string | null,
    "inferred_deadline": string | null,
    "confidence": number
  }
]

Messages:
${messages
  .map(
    (m) =>
      `ID ${m.id} (${m.slack_users?.real_name || "Unknown"}): ${m.text}`
  )
  .join("\n")}
`;

    // 4️⃣ Call OpenAI (Layer 1 — deterministic tagging)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You return strict JSON only." },
        { role: "user", content: prompt }
      ]
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // 5️⃣ Prepare inserts
    const inserts = parsed.map((tag) => ({
      message_id: tag.message_id,
      is_blocker: tag.is_blocker,
      is_urgent: tag.is_urgent,
      is_decision: tag.is_decision,
      is_question: tag.is_question,
      is_action_item: tag.is_action_item,
      mentioned_users: tag.mentioned_users || [],
      inferred_owner: tag.inferred_owner,
      inferred_deadline: tag.inferred_deadline,
      confidence: tag.confidence,
      model_used: "gpt-4o-mini",
      tag_version: 1
    }));

    // 6️⃣ Insert tags (idempotent)
    const { error: insertError } = await supabase
      .from("message_tags")
      .upsert(inserts, {
        onConflict: "message_id"
      });

    if (insertError) throw insertError;

    return NextResponse.json({
      status: "tagging_complete",
      tagged: inserts.length
    });
  } catch (err) {
    console.error("Tagging error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

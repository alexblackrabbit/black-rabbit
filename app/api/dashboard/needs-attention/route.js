import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from("message_tags")
      .select(`
        message_id,
        is_blocker,
        is_urgent,
        is_action_item,
        is_decision,
        is_question,
        confidence,
        slack_messages (
          id,
          text,
          created_at,
          slack_users (
            real_name
          )
        )
      `)
      .or(
        "is_blocker.eq.true,is_urgent.eq.true,is_action_item.eq.true,is_decision.eq.true,is_question.eq.true"
      )
      .order("is_blocker", { ascending: false })
      .order("is_urgent", { ascending: false })
      .order("message_id", { ascending: false })
      .limit(20);

    if (error) throw error;

    // Flatten shape for the UI
    const items = (data || []).map((row) => ({
      id: row.slack_messages.id,
      text: row.slack_messages.text,
      created_at: row.slack_messages.created_at,
      author: row.slack_messages.slack_users?.real_name || "Unknown",
      tags: {
        is_blocker: row.is_blocker,
        is_urgent: row.is_urgent,
        is_action_item: row.is_action_item,
        is_decision: row.is_decision,
        is_question: row.is_question,
        confidence: row.confidence
      }
    }));

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

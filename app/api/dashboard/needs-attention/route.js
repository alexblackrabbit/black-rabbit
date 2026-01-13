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
      .from("slack_messages")
      .select(`
        id,
        text,
        created_at,
        slack_users (
          real_name
        ),
        message_tags (
          is_blocker,
          is_urgent,
          is_action_item,
          is_decision,
          is_question,
          confidence
        )
      `)
      .or(
        "message_tags.is_blocker.eq.true,message_tags.is_urgent.eq.true,message_tags.is_action_item.eq.true,message_tags.is_decision.eq.true,message_tags.is_question.eq.true"
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ items: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

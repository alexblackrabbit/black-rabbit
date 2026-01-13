import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "my";

    /* ───────────── AUTH ───────────── */
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ───────────── MAP USER → SLACK USER ───────────── */
    const { data: slackUser } = await supabase
      .from("slack_users")
      .select("id, real_name")
      .eq("email", user.email)
      .single();

    if (!slackUser) {
      return NextResponse.json({ items: [] });
    }

    /* ───────────── BASE QUERY (OPEN LOOPS) ───────────── */
    let query = supabase
      .from("slack_messages")
      .select(`
        id,
        text,
        created_at,
        slack_user_id,
        slack_users ( real_name ),
        slack_channels ( name ),
        message_tags (
          is_blocker,
          is_decision,
          is_question,
          is_action_item,
          mentioned_users,
          inferred_owner
        )
      `)
      .or(
        `
        message_tags.is_blocker.eq.true,
        message_tags.is_decision.eq.true,
        message_tags.is_question.eq.true,
        message_tags.is_action_item.eq.true
      `
      )
      .order("created_at", { ascending: false })
      .limit(20);

    /* ───────────── PERSONAL FILTER (MY OPEN LOOPS) ───────────── */
    if (scope === "my") {
      query = query.or(
        `
        slack_user_id.eq.${slackUser.id},
        message_tags.inferred_owner.eq.${slackUser.real_name}
      `
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    /* ───────────── TRANSFORM → LOOPS ───────────── */
    const items = (data || []).map((m) => {
      const tags = m.message_tags || {};

      let title = "Open item";
      let reason = "Requires attention";

      if (tags.is_blocker) {
        title = "Work is blocked";
        reason = "Progress is blocked pending resolution";
      } else if (tags.is_decision) {
        title = "Decision pending";
        reason = "Decision has not been finalized";
      } else if (tags.is_question) {
        title = "Awaiting response";
        reason = "Question raised without response";
      } else if (tags.is_action_item) {
        title = "Action required";
        reason = "Action has not been completed";
      }

      return {
        loop_id: m.id,
        title,
        reason,
        channel: m.slack_channels?.name || null,
        last_activity: {
          author: m.slack_users?.real_name || "Unknown",
          timestamp: m.created_at
        }
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Open loops error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

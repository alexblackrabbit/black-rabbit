import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Get Total Messages (All Time)
    const { count: totalMessages, error: totalError } = await supabase
      .from("slack_messages")
      .select("*", { count: "exact", head: true });

    // 2. Get Messages Today (Since Midnight)
    // We compare the 'ts' (timestamp) field against midnight today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTs = (startOfDay.getTime() / 1000).toString();

    const { count: newMessages, error: newError } = await supabase
      .from("slack_messages")
      .select("*", { count: "exact", head: true })
      .gte("ts", startOfDayTs);

    // 3. Get Total Channels
    const { count: channelCount } = await supabase
      .from("slack_channels")
      .select("*", { count: "exact", head: true });

    // 4. Get Participants (Unique Users)
    const { count: participantCount } = await supabase
      .from("slack_users")
      .select("*", { count: "exact", head: true });

    // 5. Get Last Sync Time
    const { data: lastMsg } = await supabase
      .from("slack_messages")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (totalError || newError) throw new Error("Database error");

    return NextResponse.json({
      messages: totalMessages || 0,
      newMessages: newMessages || 0, // <--- This is the delta you wanted
      channels: channelCount || 0,
      participants: participantCount || 0,
      lastSync: lastMsg?.created_at || null,
      status: "OPTIMAL"
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz"; // 📦 New Import

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. RESOLVE WORKSPACE TIMEZONE
    // We grab the first workspace (since MVP is single-tenant)
    const { data: workspace } = await supabase
      .from("slack_workspaces")
      .select("timezone")
      .limit(1)
      .single();

    // Default to UTC if ingestion hasn't run yet
    const tz = workspace?.timezone || "UTC"; 

    // 2. CALCULATE "MIDNIGHT" IN THAT TIMEZONE
    // This fixes the "Server is UTC but user is in LA" bug
    const now = new Date();
    
    // Convert current UTC time to the Workspace Time
    const zonedNow = utcToZonedTime(now, tz);
    
    // Create a date for "Midnight" relative to that timezone
    const zonedMidnight = new Date(
      zonedNow.getFullYear(),
      zonedNow.getMonth(),
      zonedNow.getDate(),
      0, 0, 0 // 00:00:00
    );

    // Convert that "Midnight" back to absolute UTC timestamp for the DB
    const startOfDayUtc = zonedTimeToUtc(zonedMidnight, tz);
    const startOfDayUnix = startOfDayUtc.getTime() / 1000;

    // 3. GET TOTAL MESSAGES
    const { count: totalMessages, error: totalError } = await supabase
      .from("slack_messages")
      .select("*", { count: "exact", head: true });

    // 4. GET NEW MESSAGES (Using accurate workspace timestamp)
    const { count: newMessages, error: newError } = await supabase
      .from("slack_messages")
      .select("*", { count: "exact", head: true })
      .gte("ts_num", startOfDayUnix);

    // 5. GET OTHER STATS
    const { count: channelCount } = await supabase
      .from("slack_channels")
      .select("*", { count: "exact", head: true });

    const { count: participantCount } = await supabase
      .from("slack_users")
      .select("*", { count: "exact", head: true });

    const { data: lastMsg } = await supabase
      .from("slack_messages")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (totalError || newError) throw new Error("Database error");

    return NextResponse.json({
      messages: totalMessages || 0,
      newMessages: newMessages || 0,
      channels: channelCount || 0,
      participants: participantCount || 0,
      lastSync: lastMsg?.created_at || null,
      status: "OPTIMAL",
      timezone: tz // Returning this helps you verify it works
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🔒 SECURITY CHECK (Multi-Tenant)
    // 1. Extract the Token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    // 2. Verify the User
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ User is verified. ID: user.id

    // 1. RESOLVE WORKSPACE TIMEZONE (SCOPED TO USER)
    const { data: workspace, error: wsError } = await supabase
      .from("slack_workspaces")
      .select("timezone")
      .eq("owner_id", user.id) // <--- THIS IS THE MAGIC (Only your workspace)
      .single();

    if (wsError || !workspace) {
        // Fallback: If no workspace claimed yet, return empty stats but don't crash
        return NextResponse.json({
            messages: 0, newMessages: 0, channels: 0, participants: 0, 
            lastSync: null, status: "NO_DATA"
        });
    }

    const tz = workspace.timezone || "UTC"; 

    // 2. CALCULATE "MIDNIGHT"
    const now = new Date();
    const zonedNow = utcToZonedTime(now, tz);
    const zonedMidnight = new Date(zonedNow.getFullYear(), zonedNow.getMonth(), zonedNow.getDate(), 0, 0, 0);
    const startOfDayUtc = zonedTimeToUtc(zonedMidnight, tz);
    const startOfDayUnix = startOfDayUtc.getTime() / 1000;

    // 3. GET TOTAL MESSAGES
    const { count: totalMessages } = await supabase
      .from("slack_messages")
      .select("*", { count: "exact", head: true });

    // 4. GET NEW MESSAGES
    const { count: newMessages } = await supabase
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

    return NextResponse.json({
      messages: totalMessages || 0,
      newMessages: newMessages || 0,
      channels: channelCount || 0,
      participants: participantCount || 0,
      lastSync: lastMsg?.created_at || null,
      status: "OPTIMAL",
      timezone: tz
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

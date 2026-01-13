import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  // 1️⃣ Exchange code for Slack tokens
  const tokenRes = await fetch("https://slack.com/api/openid.connect.token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: process.env.SLACK_REDIRECT_URI
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.ok) {
    console.error("Slack token error:", tokenData);
    return NextResponse.json({ error: "Slack OAuth failed" }, { status: 401 });
  }

  const slackUserId = tokenData.sub; // Slack user ID
  const team = tokenData.team;       // { id, name, domain }

  // 2️⃣ Create Supabase service client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 3️⃣ Get current Supabase user (from cookie)
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 4️⃣ Upsert Slack team
  await supabase
    .from("slack_teams")
    .upsert({
      id: team.id,
      name: team.name,
      domain: team.domain
    });

  // 5️⃣ Link Slack user → Supabase user (THIS IS THE KEY)
  await supabase
    .from("slack_users")
    .update({ supabase_user_id: user.id })
    .eq("id", slackUserId);

  // 6️⃣ Redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

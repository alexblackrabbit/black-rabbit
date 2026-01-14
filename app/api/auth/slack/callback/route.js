import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/dashboard?error=slack_no_code");
  }

  // 🔐 Get current logged-in user (cookie-based)
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect("/login");
  }

  // 🔁 Exchange code with Slack
  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: process.env.SLACK_REDIRECT_URI
    })
  });

  const data = await res.json();

  if (!data.ok) {
    console.error("Slack OAuth failed:", data);
    return NextResponse.redirect("/dashboard?error=slack_failed");
  }

  // 💾 Save connection
  await supabase.from("slack_connections").upsert({
    supabase_user_id: user.id,
    team_id: data.team.id,
    team_name: data.team.name,
    bot_token: data.access_token
  });

  return NextResponse.redirect("/dashboard");
}

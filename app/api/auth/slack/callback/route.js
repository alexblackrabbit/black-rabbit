import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
  }

  // 1️⃣ Require existing Black Rabbit session
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Must be logged into Black Rabbit first" },
      { status: 401 }
    );
  }

  // 2️⃣ Exchange Slack code for OpenID identity
  const tokenRes = await fetch("https://slack.com/api/openid.connect.token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: process.env.SLACK_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.ok) {
    console.error("Slack OAuth error:", tokenData);
    return NextResponse.json({ error: "Slack OAuth failed" }, { status: 401 });
  }

  const slackUserId = tokenData.sub;

  // 3️⃣ Link Slack user → existing Black Rabbit user
  await supabase
    .from("slack_users")
    .update({ supabase_user_id: user.id })
    .eq("id", slackUserId);

  // 4️⃣ Redirect back to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

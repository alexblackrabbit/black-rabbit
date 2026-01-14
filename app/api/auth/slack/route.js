// app/api/auth/slack/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });

  const callbackUrl = `${requestUrl.origin}/api/auth/slack/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "slack_oidc",
    options: {
      redirectTo: callbackUrl,
      // ONLY non-identity scopes
      scopes: "channels:history channels:read groups:history im:history mpim:history users:read",
    },
  });

  if (error) {
    console.error("Slack OAuth start failed:", error);
    return NextResponse.redirect(`${requestUrl.origin}/login`);
  }

  return NextResponse.redirect(data.url);
}

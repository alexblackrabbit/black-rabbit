import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const callbackUrl = `${requestUrl.origin}/api/auth/slack/callback`;

  // ⚡️ FIX: We REMOVED 'openid', 'profile', and 'email' from this list.
  // Supabase OIDC adds them automatically now.
  // We ONLY list the ingestion permissions you need for your dashboard.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "slack_oidc",
    options: {
      redirectTo: callbackUrl,
      scopes: "channels:history channels:read groups:history im:history mpim:history users:read",
    },
  });

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=slack_start_failed`);
  }

  return NextResponse.redirect(data.url);
}

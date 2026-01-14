import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Tell Supabase where to send the user after Slack says "Yes"
  const callbackUrl = `${requestUrl.origin}/api/auth/slack/callback`;

  // 2. Start the OAuth process using the NEW provider
  const { data, error } = await supabase.auth.signInWithOAuth({
    // ⚡️ CHANGE THIS: 'slack' -> 'slack_oidc'
    provider: "slack_oidc", 
    options: {
      redirectTo: callbackUrl,
      // Keep your permissions requests here
      scopes: "channels:history,channels:read,groups:history,im:history,mpim:history,users:read,openid,profile,email", 
    },
  });

  if (error) {
    console.error("Slack Auth Start Error:", error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=slack_start_failed`);
  }

  // 3. Redirect the user to the secure URL Supabase created
  return NextResponse.redirect(data.url);
}

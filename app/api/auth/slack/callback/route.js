import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 🔑 CRITICAL: This exchanges the code for a session and sets the cookie.
    // Without this, the browser remains "logged out".
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // ✅ OPTIONAL: If you still need to save the Slack ID to your table, 
      // you can do it here using the session data (NOT a manual fetch).
      
      /* const slackUserId = session.user.user_metadata.provider_id; // Slack ID comes from here now
      await supabase
        .from("slack_users")
        .upsert({ 
           supabase_user_id: session.user.id,
           id: slackUserId,
           email: session.user.email
        });
      */
    }
  }

  // 🚀 Redirect to Dashboard (now with a valid cookie)
  return NextResponse.redirect(`${requestUrl.origin}/`);
}

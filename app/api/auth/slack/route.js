import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    scope: [
      "openid",
      "profile",
      "email",
      "users:read.email",
      "team:read",
      "users:read"
    ].join(" "),
    redirect_uri: process.env.SLACK_REDIRECT_URI,
    response_type: "code"
  });

  const slackAuthUrl = `https://slack.com/openid/connect/authorize?${params.toString()}`;

  return NextResponse.redirect(slackAuthUrl);
}

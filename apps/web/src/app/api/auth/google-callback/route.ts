import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, GOOGLE_OAUTH_CALLBACK_PAGE } from "@/lib/google-oauth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, APP_URL)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", APP_URL)
    );
  }

  try {
    const tokens = await exchangeGoogleCode(code);

    const authRes = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: tokens.id_token }),
    });

    const data = (await authRes.json()) as {
      token?: string;
      error?: string;
      user?: { onboarded?: boolean };
    };

    if (!authRes.ok || !data.token) {
      throw new Error(data.error || "Failed to create session");
    }

    const next = data.user?.onboarded ? "/board" : "/onboarding";
    const completeUrl = new URL(GOOGLE_OAUTH_CALLBACK_PAGE, APP_URL);
    completeUrl.searchParams.set("token", data.token);
    completeUrl.searchParams.set("next", next);
    return NextResponse.redirect(completeUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "auth_failed";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, APP_URL)
    );
  }
}

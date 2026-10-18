import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-oauth";

export async function GET() {
  try {
    const url = getGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth init failed";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000")
    );
  }
}

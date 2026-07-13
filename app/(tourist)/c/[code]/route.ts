import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { CHECKIN_SESSION_COOKIE, CHECKIN_SESSION_MAX_AGE } from "@/lib/auth/checkin-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = request.nextUrl.origin;
  
  // Create an absolute URL for the redirect
  const checkinUrl = new URL(`/checkin/${code}`, baseUrl);
  
  const response = NextResponse.redirect(checkinUrl);
  response.cookies.set(CHECKIN_SESSION_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CHECKIN_SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

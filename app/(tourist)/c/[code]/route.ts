import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { CHECKIN_SESSION_COOKIE, CHECKIN_SESSION_MAX_AGE } from "@/lib/auth/checkin-session";
import {
  resolveAndValidateCheckinCode,
  trackCheckinFunnelEvent,
} from "@/lib/services/checkin.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = request.nextUrl.origin;
  const checkinUrl = new URL(`/checkin/${code}`, baseUrl);
  const sessionId = crypto.randomUUID();

  try {
    const context = await resolveAndValidateCheckinCode(code);
    if (context.status === "valid" && context.details) {
      await trackCheckinFunnelEvent("qr_scanned", context.details, { sessionId });
    }
  } catch {
    // Analytics must never block the tourist reward flow.
  }

  const response = NextResponse.redirect(checkinUrl);
  response.cookies.set(CHECKIN_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CHECKIN_SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

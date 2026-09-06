import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import {
  CHECKIN_BROWSER_COOKIE,
  CHECKIN_BROWSER_MAX_AGE,
  resolveCheckinBrowserId,
} from "@/lib/auth/checkin-entry";
import { CHECKIN_SESSION_COOKIE, CHECKIN_SESSION_MAX_AGE } from "@/lib/auth/checkin-session";
import { beginCanonicalCheckinEntry } from "@/lib/services/checkin-entry.service";
import { trackCheckinFunnelEvent } from "@/lib/services/checkin.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = request.nextUrl.origin;
  const checkinUrl = new URL(`/checkin/${encodeURIComponent(code)}`, baseUrl);
  const browser = resolveCheckinBrowserId(request.cookies.get(CHECKIN_BROWSER_COOKIE)?.value);
  const nfcTokens = request.nextUrl.searchParams.getAll("nfc");
  const nfcToken = nfcTokens.length === 1 ? nfcTokens[0] : nfcTokens.length > 1 ? "duplicate" : null;
  const entry = await beginCanonicalCheckinEntry({ code, nfcToken, browserId: browser.browserId });

  let sessionId: string | null = null;
  if (entry.mode === "session") {
    sessionId = entry.sessionId;
    checkinUrl.searchParams.set("flow", entry.sessionId);
    if (entry.channel === "qr" && entry.wasCreated) {
      try {
        await trackCheckinFunnelEvent("qr_scanned", entry.details, { sessionId: entry.sessionId });
      } catch {
        // Analytics must never block the tourist reward flow.
      }
    }
  } else if (entry.mode === "legacy") {
    sessionId = randomUUID();
    try {
      await trackCheckinFunnelEvent("qr_scanned", entry.details, { sessionId });
    } catch {
      // Analytics must never block the tourist reward flow.
    }
  } else {
    checkinUrl.searchParams.set("entryError", entry.status);
  }

  const response = NextResponse.redirect(checkinUrl);
  if (sessionId) {
    response.cookies.set(CHECKIN_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CHECKIN_SESSION_MAX_AGE,
      path: "/",
    });
  }
  if (entry.mode === "session") {
    response.cookies.set(CHECKIN_BROWSER_COOKIE, browser.browserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CHECKIN_BROWSER_MAX_AGE,
      path: "/",
    });
  }
  return response;
}

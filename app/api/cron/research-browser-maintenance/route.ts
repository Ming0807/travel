import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { researchBrowserGrantCleanupEnabled } from "@/lib/config/research-browser";
import { cleanupExpiredResearchBrowserGrants } from "@/lib/repositories/research-browser-grant.repository";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || secret.length < 32 || !authorization) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function GET(request: NextRequest) {
  const headers = { "cache-control": "no-store" };
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: {
      code: "UNAUTHORIZED", message: "ไม่อนุญาตให้เรียกงานบำรุงรักษานี้",
    } }, { status: 401, headers });
  }
  try {
    if (!researchBrowserGrantCleanupEnabled()) {
      return NextResponse.json({ success: true, maintenance: { skipped: true, reason: "disabled" } }, { headers });
    }
    const batchLimit = 500;
    const deletedGrants = await cleanupExpiredResearchBrowserGrants(batchLimit);
    // A full batch signals possible backlog, not an exact remaining count.
    return NextResponse.json({ success: true, maintenance: {
      deletedGrants, batchLimit, batchFull: deletedGrants === batchLimit,
    } }, { headers });
  } catch {
    return NextResponse.json({ success: false, error: {
      code: "MAINTENANCE_FAILED", message: "งานล้างสิทธิ์วิจัยที่หมดอายุยังไม่สำเร็จ",
    } }, { status: 503, headers });
  }
}

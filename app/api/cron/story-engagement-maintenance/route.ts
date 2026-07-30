import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { runStoryEngagementMaintenance } from "@/lib/repositories/story-engagement.repository";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || secret.length < 32 || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "ไม่อนุญาตให้เรียกงานบำรุงรักษานี้",
        },
      },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const maintenance = await runStoryEngagementMaintenance();
    return NextResponse.json(
      { success: true, maintenance },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MAINTENANCE_FAILED",
          message: "งานสรุปและล้างข้อมูลยังไม่สำเร็จ",
        },
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}

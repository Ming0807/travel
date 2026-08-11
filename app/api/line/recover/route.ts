import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { verifyLineIdToken } from "@/lib/line/verify";
import { recoverTouristPassportWithLine } from "@/lib/repositories/tourist-identity.repository";
import { lineLinkRequestSchema } from "@/lib/validation/line";

export const dynamic = "force-dynamic";

function safeFailure(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return safeFailure("VALIDATION_ERROR", "ข้อมูลคำขอไม่ถูกต้อง กรุณาลองใหม่", 400);
  }

  try {
    const input = lineLinkRequestSchema.parse(payload);
    const verifiedIdentity = await verifyLineIdToken(input.idToken);
    const newGuestToken = crypto.randomUUID();

    await recoverTouristPassportWithLine({
      lineProviderUserId: verifiedIdentity.providerUserId,
      newGuestToken,
      language: input.language,
      consentVersion: "line_recovery_v1",
      consentPurposeKey: "passport_recovery",
    });

    const cookieStore = await cookies();
    cookieStore.set("sbtp_guest_id", newGuestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return NextResponse.json({ success: true, recovered: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return safeFailure("VALIDATION_ERROR", "กรุณายืนยันการกู้คืนพาสปอร์ตอีกครั้ง", 400);
    }

    const message = error instanceof Error ? error.message : "";
    if (message.includes("TOURIST_NOT_FOUND")) {
      return safeFailure("TOURIST_NOT_FOUND", "ไม่พบพาสปอร์ตที่เชื่อมกับบัญชี LINE นี้", 404);
    }

    return safeFailure("LINE_RECOVERY_FAILED", "ยังกู้คืนพาสปอร์ตไม่ได้ กรุณาลองใหม่", 500);
  }
}

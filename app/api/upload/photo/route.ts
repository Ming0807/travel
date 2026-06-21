import { NextRequest, NextResponse } from "next/server";
import {
  isUploadableVisitPhotoFile,
  PhotoUploadError,
  processVisitPhotoUpload,
} from "@/lib/services/photo-upload.service";
import { rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limit = rateLimit(`visit-photo:${ip}`, 10, 60 * 1000);

    if (!limit.success) {
      return errorResponse("RATE_LIMITED", "อัปโหลดรูปบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่", 429);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const visitId = formData.get("visitId");

    if (typeof visitId !== "string" || !visitId.trim()) {
      return errorResponse("VISIT_NOT_FOUND", "ไม่พบข้อมูลการเข้าชมนี้", 404);
    }

    if (!isUploadableVisitPhotoFile(file)) {
      return errorResponse("PHOTO_REQUIRED", "กรุณาเลือกรูปภาพ", 400);
    }

    const result = await processVisitPhotoUpload({ visitId, file });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    if (error instanceof PhotoUploadError) {
      return errorResponse(error.code, error.message, error.status);
    }

    console.error("Visit photo upload failed:", error instanceof Error ? error.message : "unknown error");
    return errorResponse("UPLOAD_FAILED", "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองอีกครั้ง", 500);
  }
}

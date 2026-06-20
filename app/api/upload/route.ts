import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { TouristAccessError, resolveCurrentTouristId } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { parseAllowedTouristImageMimeTypes, validateTouristImageFile } from "@/lib/validation/upload";
import { rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

const STORY_UPLOAD_RATE_LIMIT = 8;
const STORY_UPLOAD_WINDOW_MS = 60 * 1000;
const MAX_STORY_IMAGE_PIXELS = 25_000_000;
const STORY_IMAGE_WIDTH = 1200;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
}

function isSameOriginRequest(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
    return originUrl.host === requestHost;
  } catch {
    return false;
  }
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value
  );
}

function uploadValidationMessage(code: string, maxSizeMb: number) {
  switch (code) {
    case "PHOTO_EMPTY":
      return "ไฟล์รูปภาพว่างเปล่า กรุณาเลือกรูปภาพใหม่";
    case "PHOTO_INVALID_TYPE":
      return "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP เท่านั้น";
    case "PHOTO_TOO_LARGE":
      return `รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน ${maxSizeMb}MB`;
    default:
      return "ไม่สามารถอัปโหลดรูปภาพนี้ได้";
  }
}

function generateStoryImagePath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `tourist-stories/${year}/${month}/${crypto.randomUUID()}.webp`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`story-image:${ip}`, STORY_UPLOAD_RATE_LIMIT, STORY_UPLOAD_WINDOW_MS);

    if (!limit.success) {
      return errorResponse("RATE_LIMITED", "อัปโหลดรูปภาพบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่", 429);
    }

    if (!isSameOriginRequest(req)) {
      return errorResponse("INVALID_ORIGIN", "ไม่สามารถอัปโหลดรูปภาพจากแหล่งที่มานี้ได้", 403);
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปภาพ", 401);
    }

    try {
      await resolveCurrentTouristId();
    } catch (error) {
      if (error instanceof TouristAccessError && error.code === "TOURIST_IDENTITY_NOT_FOUND") {
        return errorResponse("TOURIST_IDENTITY_NOT_FOUND", "ไม่พบพาสปอร์ตนักเดินทาง กรุณาเข้าสู่ระบบอีกครั้ง", 403);
      }
      throw error;
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!isUploadFile(file)) {
      return errorResponse("PHOTO_REQUIRED", "กรุณาเลือกรูปภาพ", 400);
    }

    const serverEnv = getServerEnv();
    const allowedMimeTypes = parseAllowedTouristImageMimeTypes(serverEnv.ALLOWED_TOURIST_IMAGE_MIME_TYPES);
    const fileValidation = validateTouristImageFile({
      mimeType: file.type,
      sizeBytes: file.size,
      allowedMimeTypes,
      maxSizeMb: serverEnv.MAX_UPLOAD_IMAGE_SIZE_MB,
    });

    if (!fileValidation.success) {
      return errorResponse(
        fileValidation.code,
        uploadValidationMessage(fileValidation.code, serverEnv.MAX_UPLOAD_IMAGE_SIZE_MB),
        400,
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let processedBuffer: Buffer;
    try {
      const metadata = await sharp(buffer, {
        failOn: "error",
        limitInputPixels: MAX_STORY_IMAGE_PIXELS,
      }).metadata();

      if (!metadata.width || !metadata.height) {
        return errorResponse("PHOTO_INVALID_IMAGE", "ไม่สามารถอ่านขนาดรูปภาพนี้ได้ กรุณาใช้ไฟล์อื่น", 400);
      }

      if (metadata.width * metadata.height > MAX_STORY_IMAGE_PIXELS) {
        return errorResponse("PHOTO_TOO_MANY_PIXELS", "รูปภาพละเอียดเกินไป กรุณาลดขนาดรูปภาพก่อนอัปโหลด", 400);
      }

      processedBuffer = await sharp(buffer, {
        failOn: "error",
        limitInputPixels: MAX_STORY_IMAGE_PIXELS,
      })
        .rotate()
        .resize({ width: STORY_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error("Story image processing failed:", error instanceof Error ? error.message : "unknown error");
      return errorResponse("PHOTO_INVALID_IMAGE", "ไม่สามารถประมวลผลรูปภาพนี้ได้ กรุณาใช้ไฟล์ JPG, PNG หรือ WebP อื่น", 400);
    }

    const fileName = generateStoryImagePath();
    const adminSupabase = createSupabaseServiceRoleClient();
    const { data, error } = await adminSupabase.storage
      .from("site-media")
      .upload(fileName, processedBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      console.error("Story image storage upload failed:", error.message);
      return errorResponse("STORAGE_UPLOAD_FAILED", "ไม่สามารถบันทึกรูปภาพได้ กรุณาลองอีกครั้ง", 500);
    }

    const imageUrl = siteMediaImageUrl(data?.path ?? fileName);

    if (!imageUrl) {
      return errorResponse("STORAGE_PATH_INVALID", "ไม่สามารถสร้างลิงก์รูปภาพได้ กรุณาลองอีกครั้ง", 500);
    }

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Story image upload error:", error instanceof Error ? error.message : "unknown error");
    return errorResponse("UPLOAD_FAILED", "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองอีกครั้ง", 500);
  }
}

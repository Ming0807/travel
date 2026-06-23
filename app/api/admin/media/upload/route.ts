import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import {
  AdminImageUploadError,
  ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES,
  ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
  processAdminImageToWebp,
} from "@/lib/services/admin-image-processing.service";
import { uploadPrivateFile } from "@/lib/storage/private-files";
import { rateLimit } from "@/lib/utils/rate-limit";
import { adminMediaEntityTypes } from "@/lib/validation/media";

export const runtime = "nodejs";

const ALLOWED_ENTITY_TYPES = new Set<string>(adminMediaEntityTypes);
const CONTENT_MEDIA_MAX_WIDTH = 1920;
const CONTENT_MEDIA_QUALITY = 80;

function adminImageUploadMessage(error: AdminImageUploadError) {
  switch (error.code) {
    case "IMAGE_EMPTY":
      return "กรุณาเลือกไฟล์รูปภาพที่ไม่ว่างเปล่า";
    case "IMAGE_INVALID_TYPE":
      return "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP";
    case "IMAGE_TOO_LARGE":
      return `ไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน ${ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB}MB`;
    case "IMAGE_TOO_MANY_PIXELS":
      return "รูปภาพละเอียดเกินไป กรุณาลดขนาดรูปก่อนอัปโหลด";
    default:
      return "ไม่สามารถประมวลผลรูปภาพได้ กรุณาใช้ไฟล์ JPG, PNG หรือ WebP อื่น";
  }
}

function invalidOwner(entityType: string | null, entityId: string | null) {
  return (
    !entityType ||
    !entityId ||
    !ALLOWED_ENTITY_TYPES.has(entityType) ||
    !Number.isInteger(Number(entityId)) ||
    Number(entityId) <= 0
  );
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requirePermission("media.upload");

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip, 20, 60 * 1000);

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "อัปโหลดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const entityId = formData.get("entityId") as string | null;
    const entityType = formData.get("entityType") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์ก่อนอัปโหลด" },
        { status: 400 },
      );
    }

    if (invalidOwner(entityType, entityId)) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลเจ้าของสื่อไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const logicalPath = `content-media/${entityType}/${year}/${month}/${entityId}/${uuid}.webp`;

    const processed = await processAdminImageToWebp(file, {
      allowedMimeTypes: ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES,
      maxSizeMb: ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
      maxWidth: CONTENT_MEDIA_MAX_WIDTH,
      quality: CONTENT_MEDIA_QUALITY,
    });

    const uploaded = await uploadPrivateFile({
      bucket: "visit-photos",
      path: logicalPath,
      data: processed.buffer,
      contentType: processed.contentType,
    });

    await logAdminAction({
      adminId: guard.adminId,
      action: "media.content_upload",
      entityType: "content_media",
      entityId: `${entityType}:${entityId}`,
      details: {
        ownerType: entityType,
        ownerId: Number(entityId),
        contentType: processed.contentType,
        sizeBytes: uploaded.sizeBytes,
        width: processed.width,
        height: processed.height,
      },
    });

    return NextResponse.json({
      success: true,
      storagePath: uploaded.storagePath,
      displayUrl: uploaded.storagePath,
      contentType: uploaded.contentType,
      sizeBytes: uploaded.sizeBytes,
      width: processed.width,
      height: processed.height,
    });
  } catch (error: unknown) {
    console.error("Admin media upload error:", error);

    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 },
      );
    }

    if (error instanceof AdminImageUploadError) {
      return NextResponse.json(
        { success: false, error: adminImageUploadMessage(error) },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, error: "อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 500 },
    );
  }
}

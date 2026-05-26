import { NextRequest, NextResponse } from "next/server";
import { uploadPrivateFile } from "@/lib/storage/private-files";
import { getServerEnv } from "@/lib/config/server-env";
import { rateLimit } from "@/lib/utils/rate-limit";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { adminMediaEntityTypes } from "@/lib/validation/media";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_ENTITY_TYPES = new Set<string>(adminMediaEntityTypes);
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    await requirePermission("media.upload");

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip, 20, 60 * 1000);

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "Too many upload requests. Please wait." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const entityId = formData.get("entityId") as string | null;
    const entityType = formData.get("entityType") as string | null;

    if (!file || !entityId || !entityType) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์ก่อนอัปโหลด" },
        { status: 400 }
      );
    }

    if (!ALLOWED_ENTITY_TYPES.has(entityType) || !Number.isInteger(Number(entityId)) || Number(entityId) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid media owner." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `ไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน ${MAX_SIZE_MB}MB` },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extensionMap[file.type] || "jpg";

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const logicalPath = `content-media/${entityType}/${year}/${month}/${entityId}/${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadPrivateFile({
      bucket: "visit-photos", // Re-use existing bucket for attraction media
      path: logicalPath,
      data: buffer,
      contentType: file.type,
    });

    // For Cloudinary, the storagePath is the reference string
    // For Supabase, we need to build a public URL
    let displayUrl: string;
    const env = getServerEnv();

    if (env.STORAGE_PROVIDER === "cloudinary") {
      // For cloudinary references, we can't directly display them
      // Return the storage reference and let the frontend handle it
      displayUrl = uploaded.storagePath;
    } else {
      // For Supabase, construct a URL
      displayUrl = uploaded.storagePath;
    }

    return NextResponse.json({
      success: true,
      storagePath: uploaded.storagePath,
      displayUrl,
      contentType: uploaded.contentType,
      sizeBytes: uploaded.sizeBytes,
    });
  } catch (error: unknown) {
    console.error("Admin media upload error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

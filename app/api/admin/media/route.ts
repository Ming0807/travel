import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import {
  AdminImageUploadError,
  ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES,
  ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
  readAndValidateAdminImageFile,
  renderAdminImageWebpVariant,
} from "@/lib/services/admin-image-processing.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { rateLimit } from "@/lib/utils/rate-limit";
import {
  normalizeAdminMediaAssetForClient,
  type AdminMediaAssetClientRow,
} from "@/lib/media/admin-media-contract";

export const runtime = "nodejs";

const MEDIA_ASSET_MAX_WIDTH = 1920;
const MEDIA_ASSET_QUALITY = 80;
const MEDIA_ASSET_THUMBNAIL_WIDTH = 400;
const MEDIA_ASSET_THUMBNAIL_QUALITY = 70;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

function withMediaUrls(asset: AdminMediaAssetClientRow) {
  return {
    ...asset,
    url: siteMediaImageUrl(asset.storage_path) ?? "",
    thumbnail_url: asset.thumbnail_storage_path
      ? siteMediaImageUrl(asset.thumbnail_storage_path)
      : null,
  };
}

function isMissingThumbnailColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return (
    record.code === "PGRST204" &&
    typeof record.message === "string" &&
    record.message.includes("thumbnail_storage_path")
  );
}

function adminMediaUploadMessage(error: AdminImageUploadError) {
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

function safeCategorySegment(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/g, "") || "general";
}

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission("media.read");
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const lifecycleStatus = searchParams.get("lifecycle_status");

    const query = supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query.eq("category", category);
    }

    if (lifecycleStatus === "all") {
      // No filter; show active, archived, and historical records.
    } else if (lifecycleStatus === "archived") {
      query.eq("lifecycle_status", "archived");
    } else {
      query.eq("lifecycle_status", "active");
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const assets = (data ?? []).map((asset) => withMediaUrls(normalizeAdminMediaAssetForClient(asset)));

    return NextResponse.json(assets);
  } catch (error: unknown) {
    console.error("Error fetching media assets:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let uploadedStoragePath: string | null = null;
  let uploadedThumbnailPath: string | null = null;

  try {
    const guard = await requirePermission("media.upload");
    const limit = rateLimit(`media-library:${getClientIp(req)}`, 20, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "อัปโหลดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string | null) || "General";

    if (!file) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์ก่อนอัปโหลด" }, { status: 400 });
    }

    const decoded = await readAndValidateAdminImageFile(file, {
      allowedMimeTypes: ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES,
      maxSizeMb: ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
    });

    const mainImage = await renderAdminImageWebpVariant(decoded.inputBuffer, {
      maxWidth: MEDIA_ASSET_MAX_WIDTH,
      quality: MEDIA_ASSET_QUALITY,
    });

    let thumbnailBuffer: Buffer | null = null;
    try {
      const thumbnail = await renderAdminImageWebpVariant(decoded.inputBuffer, {
        maxWidth: MEDIA_ASSET_THUMBNAIL_WIDTH,
        quality: MEDIA_ASSET_THUMBNAIL_QUALITY,
      });
      thumbnailBuffer = thumbnail.buffer;
    } catch (error) {
      console.warn("Thumbnail generation failed, skipping:", error);
    }

    const uuid = crypto.randomUUID();
    const safeCategory = safeCategorySegment(category);
    const storagePath = `${safeCategory}/${uuid}.webp`;
    const thumbnailStoragePath = `${safeCategory}/${uuid}_thumb.webp`;
    const adminSupabase = createSupabaseServiceRoleClient();

    const { error: uploadError } = await adminSupabase.storage
      .from("site-media")
      .upload(storagePath, mainImage.buffer, {
        contentType: mainImage.contentType,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }
    uploadedStoragePath = storagePath;

    if (thumbnailBuffer) {
      const { error: thumbUploadError } = await adminSupabase.storage
        .from("site-media")
        .upload(thumbnailStoragePath, thumbnailBuffer, {
          contentType: "image/webp",
          upsert: false,
        });

      if (thumbUploadError) {
        console.warn("Thumbnail upload failed, continuing without it:", thumbUploadError);
        thumbnailBuffer = null;
      } else {
        uploadedThumbnailPath = thumbnailStoragePath;
      }
    }

    const insertPayload = {
      file_name: file.name || "upload.webp",
      storage_path: storagePath,
      mime_type: mainImage.contentType,
      size_bytes: mainImage.sizeBytes,
      category,
      uploaded_by: guard.authUserId,
    };

    const insertPayloadWithThumbnail = {
      ...insertPayload,
      thumbnail_storage_path: thumbnailBuffer ? thumbnailStoragePath : null,
    };

    let { data: asset, error: dbError } = await adminSupabase
      .from("media_assets")
      .insert(insertPayloadWithThumbnail)
      .select()
      .single();

    if (isMissingThumbnailColumnError(dbError)) {
      if (uploadedThumbnailPath) {
        await adminSupabase.storage.from("site-media").remove([uploadedThumbnailPath]);
        uploadedThumbnailPath = null;
        thumbnailBuffer = null;
      }

      const fallbackInsert = await adminSupabase
        .from("media_assets")
        .insert(insertPayload)
        .select()
        .single();

      asset = fallbackInsert.data;
      dbError = fallbackInsert.error;
    }

    if (dbError) {
      const pathsToRemove = [uploadedStoragePath, uploadedThumbnailPath].filter((path): path is string => Boolean(path));
      if (pathsToRemove.length) {
        await adminSupabase.storage.from("site-media").remove(pathsToRemove);
      }
      throw dbError;
    }

    const clientAsset = withMediaUrls(normalizeAdminMediaAssetForClient(asset));

    await logAdminAction({
      adminId: guard.adminId,
      action: "media.library_upload",
      entityType: "media_asset",
      entityId: clientAsset.id || storagePath,
      details: {
        category,
        contentType: mainImage.contentType,
        sizeBytes: mainImage.sizeBytes,
        width: mainImage.width,
        height: mainImage.height,
        thumbnail: Boolean(thumbnailBuffer),
      },
    });

    return NextResponse.json({
      success: true,
      asset: clientAsset,
    });
  } catch (error: unknown) {
    console.error("Media upload error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    if (error instanceof AdminImageUploadError) {
      return NextResponse.json({ error: adminMediaUploadMessage(error) }, { status: error.status });
    }

    return NextResponse.json(
      { error: "อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง" },
      { status: 500 },
    );
  }
}

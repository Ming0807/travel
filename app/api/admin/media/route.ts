import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_MB = 10;

export async function GET(req: NextRequest) {
  try {
    await requirePermission("media.read");
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const lifecycleStatus = searchParams.get("lifecycle_status");

    const query = supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase table type not in generated types
      .from("media_assets" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query.eq("category", category);
    }

    // Filter by lifecycle: default to active; "all" shows everything
    if (lifecycleStatus === "all") {
      // No filter — show all including archived
    } else if (lifecycleStatus === "archived") {
      query.eq("lifecycle_status", "archived");
    } else {
      query.eq("lifecycle_status", "active");
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Construct public URLs via /site-media/ proxy (resilient to missing files)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase query returns untyped rows
    const assets = data.map((asset: any) => ({
      ...asset,
      url: `/site-media/${asset.storage_path}`,
      thumbnail_url: asset.thumbnail_storage_path
        ? `/site-media/${asset.thumbnail_storage_path}`
        : null,
    }));

    return NextResponse.json(assets);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- catch clause
  } catch (error: any) {
    console.error("Error fetching media assets:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requirePermission("media.upload");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string || "General";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_SIZE_MB}MB limit.` },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload";
    const uuid = crypto.randomUUID();
    const safeCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const storagePath = `${safeCategory}/${uuid}.webp`;
    const thumbnailStoragePath = `${safeCategory}/${uuid}_thumb.webp`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- Image processing: WebP conversion + thumbnail generation ---
    let webpBuffer: Buffer;
    let thumbnailBuffer: Buffer | null = null;

    try {
      const sharp = (await import("sharp")).default;
      webpBuffer = await sharp(buffer)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      try {
        thumbnailBuffer = await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer();
      } catch (thumbErr) {
        console.warn("Thumbnail generation failed, skipping:", thumbErr);
        thumbnailBuffer = null;
      }
    } catch (sharpErr) {
      console.error("Sharp processing failed:", sharpErr);
      return NextResponse.json(
        { error: "ไม่สามารถประมวลผลภาพได้ กรุณาลองอีกครั้งหรือใช้ไฟล์อื่น" },
        { status: 500 },
      );
    }
    // --- End image processing ---

    // Use Service Role to upload and bypass RLS if needed, though Admin should have access
    const adminSupabase = createSupabaseServiceRoleClient();
    
    // Upload main WebP to Storage
    const { error: uploadError } = await adminSupabase.storage
      .from("site-media")
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Upload thumbnail if generated
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
      }
    }

    // Insert to Database
    const { data: asset, error: dbError } = await adminSupabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase table type not in generated types
      .from("media_assets" as any)
      .insert({
        file_name: originalName,
        storage_path: storagePath,
        mime_type: "image/webp",
        size_bytes: webpBuffer.length,
        category: category,
        uploaded_by: guard.authUserId,
        thumbnail_storage_path: thumbnailBuffer ? thumbnailStoragePath : null,
      })
      .select()
      .single();

    if (dbError) {
      // Rollback storage if DB fails
      const pathsToRemove = [storagePath];
      if (thumbnailBuffer) pathsToRemove.push(thumbnailStoragePath);
      await adminSupabase.storage.from("site-media").remove(pathsToRemove);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      asset: {
        ...asset,
        url: `/site-media/${asset.storage_path}`,
        thumbnail_url: asset.thumbnail_storage_path
          ? `/site-media/${asset.thumbnail_storage_path}`
          : null,
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- catch clause
  } catch (error: any) {
    console.error("Media upload error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

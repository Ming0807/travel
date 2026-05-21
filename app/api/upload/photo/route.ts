import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { handlePhotoUploadMetadata } from "@/lib/services/photo-upload.service";
import { getServerEnv } from "@/lib/config/server-env";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";
import { parseAllowedTouristImageMimeTypes, validateTouristImageFile } from "@/lib/validation/upload";
import { rateLimit } from "@/lib/utils/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip, 10, 60 * 1000); // 10 uploads per minute per IP
    
    if (!limit.success) {
      return NextResponse.json({ error: "Too many upload requests. Please wait a moment." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const visitIdStr = formData.get("visitId") as string | null;

    if (!file || !visitIdStr) {
      return NextResponse.json({ error: "Missing file or visit ID" }, { status: 400 });
    }

    const visitIdResult = uuidSchema.safeParse(visitIdStr);
    if (!visitIdResult.success) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการเข้าชมนี้" }, { status: 404 });
    }
    const visitId = visitIdResult.data;
    
    const serverEnv = getServerEnv();
    const allowedMimeTypes = parseAllowedTouristImageMimeTypes(serverEnv.ALLOWED_TOURIST_IMAGE_MIME_TYPES);
    const fileValidation = validateTouristImageFile({
      mimeType: file.type,
      sizeBytes: file.size,
      allowedMimeTypes,
      maxSizeMb: serverEnv.MAX_UPLOAD_IMAGE_SIZE_MB
    });

    if (!fileValidation.success) {
      return NextResponse.json({ error: fileValidation.message, code: fileValidation.code }, { status: 400 });
    }

    // Generate path
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const storagePath = `visit-photos/${year}/${month}/${visitId}/${uuid}.${fileValidation.extension}`;

    // Upload to Supabase Storage
    const supabase = createSupabaseServiceRoleClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("visit-photos")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    let photoId: string;
    try {
      photoId = await handlePhotoUploadMetadata({
        visitId,
        storagePath,
        originalFilename: "tourist-upload",
        mimeType: file.type,
        fileSizeBytes: file.size
      });
    } catch (error) {
      await supabase.storage.from("visit-photos").remove([storagePath]);
      throw error;
    }

    const previewUrl = await createPrivateFileSignedUrl("visit-photos", storagePath, serverEnv.CERTIFICATE_SIGNED_URL_TTL_SECONDS);

    return NextResponse.json({ 
      success: true, 
      photoId, 
      previewUrl,
      expiresIn: serverEnv.CERTIFICATE_SIGNED_URL_TTL_SECONDS
    });
  } catch (error: unknown) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

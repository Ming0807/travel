import "server-only";
import crypto from "crypto";
import sharp from "sharp";
import { getServerEnv } from "@/lib/config/server-env";
import { updateVisitStatus } from "@/lib/repositories/visit.repository";
import { createVisitPhoto } from "@/lib/repositories/visit-photo.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { createPrivateFileSignedUrl, deletePrivateFile, uploadPrivateFile } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";
import { parseAllowedTouristImageMimeTypes, validateTouristImageFile } from "@/lib/validation/upload";

const VISIT_PHOTO_MAX_PIXELS = 25_000_000;
const VISIT_PHOTO_MAX_WIDTH = 1920;
const VISIT_PHOTO_QUALITY = 80;

type VisitForUpload = {
  checkin_code_id?: number | null;
  attraction_id?: number | null;
  tourist_id?: string | null;
};

export type UploadableVisitPhotoFile = {
  name?: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type PhotoUploadErrorCode =
  | "PHOTO_REQUIRED"
  | "PHOTO_EMPTY"
  | "PHOTO_INVALID_TYPE"
  | "PHOTO_TOO_LARGE"
  | "PHOTO_TOO_MANY_PIXELS"
  | "PHOTO_INVALID_IMAGE"
  | "VISIT_NOT_FOUND"
  | "VISIT_ACCESS_DENIED"
  | "STORAGE_UPLOAD_FAILED"
  | "PHOTO_METADATA_FAILED"
  | "SIGNED_URL_CREATE_FAILED"
  | "UPLOAD_FAILED";

export class PhotoUploadError extends Error {
  constructor(
    public readonly code: PhotoUploadErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "PhotoUploadError";
  }
}

function photoUploadMessage(code: string, maxSizeMb: number) {
  switch (code) {
    case "PHOTO_REQUIRED":
      return "กรุณาเลือกรูปภาพ";
    case "PHOTO_EMPTY":
      return "ไฟล์รูปภาพว่างเปล่า กรุณาเลือกรูปภาพใหม่";
    case "PHOTO_INVALID_TYPE":
      return "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP เท่านั้น";
    case "PHOTO_TOO_LARGE":
      return `รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน ${maxSizeMb}MB`;
    case "PHOTO_TOO_MANY_PIXELS":
      return "รูปภาพละเอียดเกินไป กรุณาลดขนาดรูปก่อนอัปโหลด";
    case "PHOTO_INVALID_IMAGE":
      return "ไม่สามารถอ่านรูปภาพนี้ได้ กรุณาใช้ไฟล์ JPG, PNG หรือ WebP อื่น";
    case "VISIT_NOT_FOUND":
    case "VISIT_ACCESS_DENIED":
      return "ไม่พบสิทธิ์อัปโหลดรูปสำหรับการเข้าชมนี้";
    case "STORAGE_UPLOAD_FAILED":
      return "ไม่สามารถบันทึกรูปภาพได้ กรุณาลองอีกครั้ง";
    case "SIGNED_URL_CREATE_FAILED":
      return "อัปโหลดรูปแล้ว แต่ไม่สามารถเปิดภาพตัวอย่างได้ กรุณาลองอีกครั้ง";
    case "PHOTO_METADATA_FAILED":
      return "อัปโหลดรูปแล้ว แต่ไม่สามารถบันทึกข้อมูลรูปได้ กรุณาลองอีกครั้ง";
    default:
      return "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองอีกครั้ง";
  }
}

export function isUploadableVisitPhotoFile(value: unknown): value is UploadableVisitPhotoFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value
  );
}

function generateVisitPhotoPath(visitId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `visit-photos/${year}/${month}/${visitId}/${crypto.randomUUID()}.webp`;
}

async function optimizeVisitPhoto(file: UploadableVisitPhotoFile) {
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const metadata = await sharp(buffer, {
      failOn: "error",
      limitInputPixels: VISIT_PHOTO_MAX_PIXELS,
    }).metadata();

    if (!metadata.width || !metadata.height) {
      throw new PhotoUploadError("PHOTO_INVALID_IMAGE", photoUploadMessage("PHOTO_INVALID_IMAGE", 0), 400);
    }

    if (metadata.width * metadata.height > VISIT_PHOTO_MAX_PIXELS) {
      throw new PhotoUploadError("PHOTO_TOO_MANY_PIXELS", photoUploadMessage("PHOTO_TOO_MANY_PIXELS", 0), 400);
    }

    return await sharp(buffer, {
      failOn: "error",
      limitInputPixels: VISIT_PHOTO_MAX_PIXELS,
    })
      .rotate()
      .resize({ width: VISIT_PHOTO_MAX_WIDTH, height: VISIT_PHOTO_MAX_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: VISIT_PHOTO_QUALITY })
      .toBuffer();
  } catch (error) {
    if (error instanceof PhotoUploadError) throw error;
    throw new PhotoUploadError("PHOTO_INVALID_IMAGE", photoUploadMessage("PHOTO_INVALID_IMAGE", 0), 400);
  }
}

export async function verifyVisitOwnershipForUpload(visitId: string) {
  try {
    const { visit } = await requireTouristVisitAccess(visitId);
    return { status: "valid" as const, visit };
  } catch {
    return { status: "not_found" as const };
  }
}

export async function handlePhotoUploadMetadata(params: {
  visitId: string;
  storagePath: string;
  originalFilename?: string;
  mimeType: string;
  fileSizeBytes: number;
}) {
  // 1. Verify ownership/visit
  const verification = await verifyVisitOwnershipForUpload(params.visitId);
  if (verification.status !== "valid") {
    throw new Error("Invalid visit for photo upload.");
  }

  // 2. Check if already uploaded (maybe replace or ignore)
  // const existingPhoto = await getPhotoByVisitId(params.visitId);

  // 3. Create photo record
  const photoId = await createVisitPhoto({
    visitId: params.visitId,
    storagePath: params.storagePath,
    originalFilename: params.originalFilename,
    mimeType: params.mimeType,
    fileSizeBytes: params.fileSizeBytes,
    approvalStatus: "approved", // MVP rule
  });

  // 4. Update visit status
  await updateVisitStatus(params.visitId, "photo_uploaded");

  // 5. Funnel event
  const v = verification.visit as VisitForUpload;
  await recordFunnelEvent({
    eventName: "photo_uploaded",
    checkinCodeId: v.checkin_code_id ?? undefined,
    attractionId: v.attraction_id ?? undefined,
    touristId: v.tourist_id ?? undefined,
    visitId: String(params.visitId)
  });

  return photoId;
}

export async function processVisitPhotoUpload(params: {
  visitId: string;
  file: UploadableVisitPhotoFile;
}) {
  const visitIdResult = uuidSchema.safeParse(params.visitId);
  if (!visitIdResult.success) {
    throw new PhotoUploadError("VISIT_NOT_FOUND", photoUploadMessage("VISIT_NOT_FOUND", 0), 404);
  }

  if (!params.file || params.file.size <= 0) {
    throw new PhotoUploadError("PHOTO_REQUIRED", photoUploadMessage("PHOTO_REQUIRED", 0), 400);
  }

  const serverEnv = getServerEnv();
  const allowedMimeTypes = parseAllowedTouristImageMimeTypes(serverEnv.ALLOWED_TOURIST_IMAGE_MIME_TYPES);
  const fileValidation = validateTouristImageFile({
    mimeType: params.file.type,
    sizeBytes: params.file.size,
    allowedMimeTypes,
    maxSizeMb: serverEnv.MAX_UPLOAD_IMAGE_SIZE_MB,
  });

  if (!fileValidation.success) {
    throw new PhotoUploadError(
      fileValidation.code as PhotoUploadErrorCode,
      photoUploadMessage(fileValidation.code, serverEnv.MAX_UPLOAD_IMAGE_SIZE_MB),
      400,
    );
  }

  try {
    await requireTouristVisitAccess(visitIdResult.data);
  } catch {
    throw new PhotoUploadError("VISIT_ACCESS_DENIED", photoUploadMessage("VISIT_ACCESS_DENIED", 0), 404);
  }

  const processedBuffer = await optimizeVisitPhoto(params.file);
  const logicalPath = generateVisitPhotoPath(visitIdResult.data);

  let storagePath: string;
  try {
    const uploaded = await uploadPrivateFile({
      bucket: "visit-photos",
      path: logicalPath,
      data: processedBuffer,
      contentType: "image/webp",
    });
    storagePath = uploaded.storagePath;
  } catch {
    throw new PhotoUploadError("STORAGE_UPLOAD_FAILED", photoUploadMessage("STORAGE_UPLOAD_FAILED", 0), 500);
  }

  let photoId: string;
  try {
    photoId = await handlePhotoUploadMetadata({
      visitId: visitIdResult.data,
      storagePath,
      originalFilename: "tourist-upload.webp",
      mimeType: "image/webp",
      fileSizeBytes: processedBuffer.byteLength,
    });
  } catch (error) {
    try {
      await deletePrivateFile({ bucket: "visit-photos", path: storagePath });
    } catch (cleanupError) {
      console.error("Photo storage cleanup failed:", cleanupError instanceof Error ? cleanupError.message : "unknown error");
    }

    if (error instanceof PhotoUploadError) throw error;
    throw new PhotoUploadError("PHOTO_METADATA_FAILED", photoUploadMessage("PHOTO_METADATA_FAILED", 0), 500);
  }

  try {
    const previewUrl = await createPrivateFileSignedUrl(
      "visit-photos",
      storagePath,
      serverEnv.CERTIFICATE_SIGNED_URL_TTL_SECONDS,
    );

    return {
      photoId,
      previewUrl,
      expiresIn: serverEnv.CERTIFICATE_SIGNED_URL_TTL_SECONDS,
    };
  } catch {
    throw new PhotoUploadError("SIGNED_URL_CREATE_FAILED", photoUploadMessage("SIGNED_URL_CREATE_FAILED", 0), 500);
  }
}

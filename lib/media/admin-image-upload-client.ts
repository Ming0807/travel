import { prepareVisitPhotoForUpload } from "@/lib/media/client-photo-compression";

const MEBIBYTE = 1024 * 1024;

export const ADMIN_IMAGE_MAX_SOURCE_BYTES = 10 * MEBIBYTE;
export const ADMIN_IMAGE_UPLOAD_TARGET_BYTES = 3.5 * MEBIBYTE;

const ADMIN_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type AdminImageUploadStage = "preparing" | "uploading";

type UploadAdminImageOptions = {
  endpoint: string;
  file: File;
  fields?: Record<string, string>;
  onStage?: (stage: AdminImageUploadStage) => void;
};

function preparedFilename(filename: string) {
  const basename = filename.trim().replace(/\.[^.]+$/, "") || "admin-image";
  return `${basename}.webp`;
}

export function validateAdminImageSource(file: File) {
  const normalizedType = file.type.toLowerCase();
  const extensionAllowed = /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!ADMIN_IMAGE_TYPES.has(normalizedType) && !extensionAllowed) {
    return "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP";
  }
  if (file.size <= 0) {
    return "ไฟล์รูปภาพว่างเปล่า กรุณาเลือกรูปใหม่";
  }
  if (file.size > ADMIN_IMAGE_MAX_SOURCE_BYTES) {
    return "ไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ต้นฉบับไม่เกิน 10MB";
  }

  return null;
}

export async function prepareAdminImageForUpload(file: File) {
  const validationError = validateAdminImageSource(file);
  if (validationError) throw new Error(validationError);

  // Admin content and visit photos share the same browser-safe WebP encoder,
  // while keeping separate validation, endpoints, permissions, and storage.
  const prepared = await prepareVisitPhotoForUpload(file);
  if (prepared.file.size > ADMIN_IMAGE_UPLOAD_TARGET_BYTES) {
    throw new Error("รูปยังมีขนาดใหญ่เกินไปหลังปรับขนาด กรุณาเลือกรูปอื่น");
  }

  return {
    ...prepared,
    file: new File([prepared.file], preparedFilename(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    }),
  };
}

export async function uploadAdminImage<T>({
  endpoint,
  file,
  fields = {},
  onStage,
}: UploadAdminImageOptions): Promise<{
  data: T;
  originalBytes: number;
  uploadBytes: number;
}> {
  onStage?.("preparing");
  const prepared = await prepareAdminImageForUpload(file);
  const body = new FormData();
  body.set("file", prepared.file);
  Object.entries(fields).forEach(([key, value]) => body.set(key, value));

  onStage?.("uploading");
  let response: Response;
  try {
    response = await fetch(endpoint, { method: "POST", body });
  } catch {
    throw new Error("เชื่อมต่อไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่");
  }

  if (response.status === 413) {
    throw new Error("รูปใหญ่เกินขีดจำกัดการส่ง แม้ปรับขนาดแล้ว กรุณาเลือกรูปอื่น");
  }

  const data = await response.json().catch(() => null) as T | ({ error?: string }) | null;
  if (!response.ok) {
    const error = data && typeof data === "object" && "error" in data
      ? data.error
      : null;
    throw new Error(typeof error === "string" && error ? error : "อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
  }
  if (!data) {
    throw new Error("ระบบตอบกลับไม่สมบูรณ์ กรุณาลองอัปโหลดอีกครั้ง");
  }

  return {
    data: data as T,
    originalBytes: prepared.originalBytes,
    uploadBytes: prepared.uploadBytes,
  };
}

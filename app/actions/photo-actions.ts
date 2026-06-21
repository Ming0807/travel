"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isUploadableVisitPhotoFile,
  PhotoUploadError,
  processVisitPhotoUpload,
} from "@/lib/services/photo-upload.service";

export type PhotoUploadState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function uploadVisitPhoto(
  _prevState: PhotoUploadState,
  formData: FormData,
): Promise<PhotoUploadState> {
  const visitId = formData.get("visitId");
  const file = formData.get("photo");

  if (typeof visitId !== "string" || !visitId.trim()) {
    return { errors: { _form: ["ไม่พบข้อมูลการเข้าชมนี้"] } };
  }

  if (!isUploadableVisitPhotoFile(file)) {
    return { errors: { photo: ["กรุณาเลือกรูปภาพ"] } };
  }

  let photoId: string;

  try {
    const result = await processVisitPhotoUpload({ visitId, file });
    photoId = result.photoId;
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      const field = error.code.startsWith("PHOTO_") ? "photo" : "_form";
      return { errors: { [field]: [error.message] } };
    }

    console.error("Photo upload action failed:", error instanceof Error ? error.message : "unknown error");
    return { errors: { _form: ["ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองอีกครั้ง"] } };
  }

  revalidatePath(`/visit/${visitId}`);
  redirect(`/visit/${visitId}/certificate/preview?photoId=${photoId}`);
}

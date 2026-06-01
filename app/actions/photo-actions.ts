"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getGuestIdentity } from "@/lib/auth/guest";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { handlePhotoUploadMetadata } from "@/lib/services/photo-upload.service";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type PhotoUploadState = {
  errors?: Record<string, string[]>;
  message?: string;
};

/**
 * Server Action: uploadVisitPhoto
 * 
 * Handles photo upload for a visit. Stores the image in Supabase Storage
 * and creates a visit_photo record.
 */
export async function uploadVisitPhoto(
  visitId: string,
  prevState: PhotoUploadState,
  formData: FormData
): Promise<PhotoUploadState> {
  // These need to be accessible after the try/catch for the redirect
  let photoId: string;
  let storagePath: string;

  try {
    // 1. Verify visit exists and belongs to this tourist
    const guestToken = await getGuestIdentity();
    const visit = await getVisitById(visitId);

    if (!visit) {
      return { errors: { _form: ["ไม่พบข้อมูลการเข้าชม"] } };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = visit as any;

    // Verify guest ownership via tourist_identities
    if (guestToken) {
      const supabase = createSupabaseServiceRoleClient();
      const { data: identity } = await supabase
        .from("tourist_identities")
        .select("tourist_id")
        .eq("provider", "anonymous_device")
        .eq("provider_user_id", guestToken)
        .eq("tourist_id", v.tourist_id)
        .maybeSingle();

      if (!identity) {
        return { errors: { _form: ["คุณไม่มีสิทธิ์อัปโหลดรูปสำหรับการเข้าชมนี้"] } };
      }
    }

    // 2. Get the file
    const file = formData.get("photo") as File | null;
    if (!file || file.size === 0) {
      return { errors: { photo: ["กรุณาเลือกรูปภาพ"] } };
    }

    // 3. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { errors: { photo: ["รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น"] } };
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { errors: { photo: ["รูปภาพต้องมีขนาดไม่เกิน 10MB"] } };
    }

    // 5. Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Upload to Supabase Storage
    const supabase = createSupabaseServiceRoleClient();
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `visits/${visitId}/photo-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("visit-photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return { errors: { _form: ["ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่"] } };
    }

    // 7. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("visit-photos")
      .getPublicUrl(fileName);

    storagePath = publicUrlData?.publicUrl || fileName;

    // 8. Create visit_photo record
    photoId = await handlePhotoUploadMetadata({
      visitId,
      storagePath: fileName,
      originalFilename: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    if (error instanceof Response) throw error; // Defensive — shouldn't happen in server actions
    return { errors: { _form: ["เกิดข้อผิดพลาด กรุณาลองใหม่"] } };
  }

  // Redirect MUST be outside try/catch so Next.js can handle the RedirectError
  revalidatePath(`/visit/${visitId}`);
  redirect(`/visit/${visitId}/certificate/preview?photoId=${photoId}&previewUrl=${encodeURIComponent(storagePath)}`);
}

import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export interface CreateVisitPhotoParams {
  visitId: string;
  storagePath: string;
  originalFilename?: string;
  mimeType: string;
  fileSizeBytes: number;
  approvalStatus: "pending" | "approved" | "rejected";
}

export async function createVisitPhoto(params: CreateVisitPhotoParams) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("visit_photos")
    .insert({
      visit_id: params.visitId,
      storage_path: params.storagePath,
      original_filename: params.originalFilename || null,
      mime_type: params.mimeType,
      file_size_bytes: params.fileSizeBytes,
      approval_status: params.approvalStatus,
    })
    .select("photo_id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create visit photo record: ${error?.message}`);
  }

  return data.photo_id;
}

export async function getPhotoByVisitId(visitId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("visit_photos")
    .select("*")
    .eq("visit_id", visitId)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // Ignore not found error
    throw new Error(`Failed to fetch visit photo: ${error.message}`);
  }

  return data || null;
}

export async function getPhotoById(photoId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("visit_photos")
    .select("*")
    .eq("photo_id", photoId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch visit photo: ${error.message}`);
  }

  return data || null;
}

import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export interface CreateCertificateParams {
  visitId: string;
  templateId: number;
  photoId?: string;
  certificatePath: string;
}

export async function createCertificate(params: CreateCertificateParams) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      visit_id: params.visitId,
      template_id: params.templateId,
      photo_id: params.photoId || null,
      certificate_path: params.certificatePath,
      download_count: 0
    })
    .select("certificate_id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create certificate record: ${error?.message}`);
  }

  return data.certificate_id;
}

export async function getCertificateByVisitId(visitId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("visit_id", visitId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch certificate: ${error.message}`);
  }

  return data || null;
}

export async function incrementCertificateDownload(certificateId: string) {
  const supabase = createSupabaseServiceRoleClient();
  
  // Using RPC is ideal for incrementing, but for MVP we will just fetch and update or leave it basic if no RPC
  const { data: cert } = await supabase.from("certificates").select("download_count").eq("certificate_id", certificateId).single();
  
  if (cert) {
    await supabase.from("certificates").update({
      download_count: (cert.download_count || 0) + 1
    }).eq("certificate_id", certificateId);
  }
}

export async function listCertificatesForTourist(touristId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("certificates")
    .select(`
      certificate_id,
      generated_at,
      download_count,
      visits!inner (
        visit_id,
        visit_date,
        tourist_id,
        attractions (
          slug,
          name_th,
          name_en,
          provinces (
            province_name_th,
            province_name_en
          )
        )
      )
    `)
    .eq("visits.tourist_id", touristId)
    .order("generated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch certificate history: ${error.message}`);
  }

  return data || [];
}

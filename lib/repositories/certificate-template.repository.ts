import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type CertificateTemplateRow = {
  template_id: number;
  template_name: string;
  attraction_id: number | null;
  background_path: string | null;
  layout_config_json: unknown;
  language: string | null;
  is_default: boolean;
};

export type ActiveCertificateTemplate = {
  templateId: number;
  templateName: string;
  attractionId: number | null;
  backgroundPath: string | null;
  layoutConfig: unknown;
  language: string;
  isDefault: boolean;
  orientation: "landscape" | "portrait";
};

function resolveOrientation(layoutConfig: unknown): "landscape" | "portrait" {
  if (
    layoutConfig &&
    typeof layoutConfig === "object" &&
    "orientation" in layoutConfig &&
    (layoutConfig.orientation === "landscape" || layoutConfig.orientation === "portrait")
  ) {
    return layoutConfig.orientation;
  }
  return "landscape";
}

function mapTemplate(row: CertificateTemplateRow): ActiveCertificateTemplate {
  return {
    templateId: row.template_id,
    templateName: row.template_name,
    attractionId: row.attraction_id,
    backgroundPath: row.background_path,
    layoutConfig: row.layout_config_json,
    language: row.language || "th",
    isDefault: row.is_default,
    orientation: resolveOrientation(row.layout_config_json),
  };
}

export async function listActiveCertificateTemplatesForAttraction(
  attractionId: number
): Promise<ActiveCertificateTemplate[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .select(
      "template_id, template_name, attraction_id, background_path, layout_config_json, language, is_default"
    )
    .eq("is_active", true)
    .or(`attraction_id.eq.${attractionId},attraction_id.is.null`);

  if (error) throw new Error("CERTIFICATE_TEMPLATE_LOOKUP_FAILED");
  return ((data ?? []) as CertificateTemplateRow[]).map(mapTemplate);
}

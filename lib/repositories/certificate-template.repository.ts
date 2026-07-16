import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  normalizeCertificateTemplateLayout,
  type CertificateTemplateLayout,
} from "@/lib/certificate/certificate-template-layout";

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
  layoutConfig: CertificateTemplateLayout;
  language: string;
  isDefault: boolean;
  orientation: "landscape" | "portrait";
};

function mapTemplate(row: CertificateTemplateRow): ActiveCertificateTemplate {
  const layoutConfig = normalizeCertificateTemplateLayout(row.layout_config_json);
  return {
    templateId: row.template_id,
    templateName: row.template_name,
    attractionId: row.attraction_id,
    backgroundPath: row.background_path,
    layoutConfig,
    language: row.language || "th",
    isDefault: row.is_default,
    orientation: layoutConfig.orientation,
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

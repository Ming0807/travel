import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function createConsentRecord(params: {
  touristId: string;
  visitId?: string;
  consentVersion: string;
  purpose: string;
  consentType?: string;
  purposeKey?: string;
  hasConsented: boolean;
  source?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("consent_records")
    .insert({
      tourist_id: params.touristId,
      visit_id: params.visitId || null,
      consent_version: params.consentVersion,
      purpose: params.purpose,
      consent_type: params.consentType || null,
      purpose_key: params.purposeKey || null,
      has_consented: params.hasConsented,
      source: params.source || null,
      language: params.language || null,
      metadata_json: params.metadata || null,
    });

  if (error) {
    throw new Error(`Failed to record consent: ${error.message}`);
  }
}

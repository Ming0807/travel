import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

function normalizeString(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

export async function resolveCountryId(countryName: string | null): Promise<number | null> {
  if (!countryName) return null;
  const cleanName = normalizeString(countryName);
  if (!cleanName) return null;

  const supabase = createSupabaseServiceRoleClient();

  // Try English first
  let { data, error } = await supabase
    .from("countries")
    .select("country_id")
    .ilike("country_name_en", cleanName)
    .maybeSingle();

  if (error) throw new Error(`Database error resolving country: ${error.message}`);
  if (data) return data.country_id;

  // Try Thai
  let { data: thData, error: thError } = await supabase
    .from("countries")
    .select("country_id")
    .eq("country_name_th", cleanName)
    .maybeSingle();

  if (thError) throw new Error(`Database error resolving country: ${thError.message}`);
  if (thData) return thData.country_id;

  // Try ISO code
  let { data: isoData, error: isoError } = await supabase
    .from("countries")
    .select("country_id")
    .or(`iso2_code.ilike.${cleanName},iso3_code.ilike.${cleanName}`)
    .maybeSingle();

  if (isoError) throw new Error(`Database error resolving country ISO: ${isoError.message}`);
  if (isoData) return isoData.country_id;

  // Fallback to "Other"
  let { data: fallbackData, error: fallbackError } = await supabase
    .from("countries")
    .select("country_id")
    .ilike("country_name_en", "Other")
    .maybeSingle();

  if (fallbackError) throw new Error(`Database error resolving fallback country: ${fallbackError.message}`);
  if (fallbackData) return fallbackData.country_id;

  throw new Error("Cannot resolve origin country and fallback is missing");
}

export async function resolveProvinceId(provinceName: string | null): Promise<number | null> {
  if (!provinceName) return null;

  const cleanName = normalizeString(provinceName).replace(/^(จังหวัด|จ\.)\s*/, "").trim();
  if (!cleanName) return null;

  const supabase = createSupabaseServiceRoleClient();

  // Try Thai first (exact match preferred)
  let { data, error } = await supabase
    .from("provinces")
    .select("province_id")
    .ilike("province_name_th", cleanName)
    .maybeSingle();

  if (error) throw new Error(`Database error resolving province: ${error.message}`);
  if (data) return data.province_id;

  // Try English
  let { data: enData, error: enError } = await supabase
    .from("provinces")
    .select("province_id")
    .ilike("province_name_en", cleanName)
    .maybeSingle();

  if (enError) throw new Error(`Database error resolving province: ${enError.message}`);
  if (enData) return enData.province_id;

  // Fallback to "Prefer not to answer"
  let { data: fallbackData, error: fallbackError } = await supabase
    .from("provinces")
    .select("province_id")
    .ilike("province_name_en", "Prefer not to answer")
    .maybeSingle();

  if (fallbackError) throw new Error(`Database error resolving fallback province: ${fallbackError.message}`);
  if (fallbackData) return fallbackData.province_id;

  return null;
}

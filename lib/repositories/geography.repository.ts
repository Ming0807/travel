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
  const { data, error } = await supabase
    .from("countries")
    .select("country_id")
    .ilike("country_name_en", cleanName)
    .maybeSingle();

  if (error) throw new Error(`Database error resolving country: ${error.message}`);
  if (data) return data.country_id;

  // Try Thai
  const { data: thData, error: thError } = await supabase
    .from("countries")
    .select("country_id")
    .eq("country_name_th", cleanName)
    .maybeSingle();

  if (thError) throw new Error(`Database error resolving country: ${thError.message}`);
  if (thData) return thData.country_id;

  // Try ISO code strictly
  if (/^[A-Za-z]{2,3}$/.test(cleanName)) {
    const upperCode = cleanName.toUpperCase();
    const { data: isoData, error: isoError } = await supabase
      .from("countries")
      .select("country_id")
      .or(`iso2_code.eq.${upperCode},iso3_code.eq.${upperCode}`)
      .maybeSingle();

    if (isoError) throw new Error(`Database error resolving country ISO: ${isoError.message}`);
    if (isoData) return isoData.country_id;
  }

  // Fallback to "Other"
  const { data: fallbackData, error: fallbackError } = await supabase
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
  const { data, error } = await supabase
    .from("provinces")
    .select("province_id")
    .ilike("province_name_th", cleanName)
    .maybeSingle();

  if (error) throw new Error(`Database error resolving province: ${error.message}`);
  if (data) return data.province_id;

  // Try English
  const { data: enData, error: enError } = await supabase
    .from("provinces")
    .select("province_id")
    .ilike("province_name_en", cleanName)
    .maybeSingle();

  if (enError) throw new Error(`Database error resolving province: ${enError.message}`);
  if (enData) return enData.province_id;

  // Fallback to "Prefer not to answer"
  const { data: fallbackData, error: fallbackError } = await supabase
    .from("provinces")
    .select("province_id")
    .ilike("province_name_en", "Prefer not to answer")
    .maybeSingle();

  if (fallbackError) throw new Error(`Database error resolving fallback province: ${fallbackError.message}`);
  if (fallbackData) return fallbackData.province_id;

  return null;
}

import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type CheckinCountryOption = {
  id: number;
  labelTh: string;
  labelEn: string;
  iso2Code: string | null;
};

export type CheckinProvinceOption = {
  id: number;
  labelTh: string;
  labelEn: string;
};

export async function listCheckinCountries(): Promise<CheckinCountryOption[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("countries")
    .select("country_id, country_name_th, country_name_en, iso2_code")
    .eq("is_active", true)
    .order("country_name_th", { ascending: true });

  if (error) throw new Error(`Database error listing countries: ${error.message}`);
  return (data ?? [])
    .map((country) => ({
      id: Number(country.country_id),
      labelTh: country.country_name_th || country.country_name_en,
      labelEn: country.country_name_en,
      iso2Code: country.iso2_code,
    }))
    .sort((a, b) => {
      if (a.iso2Code === "TH") return -1;
      if (b.iso2Code === "TH") return 1;
      return a.labelTh.localeCompare(b.labelTh, "th");
    });
}

export async function listCheckinProvinces(): Promise<CheckinProvinceOption[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("provinces")
    .select("province_id, province_name_th, province_name_en")
    .eq("is_active", true)
    .order("province_name_th", { ascending: true });

  if (error) throw new Error(`Database error listing provinces: ${error.message}`);
  return (data ?? []).map((province) => ({
    id: Number(province.province_id),
    labelTh: province.province_name_th,
    labelEn: province.province_name_en,
  }));
}

export async function getCheckinOriginSelection(countryId: number, provinceId: number | null) {
  const supabase = createSupabaseServiceRoleClient();
  const [countryResult, provinceResult] = await Promise.all([
    supabase
      .from("countries")
      .select("country_id, iso2_code")
      .eq("country_id", countryId)
      .eq("is_active", true)
      .maybeSingle(),
    provinceId
      ? supabase
          .from("provinces")
          .select("province_id")
          .eq("province_id", provinceId)
          .eq("is_active", true)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (countryResult.error) throw new Error(`Database error validating country: ${countryResult.error.message}`);
  if (provinceResult.error) throw new Error(`Database error validating province: ${provinceResult.error.message}`);
  if (!countryResult.data) return null;

  const isThailand = countryResult.data.iso2_code === "TH";
  if (isThailand && (!provinceId || !provinceResult.data)) return null;

  return {
    countryId: Number(countryResult.data.country_id),
    provinceId: isThailand && provinceResult.data ? Number(provinceResult.data.province_id) : null,
    isThailand,
  };
}

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

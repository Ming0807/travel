import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function findTouristByIdentity(provider: string, providerUserId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourist_identities")
    .select("tourist_id")
    .eq("provider", provider)
    .eq("provider_user_id", providerUserId)
    .single();

  if (error || !data) return null;
  return data.tourist_id;
}

export async function createTouristProfile(params: {
  displayName: string;
  ageGroup: string;
  preferredLanguage?: string;
  originCountryId?: number | null;
  originProvinceId?: number | null;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourists")
    .insert({
      display_name: params.displayName,
      age_group: params.ageGroup,
      preferred_language: params.preferredLanguage || "th",
      origin_country_id: params.originCountryId || null,
      origin_province_id: params.originProvinceId || null,
    })
    .select("tourist_id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create tourist profile: ${error?.message}`);
  }

  return data.tourist_id;
}

export async function createTouristIdentity(touristId: string, provider: string, providerUserId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("tourist_identities")
    .insert({
      tourist_id: touristId,
      provider: provider,
      provider_user_id: providerUserId,
      is_primary: true,
    });

  if (error) {
    throw new Error(`Failed to create tourist identity: ${error.message}`);
  }
}

export async function getTouristById(touristId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourists")
    .select(`
      tourist_id,
      display_name,
      origin_country_id,
      origin_province_id,
      age_group,
      preferred_language,
      countries (
        country_name_th,
        country_name_en
      ),
      provinces (
        province_name_th,
        province_name_en
      )
    `)
    .eq("tourist_id", touristId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function listTouristIdentityProviders(touristId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourist_identities")
    .select("provider, is_primary, created_at")
    .eq("tourist_id", touristId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tourist identities: ${error.message}`);
  }

  return data || [];
}

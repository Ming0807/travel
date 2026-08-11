import "server-only";
import { CHECKIN_CONSENT_PURPOSE_KEY, CHECKIN_CONSENT_VERSION } from "@/lib/config/checkin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PreferredLanguage, PreferredLanguageSource } from "@/lib/validation/language";

export type GuestCheckinProfile = {
  displayName: string;
  originCountryId: number | null;
  originProvinceId: number | null;
  ageGroup: string | null;
  preferredLanguage: PreferredLanguage;
  preferredLanguageSource: PreferredLanguageSource;
  hasCurrentConsent: boolean;
};

export type LeaderboardVisibility = "private" | "alias" | "display_name";

export async function getGuestCheckinProfile(guestToken: string): Promise<GuestCheckinProfile | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: identity, error } = await supabase
    .from("tourist_identities")
    .select("tourist_id, tourists!inner(display_name, origin_country_id, origin_province_id, age_group, preferred_language, preferred_language_source)")
    .eq("provider", "anonymous_device")
    .eq("provider_user_id", guestToken)
    .maybeSingle();

  if (error) throw new Error(`Failed to load returning tourist profile: ${error.message}`);
  if (!identity) return null;

  const tourist = Array.isArray(identity.tourists) ? identity.tourists[0] : identity.tourists;
  if (!tourist) return null;

  const { data: consent, error: consentError } = await supabase
    .from("consent_records")
    .select("consent_id")
    .eq("tourist_id", identity.tourist_id)
    .eq("consent_version", CHECKIN_CONSENT_VERSION)
    .eq("purpose_key", CHECKIN_CONSENT_PURPOSE_KEY)
    .eq("has_consented", true)
    .maybeSingle();

  if (consentError) throw new Error(`Failed to load tourist consent: ${consentError.message}`);

  return {
    displayName: tourist.display_name,
    originCountryId: tourist.origin_country_id ? Number(tourist.origin_country_id) : null,
    originProvinceId: tourist.origin_province_id ? Number(tourist.origin_province_id) : null,
    ageGroup: tourist.age_group,
    preferredLanguage: tourist.preferred_language ?? null,
    preferredLanguageSource: tourist.preferred_language_source ?? null,
    hasCurrentConsent: Boolean(consent),
  };
}

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
  preferredLanguage?: PreferredLanguage;
  preferredLanguageSource?: PreferredLanguageSource;
  originCountryId?: number | null;
  originProvinceId?: number | null;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourists")
    .insert({
      display_name: params.displayName,
      age_group: params.ageGroup,
      preferred_language: params.preferredLanguage ?? null,
      preferred_language_source: params.preferredLanguageSource ?? null,
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
      preferred_language_source,
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

export async function resolveTouristOAuthIdentity(params: {
  provider: "google" | "line" | "email";
  providerUserId: string;
  displayName: string;
}): Promise<{ touristId: string; status: "existing" | "created" }> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("resolve_tourist_oauth_identity", {
    p_provider: params.provider,
    p_provider_user_id: params.providerUserId,
    p_display_name: params.displayName,
  });

  if (error) throw new Error(`Failed to resolve tourist account: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  if (
    !row ||
    typeof row.tourist_id !== "string" ||
    (row.status !== "existing" && row.status !== "created")
  ) {
    throw new Error("TOURIST_OAUTH_IDENTITY_INVALID_RESULT");
  }

  return { touristId: row.tourist_id, status: row.status };
}

export async function getTouristLeaderboardPreference(touristId: string): Promise<{
  visibility: LeaderboardVisibility;
  alias: string | null;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourists")
    .select("leaderboard_visibility, leaderboard_alias")
    .eq("tourist_id", touristId)
    .single();

  if (error || !data) throw new Error("TOURIST_LEADERBOARD_PREFERENCE_NOT_FOUND");

  const visibility = data.leaderboard_visibility;
  return {
    visibility:
      visibility === "alias" || visibility === "display_name" ? visibility : "private",
    alias: typeof data.leaderboard_alias === "string" ? data.leaderboard_alias : null,
  };
}

export async function setTouristLeaderboardPreference(params: {
  touristId: string;
  visibility: LeaderboardVisibility;
  alias: string | null;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("set_tourist_leaderboard_preference", {
    p_tourist_id: params.touristId,
    p_visibility: params.visibility,
    p_alias: params.alias,
    p_consent_version: "leaderboard-privacy-v1",
    p_source: "tourist_profile",
  });

  if (error) throw new Error("TOURIST_LEADERBOARD_PREFERENCE_UPDATE_FAILED");
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

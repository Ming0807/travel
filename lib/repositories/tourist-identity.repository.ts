import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type TouristIdentityProvider = "anonymous_device" | "line" | "google" | "email";

export type TouristIdentityRecord = {
  identityId: string;
  touristId: string;
  provider: TouristIdentityProvider;
  isPrimary: boolean;
  createdAt: string;
  linkedAt: string | null;
  lastSeenAt: string | null;
};

export type IdentityLinkingRepositoryResult = {
  status: "linked" | "already_linked";
};

function mapTouristIdentity(row: {
  identity_id: string;
  tourist_id: string;
  provider: TouristIdentityProvider;
  is_primary: boolean;
  created_at: string;
  linked_at?: string | null;
  last_seen_at: string | null;
}): TouristIdentityRecord {
  return {
    identityId: row.identity_id,
    touristId: row.tourist_id,
    provider: row.provider,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    linkedAt: row.linked_at ?? null,
    lastSeenAt: row.last_seen_at
  };
}

export async function findTouristIdentityByProvider(
  provider: TouristIdentityProvider,
  providerUserId: string
) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourist_identities")
    .select("identity_id, tourist_id, provider, is_primary, created_at, linked_at, last_seen_at")
    .eq("provider", provider)
    .eq("provider_user_id", providerUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch tourist identity: ${error.message}`);
  }

  return data ? mapTouristIdentity(data) : null;
}

export async function createTouristIdentityLink(params: {
  touristId: string;
  provider: TouristIdentityProvider;
  providerUserId: string;
  isPrimary?: boolean;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourist_identities")
    .insert({
      tourist_id: params.touristId,
      provider: params.provider,
      provider_user_id: params.providerUserId,
      is_primary: params.isPrimary ?? false,
      linked_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    })
    .select("identity_id, tourist_id, provider, is_primary, created_at, linked_at, last_seen_at")
    .single();

  if (error) {
    throw new Error(`Failed to link tourist identity: ${error.message}`);
  }

  return mapTouristIdentity(data);
}

export async function touchTouristIdentity(identityId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("tourist_identities")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("identity_id", identityId);

  if (error) {
    throw new Error(`Failed to update tourist identity: ${error.message}`);
  }
}

export async function linkTouristIdentityWithConsent(params: {
  touristId: string;
  provider: Exclude<TouristIdentityProvider, "anonymous_device">;
  providerUserId: string;
  language: "th" | "en";
  consentVersion: string;
  consentPurposeKey: "passport_recovery";
}): Promise<IdentityLinkingRepositoryResult> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("link_tourist_identity_with_consent", {
    p_tourist_id: params.touristId,
    p_provider: params.provider,
    p_provider_user_id: params.providerUserId,
    p_language: params.language,
    p_consent_version: params.consentVersion,
    p_purpose_key: params.consentPurposeKey,
  });

  if (error) throw new Error(error.message);
  if (data !== "linked" && data !== "already_linked") {
    throw new Error("IDENTITY_LINK_INVALID_RESULT");
  }

  return { status: data };
}

export async function recoverTouristPassportWithLine(params: {
  lineProviderUserId: string;
  newGuestToken: string;
  language: "th" | "en";
  consentVersion: string;
  consentPurposeKey: "passport_recovery";
}): Promise<{ status: "recovered" }> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("recover_tourist_passport_with_line", {
    p_line_provider_user_id: params.lineProviderUserId,
    p_new_guest_token: params.newGuestToken,
    p_language: params.language,
    p_consent_version: params.consentVersion,
    p_purpose_key: params.consentPurposeKey,
  });

  if (error) throw new Error(error.message);
  if (data !== "recovered") throw new Error("LINE_RECOVERY_INVALID_RESULT");
  return { status: "recovered" };
}

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

"use server";

import { redirect } from "next/navigation";

import { getGuestIdentity } from "@/lib/auth/guest";
import {
  resolveSafeAuthDestination,
  resolveTouristAuthProvider,
} from "@/lib/auth/oauth";
import { linkTouristIdentityWithConsent } from "@/lib/repositories/tourist-identity.repository";
import {
  findTouristByIdentity,
  resolveTouristOAuthIdentity,
} from "@/lib/repositories/tourist.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function confirmationError(code: string, next: string) {
  const params = new URLSearchParams({ error: code, next });
  return `/account/confirm-link?${params.toString()}`;
}

async function getAuthenticatedTouristProvider() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const provider = resolveTouristAuthProvider(user?.app_metadata.provider);

  if (error || !user || !provider) return null;
  return { user, provider };
}

export async function confirmGuestPassportLinkAction(formData: FormData) {
  const next = resolveSafeAuthDestination(String(formData.get("next") || ""));
  if (formData.get("confirm") !== "yes") {
    return redirect(confirmationError("confirmation_required", next));
  }

  const authenticated = await getAuthenticatedTouristProvider();
  if (!authenticated) {
    return redirect(`/auth/login?${new URLSearchParams({ next }).toString()}`);
  }

  const guestToken = await getGuestIdentity();
  const guestTouristId = guestToken
    ? await findTouristByIdentity("anonymous_device", guestToken)
    : null;

  if (!guestTouristId) return redirect(next);

  try {
    await linkTouristIdentityWithConsent({
      touristId: guestTouristId,
      provider: authenticated.provider,
      providerUserId: authenticated.user.id,
      language: "th",
      consentVersion: "account_linking_v1",
      consentPurposeKey: "passport_recovery",
    });
  } catch {
    return redirect(confirmationError("link_failed", next));
  }

  return redirect(next);
}

export async function createSeparateTouristAccountAction(formData: FormData) {
  const next = resolveSafeAuthDestination(String(formData.get("next") || ""));
  const authenticated = await getAuthenticatedTouristProvider();

  if (!authenticated) {
    return redirect(`/auth/login?${new URLSearchParams({ next }).toString()}`);
  }

  try {
    await resolveTouristOAuthIdentity({
      provider: authenticated.provider,
      providerUserId: authenticated.user.id,
      displayName:
        authenticated.user.user_metadata?.full_name ||
        authenticated.user.user_metadata?.name ||
        "นักเดินทาง",
    });
  } catch {
    return redirect(confirmationError("create_failed", next));
  }

  return redirect(next);
}

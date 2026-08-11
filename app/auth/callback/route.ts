import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getGuestIdentity } from "@/lib/auth/guest";
import {
  findTouristByIdentity,
  resolveTouristOAuthIdentity,
} from "@/lib/repositories/tourist.repository";
import {
  resolveSafeAuthDestination,
  resolveTouristAuthProvider,
} from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = resolveSafeAuthDestination(requestUrl.searchParams.get("next"));

  const loginFailure = () => {
    const url = new URL("/auth/login", requestUrl.origin);
    url.searchParams.set("error", "oauth_callback_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  };

  if (!code) return loginFailure();

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !session?.user) return loginFailure();

    const user = session.user;
    const provider = resolveTouristAuthProvider(user.app_metadata.provider);
    if (!provider) return loginFailure();

    const existingTouristId = await findTouristByIdentity(provider, user.id);
    if (existingTouristId) return NextResponse.redirect(new URL(next, requestUrl.origin));

    const guestToken = await getGuestIdentity();
    const guestTouristId = guestToken
      ? await findTouristByIdentity("anonymous_device", guestToken)
      : null;

    if (guestTouristId) {
      const confirmationUrl = new URL("/account/confirm-link", requestUrl.origin);
      confirmationUrl.searchParams.set("next", next);
      return NextResponse.redirect(confirmationUrl);
    }

    await resolveTouristOAuthIdentity({
      provider,
      providerUserId: user.id,
      displayName:
        user.user_metadata?.full_name || user.user_metadata?.name || "นักเดินทาง",
    });
  } catch {
    return loginFailure();
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

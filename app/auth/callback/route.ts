import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getGuestIdentity } from "@/lib/auth/guest";
import {
  findTouristByIdentity,
  createTouristIdentity,
  createTouristProfile,
} from "@/lib/repositories/tourist.repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/stories/share";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      const user = session.user;
      // Default to email if provider isn't explicitly google or line in metadata
      // Supabase sets app_metadata.provider
      const provider = user.app_metadata.provider || "email";

      // 1. Check if this Supabase user is already linked to a tourist profile
      let touristId = await findTouristByIdentity(provider, user.id);

      if (!touristId) {
        // 2. Not linked. Check if they have a guest token on this device
        const guestToken = await getGuestIdentity();

        if (guestToken) {
          const guestTouristId = await findTouristByIdentity("anonymous_device", guestToken);
          if (guestTouristId) {
            // Found a guest profile! Link this new Google/LINE identity to it.
            await createTouristIdentity(guestTouristId, provider, user.id);
            touristId = guestTouristId;
          }
        }

        // 3. No guest token or guest profile not found? Create a brand new tourist profile.
        if (!touristId) {
          touristId = await createTouristProfile({
            displayName:
              user.user_metadata?.full_name || user.user_metadata?.name || "นักเดินทาง",
            ageGroup: "prefer_not_to_answer",
          });
          await createTouristIdentity(touristId, provider, user.id);
        }
      }
    }
  }

  // Redirect to the originally requested page
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

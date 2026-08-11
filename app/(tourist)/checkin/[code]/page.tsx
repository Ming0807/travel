import { CheckinLanding } from "@/components/checkin/CheckinLanding";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";

export default async function CheckinLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  try {
    await trackCheckinFunnelEvent("landing_viewed", context.details);
  } catch {
    // Analytics must never block the tourist reward flow.
  }

  return <CheckinLanding details={context.details} />;
}

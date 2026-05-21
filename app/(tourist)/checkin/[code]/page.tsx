import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { CheckinLanding } from "@/components/checkin/CheckinLanding";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";

export default async function CheckinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CheckinUnavailable status={context.status as any} />;
  }

  // Record funnel event asynchronously
  // Note: Vercel might pause the function before this finishes if not awaited,
  // but in Next.js Server Components, we await it safely.
  await trackCheckinFunnelEvent("landing_viewed", context.details);

  return <CheckinLanding details={context.details} />;
}

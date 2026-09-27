import { CheckinLanding } from "@/components/checkin/CheckinLanding";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { CHECKIN_BROWSER_COOKIE } from "@/lib/auth/checkin-entry";
import { resolveCheckinFlow } from "@/lib/services/checkin-entry.service";
import { trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { cookies } from "next/headers";
import { getNfcOfficialOrigin } from "@/lib/nfc/contract";

export default async function CheckinLandingPage({
  params,
  searchParams = Promise.resolve({}),
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ flow?: string | string[]; entryError?: string | string[] }>;
}) {
  const { code } = await params;
  const query = await searchParams;
  if (query.entryError) return <CheckinUnavailable status={query.entryError === "nfc_unavailable" ? "nfc_unavailable" : "unavailable"} />;
  if (query.flow !== undefined && typeof query.flow !== "string") return <CheckinUnavailable status="unavailable" />;
  const flowId = typeof query.flow === "string" ? query.flow : null;
  const browserId = flowId ? (await cookies()).get(CHECKIN_BROWSER_COOKIE)?.value ?? null : null;
  const context = await resolveCheckinFlow({ code, flowId, browserId });

  if (context.mode === "blocked") {
    return <CheckinUnavailable status={context.status} />;
  }

  let nfcOfficialHost: string | null = null;
  if (context.mode === "session" && context.session.channel === "nfc") {
    try {
      nfcOfficialHost = new URL(getNfcOfficialOrigin(process.env.NEXT_PUBLIC_APP_URL ?? "")).host;
    } catch {
      return <CheckinUnavailable status="nfc_unavailable" />;
    }
  }

  try {
    if (context.mode === "session") {
      await trackCheckinFunnelEvent("landing_viewed", context.details, { sessionId: context.session.sessionId });
    } else {
      await trackCheckinFunnelEvent("landing_viewed", context.details);
    }
  } catch {
    // Analytics must never block the tourist reward flow.
  }

  return <CheckinLanding
    details={context.details}
    nfcOfficialHost={nfcOfficialHost}
    entrySessionId={context.mode === "session" ? context.session.sessionId : null}
  />;
}

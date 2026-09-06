import Link from "next/link";
import { CHECKIN_BROWSER_COOKIE } from "@/lib/auth/checkin-entry";
import { resolveCheckinFlow } from "@/lib/services/checkin-entry.service";
import { trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { MinimalForm } from "@/components/checkin/MinimalForm";
import { ArrowLeft, Compass, MapPin, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { getGuestIdentity } from "@/lib/auth/guest";
import { listCheckinCountries, listCheckinProvinces } from "@/lib/repositories/geography.repository";
import { getGuestCheckinProfile } from "@/lib/repositories/tourist.repository";
import { detectPreferredLanguage } from "@/lib/validation/language";
import { cookies, headers } from "next/headers";
import { getOptionalResearchInvitationForCheckin } from "@/lib/services/research.service";
import { ResearchInvitePrompt } from "@/components/research/ResearchInvitePrompt";
import { CheckinProgress } from "@/components/checkin/CheckinProgress";

export default async function StartCheckinPage({
  params,
  searchParams = Promise.resolve({}),
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ flow?: string; entryError?: string }>;
}) {
  const { code } = await params;
  const query = await searchParams;
  if (query.entryError) return <CheckinUnavailable status="unavailable" />;
  const flowId = typeof query.flow === "string" ? query.flow : null;
  const browserId = flowId ? (await cookies()).get(CHECKIN_BROWSER_COOKIE)?.value ?? null : null;
  const context = await resolveCheckinFlow({ code, flowId, browserId });

  if (context.mode === "blocked") {
    return <CheckinUnavailable status="unavailable" />;
  }

  try {
    if (context.mode === "session") {
      await trackCheckinFunnelEvent("certificate_started", context.details, { sessionId: context.session.sessionId });
    } else {
      await trackCheckinFunnelEvent("certificate_started", context.details);
    }
  } catch {
    // Analytics must never block the tourist reward flow.
  }

  const { attraction, photo_spot } = context.details;
  const entrySessionId = context.mode === "session" ? context.session.sessionId : null;
  const guestToken = await getGuestIdentity();
  const requestHeaders = await headers();
  const detectedLanguage = detectPreferredLanguage(requestHeaders.get("accept-language"));

  let countries;
  let provinces;
  let initialProfile = null;
  let researchInvitation = null;
  try {
    [countries, provinces, initialProfile, researchInvitation] = await Promise.all([
      listCheckinCountries(),
      listCheckinProvinces(),
      guestToken ? getGuestCheckinProfile(guestToken) : Promise.resolve(null),
      getOptionalResearchInvitationForCheckin(code, entrySessionId ?? undefined).catch(() => null),
    ]);
  } catch {
    return <CheckinUnavailable status="unavailable" />;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link
          href={`/checkin/${code}${entrySessionId ? `?flow=${encodeURIComponent(entrySessionId)}` : ""}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-bold text-slate-600 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
            <ArrowLeft aria-hidden="true" size={18} weight="bold" />
          กลับไปหน้าสถานที่
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal">
            <ShieldCheck aria-hidden="true" size={17} weight="fill" />
            ใช้ข้อมูลเท่าที่จำเป็น
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-7 md:pt-10">

        <div className="mb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-teal/20 bg-teal/5 px-3 py-2 text-xs font-bold text-teal">
            <MapPin weight="fill" size={14} />
            <span>{photo_spot ? photo_spot.spot_name_th : attraction?.name_th}</span>
          </div>
          <h1 className="text-2xl font-black text-ink md:text-3xl">ข้อมูลสั้น ๆ สำหรับใบประกาศ</h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
            ใช้เวลาประมาณ 1 นาที รูปภาพเป็นขั้นตอนถัดไปและเลือกข้ามได้
          </p>
        </div>

        <div className="mb-6 bg-white px-4 py-1">
          <CheckinProgress currentStep={0} />
        </div>

        {researchInvitation ? (
          <ResearchInvitePrompt
            invitation={researchInvitation}
            checkinCode={code}
            entrySessionId={entrySessionId}
          />
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white p-5 md:p-7">
          <MinimalForm
            checkinCode={code}
            countries={countries}
            provinces={provinces}
            initialProfile={initialProfile}
            detectedLanguage={detectedLanguage}
            entrySessionId={entrySessionId}
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Compass size={14} weight="fill" className="text-coral" />
          <span>ท่องเที่ยวชายแดนใต้</span>
        </div>
      </div>
    </main>
  );
}

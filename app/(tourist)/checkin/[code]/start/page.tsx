import Link from "next/link";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { MinimalForm } from "@/components/checkin/MinimalForm";
import { ArrowLeft, Compass, MapPin, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { getGuestIdentity } from "@/lib/auth/guest";
import { listCheckinCountries, listCheckinProvinces } from "@/lib/repositories/geography.repository";
import { getGuestCheckinProfile } from "@/lib/repositories/tourist.repository";

export default async function StartCheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  const { attraction, photo_spot } = context.details;
  const guestToken = await getGuestIdentity();

  let countries;
  let provinces;
  let initialProfile = null;
  try {
    [countries, provinces, initialProfile] = await Promise.all([
      listCheckinCountries(),
      listCheckinProvinces(),
      guestToken ? getGuestCheckinProfile(guestToken) : Promise.resolve(null),
    ]);
  } catch {
    return <CheckinUnavailable status="unavailable" />;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link
          href={`/checkin/${code}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-bold text-slate-600 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
            <ArrowLeft aria-hidden="true" size={18} weight="bold" />
          กลับไปหน้าสถานที่
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck aria-hidden="true" size={17} weight="fill" />
            ข้อมูลปลอดภัย
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-7 md:pt-10">

        <div className="mb-6 animate-fade-in-up text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-2 text-xs font-bold text-teal">
            <MapPin weight="fill" size={14} />
            <span>{photo_spot ? photo_spot.spot_name_th : attraction?.name_th}</span>
          </div>
          <h1 className="text-2xl font-black text-ink md:text-3xl">เตรียมความทรงจำของคุณ</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-600">
            ใช้เวลาไม่ถึง 1 นาที แล้วไปเลือกรูปสำหรับใบประกาศดิจิทัล
          </p>
        </div>

        <div className="animate-scale-in rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <MinimalForm
            checkinCode={code}
            countries={countries}
            provinces={provinces}
            initialProfile={initialProfile}
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

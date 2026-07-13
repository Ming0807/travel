import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Certificate,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";

import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";

export default async function CheckinLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  try {
    await trackCheckinFunnelEvent("qr_scanned", context.details);
    await trackCheckinFunnelEvent("landing_viewed", context.details);
  } catch {
    // Analytics must never block the tourist reward flow.
  }

  const { attraction, photo_spot } = context.details;
  const heroImage = photo_spot?.sample_image_url || attraction?.cover_image_url;
  const placeName = photo_spot?.spot_name_th || attraction?.name_th || "สถานที่ท่องเที่ยว";

  return (
    <main className="min-h-screen bg-white pb-24 text-ink">
      <section className="relative min-h-[19rem] overflow-hidden bg-ink sm:min-h-[23rem]" aria-labelledby="checkin-place-name">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`บรรยากาศ ${placeName}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <Camera aria-hidden="true" className="absolute right-6 top-8 text-white/20" size={96} weight="fill" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[19rem] max-w-lg flex-col justify-end px-5 pb-7 pt-16 text-white sm:min-h-[23rem]">
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs font-bold backdrop-blur-sm">
            <MapPin aria-hidden="true" size={15} weight="fill" />
            {attraction?.province?.province_name_th ?? "ชายแดนใต้"}
          </span>
          <h1 id="checkin-place-name" className="text-3xl font-black leading-tight sm:text-4xl">
            {placeName}
          </h1>
          {photo_spot && attraction ? <p className="mt-2 text-sm font-semibold text-white/85">{attraction.name_th}</p> : null}
        </div>
      </section>

      <div className="mx-auto max-w-lg px-5 py-7">
        <div className="flex items-start justify-between gap-5 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-bold text-coral">ความทรงจำจากการเดินทาง</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-ink">รับใบประกาศและตราประทับดิจิทัล</h2>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Certificate aria-hidden="true" size={25} weight="fill" />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-5 text-center">
          {[
            { icon: CheckCircle, label: "ข้อมูลสั้น ๆ" },
            { icon: Camera, label: "เลือกรูป" },
            { icon: Stamp, label: "รับรางวัล" },
          ].map((step) => (
            <div key={step.label} className="flex min-w-0 flex-col items-center gap-2">
              <step.icon aria-hidden="true" className="text-teal" size={21} weight="fill" />
              <span className="text-xs font-bold text-slate-700">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 py-5 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Clock aria-hidden="true" size={18} />
            ไม่ถึง 1 นาที
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-emerald-700">
            <ShieldCheck aria-hidden="true" size={18} weight="fill" />
            ไม่ต้องสมัครสมาชิก
          </span>
        </div>

        <Link
          href={`/checkin/${code}/start`}
          className="flex min-h-14 w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
        >
          สร้างใบประกาศของฉัน
        </Link>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          ใช้ข้อมูลเท่าที่จำเป็นเพื่อสร้างใบประกาศและวิเคราะห์ภาพรวมการท่องเที่ยว
        </p>
      </div>
    </main>
  );
}

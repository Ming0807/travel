import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Certificate,
  Clock,
  MapPin,
  ShieldCheck,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";

import { CheckinProgress } from "@/components/checkin/CheckinProgress";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";

export function CheckinLanding({ details }: { details: CheckinCodeDetails }) {
  const attraction = details.attraction;
  const heroImage = details.photo_spot?.sample_image_url || attraction?.cover_image_url;
  const placeName = details.photo_spot?.spot_name_th || attraction?.name_th || "สถานที่ท่องเที่ยว";
  const provinceName = attraction?.province?.province_name_th || "ชายแดนใต้";

  return (
    <main className="min-h-screen bg-white pb-24 text-ink">
      <section
        className="relative min-h-[18rem] overflow-hidden bg-ink sm:min-h-[22rem]"
        aria-labelledby="checkin-place-name"
      >
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
          <Camera
            aria-hidden="true"
            className="absolute right-6 top-8 text-white/20"
            size={96}
            weight="fill"
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex min-h-[18rem] max-w-lg flex-col justify-end px-5 pb-7 pt-16 text-white sm:min-h-[22rem]">
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs font-bold">
            <MapPin aria-hidden="true" size={15} weight="fill" />
            {provinceName}
          </span>
          <h1 id="checkin-place-name" className="text-3xl font-black leading-tight sm:text-4xl">
            {placeName}
          </h1>
          {details.photo_spot && attraction ? (
            <p className="mt-2 text-sm font-semibold text-white/85">{attraction.name_th}</p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-lg px-5 py-7">
        <div className="flex items-start justify-between gap-5 pb-6">
          <div>
            <p className="text-sm font-bold text-coral">ความทรงจำจากการเดินทาง</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-ink">
              รับใบประกาศและตราประทับดิจิทัล
            </h2>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
            <Certificate aria-hidden="true" size={25} weight="fill" />
          </span>
        </div>

        <CheckinProgress currentStep={0} />

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-200 py-5 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
            <Clock aria-hidden="true" size={18} />
            ข้อมูลเริ่มต้นประมาณ 1 นาที
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
            <Certificate aria-hidden="true" size={18} />
            ขั้นตอนทั้งหมดประมาณ 2–3 นาที
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
            <Camera aria-hidden="true" size={18} />
            รูปภาพไม่บังคับ
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
            <Stamp aria-hidden="true" size={18} />
            แบบสำรวจไม่บังคับ
          </span>
        </div>

        <Link
          href={`/checkin/${details.code}/start`}
          className="mt-6 flex min-h-14 w-full items-center justify-center rounded-md bg-ink px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
        >
          สร้างใบประกาศของฉัน
        </Link>

        <div className="mt-5 flex items-start gap-3 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-600">
          <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-teal" size={18} weight="fill" />
          <p>
            เราใช้ข้อมูลเท่าที่จำเป็นเพื่อสร้างใบประกาศและวิเคราะห์สถิติการท่องเที่ยวในภาพรวม
            โดยไม่ต้องสมัครสมาชิก อ่านรายละเอียดได้ที่{" "}
            <Link href="/privacy" className="font-bold text-teal underline underline-offset-2">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, DeviceMobile, QrCode, Stamp } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const DEFAULT_TITLE = "เริ่มต้นการเดินทางของคุณวันนี้";
const DEFAULT_DESCRIPTION = "สแกน QR Code เพื่อเช็กอิน บันทึกการเดินทาง และสะสมตราประทับดิจิทัลประจำสถานที่";

function safeContent(value: string | undefined, fallback: string) {
  if (!value || /สมัคร|ข่าวสาร|อีเมล|newsletter/i.test(value)) return fallback;
  return value;
}

export function HomepageCertificateCta({
  title,
  subtitle,
  description,
  bgImage = "",
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  bgImage?: string;
}) {
  const imageSrc = siteMediaImageUrl(bgImage);
  const displayTitle = safeContent(title, DEFAULT_TITLE);
  const displayDescription = safeContent(description, DEFAULT_DESCRIPTION);
  const displaySubtitle = subtitle && !/สมัคร|ข่าวสาร|อีเมล|newsletter/i.test(subtitle) ? subtitle : "ท่องเที่ยวยะลา";

  return (
    <section aria-labelledby="homepage-passport-heading" className="border-t border-ink/10 bg-white px-4 py-12 pb-24 sm:px-6 lg:px-8 lg:py-16">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-coral to-amber-600 text-white shadow-xl shadow-orange-500/20 lg:grid-cols-[1fr_360px]">
        {/* Subtle Watermark Mandala */}
        <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-radial from-amber-400/20 via-orange-500/10 to-transparent blur-xl" />

        {imageSrc ? (
          <Image src={imageSrc} alt="" fill className="object-cover opacity-15" sizes="(max-width: 1280px) 100vw, 1280px" />
        ) : null}

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-xs">
            <Stamp aria-hidden="true" size={15} weight="fill" />
            <span>{displaySubtitle}</span>
          </div>
          <h2 id="homepage-passport-heading" className="mt-4 max-w-2xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
            {displayTitle}
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/90 sm:text-base">
            {displayDescription}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <PublicCheckinEntryLink
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-white px-7 text-sm font-black text-coral shadow-lg transition-all hover:bg-[#FFFDF9] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-coral"
            >
              <QrCode aria-hidden="true" size={20} weight="bold" />
              <span>สแกน QR เพื่อเช็กอิน</span>
            </PublicCheckinEntryLink>

            <Link
              href="/passport"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Stamp aria-hidden="true" size={18} weight="fill" />
              <span>เปิด Digital Passport</span>
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>ดูกระดานผู้นำ</span>
            </Link>
          </div>
        </div>

        {/* Right Visual Panel with Mobile / Stamp Art */}
        <div className="relative z-10 hidden border-l border-white/20 p-8 lg:flex lg:flex-col lg:items-center lg:justify-center">
          <div className="relative flex flex-col items-center">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/15 p-4 text-white shadow-inner backdrop-blur-xs">
              <DeviceMobile size={64} weight="duotone" className="text-white" />
            </div>
            <p className="mt-3 text-xs font-bold text-white/90">สแกนได้ทันทีผ่านเบราว์เซอร์</p>
          </div>
          <Link
            href="/passport"
            className="mt-6 inline-flex min-h-10 items-center justify-between gap-2 border-t border-white/30 pt-3 text-xs font-black text-white hover:underline"
          >
            <span>ดูตราที่สะสมไว้</span>
            <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

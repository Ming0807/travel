import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Medal, Stamp } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

const DEFAULT_TITLE = "ทุกการเดินทางมีเรื่องให้สะสม";
const DEFAULT_DESCRIPTION = "เก็บตราประจำสถานที่ไว้ใน Digital Passport ดูคะแนนของคุณ และกลับมาค้นพบยะลาในมุมใหม่ได้ทุกครั้ง";

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
  const displaySubtitle = subtitle && !/สมัคร|ข่าวสาร|อีเมล|newsletter/i.test(subtitle) ? subtitle : "Digital Passport";

  return (
    <section aria-labelledby="homepage-passport-heading" className="border-t border-ink/10 bg-white px-4 py-12 pb-24 sm:px-6 lg:px-8 lg:py-16">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[8px] bg-gradient-to-r from-coral via-[#EB7B5D] to-orange-500 text-white shadow-card lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Subtle Watermark Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10 woven-pattern" />
        
        {imageSrc ? (
          <Image src={imageSrc} alt="" fill className="object-cover opacity-15" sizes="(max-width: 1280px) 100vw, 1280px" />
        ) : null}

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-xs">
            <Stamp aria-hidden="true" size={15} weight="fill" />
            <span>{displaySubtitle}</span>
          </div>
          <h2 id="homepage-passport-heading" className="mt-4 max-w-2xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
            {displayTitle}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            {displayDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/passport"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-white px-6 text-sm font-black text-ink shadow-xs transition-all hover:bg-cream hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-coral"
            >
              <Stamp aria-hidden="true" size={18} weight="fill" className="text-coral" /> เปิด Digital Passport
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-white/60 bg-white/10 px-6 text-sm font-black text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Medal aria-hidden="true" size={18} weight="fill" /> ดูกระดานผู้นำ
            </Link>
          </div>
        </div>

        {/* Right Phone Mockup Illustration Frame */}
        <div className="relative z-10 hidden border-l border-white/20 p-8 lg:flex lg:flex-col lg:items-center lg:justify-center">
          <div className="w-52 rounded-2xl border-4 border-white/40 bg-white p-3 shadow-2xl">
            <div className="rounded-xl border border-ink/10 bg-cream p-4 text-center text-ink">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coral/15 text-coral">
                <Stamp aria-hidden="true" size={28} weight="fill" />
              </div>
              <p className="mt-2 text-xs font-black text-ink">Digital Passport</p>
              <p className="mt-0.5 text-[10px] font-bold text-muted">สะสมตราประจำสถานที่</p>
              <div className="mt-3 rounded-[6px] bg-coral/10 py-1.5 text-[11px] font-black text-coral">
                สแกน QR เช็กอิน
              </div>
            </div>
          </div>
          <Link
            href="/passport"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white"
          >
            ดูตราที่สะสมไว้ <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

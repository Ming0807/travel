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
    <section aria-labelledby="homepage-passport-heading" className="bg-cream px-4 py-10 pb-24 sm:px-6 lg:px-8 lg:py-14">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[8px] bg-coral text-white lg:grid-cols-[minmax(0,1fr)_340px]">
        {imageSrc ? (
          <Image src={imageSrc} alt="" fill className="object-cover opacity-15" sizes="(max-width: 1280px) 100vw, 1280px" />
        ) : null}
        <div className="relative p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/75">{displaySubtitle}</p>
          <h2 id="homepage-passport-heading" className="mt-3 max-w-2xl text-2xl font-black leading-tight sm:text-3xl">{displayTitle}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85">{displayDescription}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/passport" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-white px-5 text-sm font-black text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-coral">
              <Stamp aria-hidden="true" weight="duotone" /> เปิด Digital Passport
            </Link>
            <Link href="/leaderboard" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-white/50 px-5 text-sm font-black text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Medal aria-hidden="true" weight="duotone" /> ดูกระดานผู้นำ
            </Link>
          </div>
        </div>
        <div className="relative hidden border-l border-white/20 p-10 lg:flex lg:flex-col lg:justify-between">
          <Stamp aria-hidden="true" size={72} weight="duotone" className="text-white/75" />
          <Link href="/passport" className="inline-flex min-h-11 items-center justify-between border-t border-white/35 pt-4 text-sm font-black text-white hover:text-ink">
            ดูตราที่สะสมไว้ <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

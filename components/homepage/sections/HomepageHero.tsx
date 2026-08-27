import Image from "next/image";
import Link from "next/link";
import { Compass, QrCode } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

function stripMarkup(value: string) {
  return value.replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function HeroTitle({ title }: { title: string }) {
  const [before, after] = title.split("ยะลา", 2);
  if (after === undefined) return <>{title}</>;
  return (
    <>
      {before}
      <span className="text-coral">
        ยะลา
      </span>
      {after}
    </>
  );
}

export function HomepageHero({
  title = "เที่ยวยะลาให้ลึกกว่าเดิม",
  subtitle = "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์",
  description = "เช็กอินสถานที่สำคัญ สะสมตราประทับ รับใบประกาศดิจิทัล และร่วมเรียนรู้วิถีชีวิตวัฒนธรรมยะลาไปด้วยกัน",
  images = [
    "",
    "",
    "",
  ],
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  images?: string[];
}) {
  const getImageUrl = (path: string | undefined) => {
    return siteMediaImageUrl(path) ?? "";
  };

  const img0 = getImageUrl(images?.[0]);
  const cleanTitle = /ปัตตานี|นราธิวาส/.test(title)
    ? "เที่ยวยะลาให้ลึกกว่าเดิม"
    : stripMarkup(title) || "เที่ยวยะลาให้ลึกกว่าเดิม";
  const cleanSubtitle = /ปัตตานี|นราธิวาส/.test(subtitle)
    ? "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์"
    : stripMarkup(subtitle) || "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์";
  const cleanDescription = /ปัตตานี|นราธิวาส/.test(description)
    ? "เช็กอินสถานที่สำคัญ สะสมตราประทับ รับใบประกาศดิจิทัล และร่วมเรียนรู้วิถีชีวิตวัฒนธรรมยะลาไปด้วยกัน"
    : stripMarkup(description) || "เช็กอินสถานที่สำคัญ สะสมตราประทับ รับใบประกาศดิจิทัล และร่วมเรียนรู้วิถีชีวิตวัฒนธรรมยะลาไปด้วยกัน";

  return (
    <section
      data-hero-layout="full-bleed"
      className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] text-ink"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0" data-testid="homepage-hero-background">
        {img0 ? (
          <Image
            src={img0}
            alt="บรรยากาศการท่องเที่ยวจังหวัดยะลา"
            fill
            preload={true}
            fetchPriority="high"
            className="object-cover object-[70%_center] sm:object-[66%_center] lg:object-[70%_center]"
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-end bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-amber-600/40 p-8 text-center text-ink lg:pr-[16vw]">
            <div className="flex flex-col items-center gap-2">
              <Compass size={48} weight="fill" className="text-coral" />
              <p className="text-sm font-bold text-ink/80">ท่องเที่ยวยะลา ดินแดนใต้สุดแดนสยาม</p>
            </div>
          </div>
        )}

        {/* Ambient Gradient Veil: Highly tuned for mobile transparency and desktop wide fade */}
        <div
          data-testid="homepage-hero-veil"
          className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9] via-[#FFFDF9]/85 to-[#FFFDF9]/40 sm:bg-[linear-gradient(90deg,rgba(255,253,249,0.99)_0%,rgba(255,251,246,0.97)_38%,rgba(255,249,241,0.76)_56%,rgba(255,248,239,0.22)_78%,rgba(255,248,239,0.05)_100%)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-orange-500/20 via-orange-400/5 to-transparent" />
      </div>

      <div className="relative mx-auto min-h-[460px] max-w-7xl px-4 pt-8 sm:min-h-[520px] sm:px-6 sm:pt-14 lg:min-h-[560px] lg:px-8 lg:pt-20">
        {/* Left-Aligned Headline & CTA Actions */}
        <div className="relative z-10 max-w-2xl pb-16 sm:pb-24 lg:pb-28">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-coral/20 bg-coral/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-coral backdrop-blur-xs sm:text-xs">
            <Compass size={14} weight="fill" className="text-coral" />
            <span>{cleanSubtitle}</span>
          </div>

          <h1 className="mt-3.5 text-2xl font-black leading-[1.22] text-ink sm:text-4xl lg:text-[3.25rem]">
            <span className="block text-ink">เปิดประสบการณ์</span>
            <span className="mt-1 block text-balance">
              <HeroTitle title={cleanTitle} />
            </span>
          </h1>

          <p className="mt-3.5 max-w-lg text-xs font-medium leading-relaxed text-ink/80 sm:mt-4 sm:text-base">
            {cleanDescription}
          </p>

          {/* Action Buttons: Responsive Stack / Row */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-3.5">
            <PublicCheckinEntryLink className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-coral to-amber-500 px-7 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-coral">
              <QrCode size={20} weight="bold" />
              <span>สแกน QR เช็กอิน</span>
            </PublicCheckinEntryLink>

            <Link
              href="/attractions"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/90 px-6 text-sm font-bold text-ink shadow-xs backdrop-blur-xs transition-all hover:border-coral hover:bg-white hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <Compass size={19} weight="bold" className="text-coral" />
              <span>ดูสถานที่ทั้งหมด</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Swooping Dynamic Orange Gradient Wave Transition */}
      <div className="relative z-10 -mt-6 w-full overflow-hidden leading-none sm:-mt-12 lg:-mt-16">
        <svg
          viewBox="0 0 1440 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="h-14 w-full sm:h-24 lg:h-32"
        >
          {/* Orange gradient wave ribbon */}
          <path
            d="M0,40 C320,120 720,-20 1440,70 L1440,140 L0,140 Z"
            className="fill-orange-500/20"
          />
          <path
            d="M0,65 C380,130 820,10 1440,85 L1440,140 L0,140 Z"
            className="fill-gradient-orange"
            fill="url(#hero-wave-gradient)"
          />
          {/* Foreground white background transition */}
          <path
            d="M0,90 C420,140 920,40 1440,105 L1440,140 L0,140 Z"
            className="fill-background"
          />
          <defs>
            <linearGradient id="hero-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}

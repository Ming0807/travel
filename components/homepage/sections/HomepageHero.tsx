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
    <section className="relative overflow-hidden bg-gradient-to-r from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] text-ink">
      {/* Background Watermark Mandala Pattern */}
      <div className="pointer-events-none absolute -left-20 top-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-orange-500/5 to-transparent blur-2xl" />

      <div className="relative mx-auto min-h-[460px] max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:min-h-[500px] lg:px-8 lg:pt-16">
        {/* Right Photographic Image */}
        <div className="absolute inset-0 lg:left-[46%]">
          {img0 ? (
            <Image
              src={img0}
              alt="บรรยากาศการท่องเที่ยวจังหวัดยะลา"
              fill
              preload={true}
              fetchPriority="high"
              className="object-cover object-center"
              sizes="(max-width: 639px) calc(100vw - 1.5rem), (max-width: 1023px) calc(100vw - 3rem), 54vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-amber-600/40 p-6 text-center text-ink">
              <div className="flex flex-col items-center gap-2">
                <Compass size={48} weight="fill" className="text-coral" />
                <p className="text-sm font-bold text-ink/80">ท่องเที่ยวยะลา ดินแดนใต้สุดแดนสยาม</p>
              </div>
            </div>
          )}
          {/* Smooth blend overlay from left cream to right image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9] via-[#FAF6F0]/90 to-transparent lg:via-[#FAF6F0]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 via-transparent to-transparent" />
        </div>

        {/* Left-Aligned Headline & CTA Actions */}
        <div className="relative z-10 max-w-2xl pb-16 lg:pb-24">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-coral sm:text-sm">
            {cleanSubtitle}
          </p>

          <h1 className="mt-3 text-3xl font-black leading-[1.2] tracking-tight text-ink sm:text-4xl lg:text-[3.25rem]">
            <span className="block text-ink">เปิดประสบการณ์</span>
            <span className="block mt-1">
              <HeroTitle title={cleanTitle} />
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-ink/75 sm:text-base">
            {cleanDescription}
          </p>

          {/* Action Buttons Matching Reference */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <PublicCheckinEntryLink className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-7 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-coral">
              <QrCode size={20} weight="bold" />
              <span>สแกน QR เช็กอิน</span>
            </PublicCheckinEntryLink>

            <Link
              href="/attractions"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/15 bg-white/90 px-6 text-sm font-bold text-ink shadow-xs backdrop-blur-xs transition-all hover:border-coral hover:bg-white hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <Compass size={19} weight="bold" className="text-coral" />
              <span>ดูสถานที่ทั้งหมด</span>
            </Link>
          </div>

          {/* Carousel Indicator Dots */}
          <div className="mt-10 flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xs" />
            <span className="h-2 w-2 rounded-full bg-ink/20" />
            <span className="h-2 w-2 rounded-full bg-ink/20" />
          </div>
        </div>
      </div>

      {/* Swooping Dynamic Orange Gradient Wave Transition */}
      <div className="relative -mt-6 w-full overflow-hidden leading-none sm:-mt-10 lg:-mt-14">
        <svg
          viewBox="0 0 1440 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="h-16 w-full sm:h-24 lg:h-32"
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

import Image from "next/image";
import Link from "next/link";
import { Compass, FilePdf, QrCode } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const NA_THAM_WORKING_GROUP_TITLE = "คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ";
const NA_THAM_BLUEPRINT_PATH = "/documents/na-tham-tourism-living-blueprint.pdf";
const YRU_LOGO_PATH = "/partners/yala-rajabhat-university.png";

function stripMarkup(value: string) {
  return value.replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function HeroTitle({ title }: { title: string }) {
  const naThamMarker = "ตำบลหน้าถ้ำ";
  const naThamIndex = title.indexOf(naThamMarker);
  if (naThamIndex >= 0) {
    return (
      <>
        <span className="block">{title.slice(0, naThamIndex).trim()}</span>
        <span className="mt-1 block text-coral">{naThamMarker}</span>
      </>
    );
  }

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
  title = NA_THAM_WORKING_GROUP_TITLE,
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
  const strippedTitle = stripMarkup(title);
  const cleanTitle = /ปัตตานี|นราธิวาส|ค้นพบความมหัศจรรย์ที่ซ่อนเร้น|เที่ยวยะลาให้ลึกกว่าเดิม/.test(strippedTitle)
    ? NA_THAM_WORKING_GROUP_TITLE
    : strippedTitle || NA_THAM_WORKING_GROUP_TITLE;
  const cleanSubtitle = /ปัตตานี|นราธิวาส/.test(subtitle)
    ? "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์"
    : stripMarkup(subtitle) || "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์";
  const cleanDescription = /ปัตตานี|นราธิวาส/.test(description)
    ? "เช็กอินสถานที่สำคัญ สะสมตราประทับ รับใบประกาศดิจิทัล และร่วมเรียนรู้วิถีชีวิตวัฒนธรรมยะลาไปด้วยกัน"
    : stripMarkup(description) || "เช็กอินสถานที่สำคัญ สะสมตราประทับ รับใบประกาศดิจิทัล และร่วมเรียนรู้วิถีชีวิตวัฒนธรรมยะลาไปด้วยกัน";

  return (
    <section
      data-hero-layout="full-bleed"
      className="relative isolate overflow-hidden bg-[#FFFDF9] text-ink"
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
            className="object-cover object-[72%_center] sm:object-[66%_center] lg:object-[70%_center]"
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
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,249,0.98)_0%,rgba(255,251,246,0.95)_50%,rgba(255,249,241,0.58)_74%,rgba(255,248,239,0.2)_100%)] sm:bg-[linear-gradient(90deg,rgba(255,253,249,0.99)_0%,rgba(255,251,246,0.97)_38%,rgba(255,249,241,0.76)_56%,rgba(255,248,239,0.22)_78%,rgba(255,248,239,0.05)_100%)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-orange-500/20 via-orange-400/5 to-transparent" />
      </div>

      <div className="relative mx-auto min-h-[570px] max-w-7xl px-4 pt-10 sm:min-h-[560px] sm:px-6 sm:pt-14 lg:min-h-[590px] lg:px-8 lg:pt-20">
        {/* Left-Aligned Headline & CTA Actions */}
        <div className="relative z-10 max-w-2xl pb-20 sm:pb-24 lg:pb-28">
          <p className="text-sm font-black text-coral sm:text-base">{cleanSubtitle}</p>

          <h1
            aria-label={cleanTitle}
            className="mt-3 max-w-3xl text-[2rem] font-black leading-[1.18] text-ink sm:text-4xl lg:text-[2.75rem]"
          >
            <HeroTitle title={cleanTitle} />
          </h1>

          <p className="mt-4 max-w-lg text-sm font-medium leading-7 text-ink/80 sm:text-base">
            {cleanDescription}
          </p>

          {/* Action Buttons: Responsive Stack / Row */}
          <div className="mt-7 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3.5">
            <PublicCheckinEntryLink className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-coral px-4 text-sm font-black text-white shadow-md transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2">
              <QrCode size={20} weight="bold" />
              <span>สแกน QR เช็กอิน</span>
            </PublicCheckinEntryLink>

            <Link
              href="/attractions"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white/95 px-4 text-sm font-bold text-ink transition-colors hover:border-coral hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <Compass size={19} weight="bold" className="text-coral" />
              <span>ดูสถานที่ทั้งหมด</span>
            </Link>

            <a
              href={NA_THAM_BLUEPRINT_PATH}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="เปิดเอกสารคณะทำงานในแท็บใหม่"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-coral/30 bg-orange-50/95 px-4 text-sm font-bold text-coral transition-colors hover:border-coral hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral min-[360px]:col-span-2 sm:col-span-1"
            >
              <FilePdf size={20} weight="bold" aria-hidden="true" />
              <span>คณะทำงาน</span>
            </a>
          </div>

          <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-lg border border-black/10 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
            <Image
              src={YRU_LOGO_PATH}
              alt="ตรามหาวิทยาลัยราชภัฏยะลา"
              width={160}
              height={100}
              className="h-11 w-auto shrink-0 object-contain"
              sizes="70px"
            />
            <div className="min-w-0 border-l border-black/10 pl-3 leading-tight">
              <p className="text-[11px] font-semibold text-ink/55">ร่วมขับเคลื่อนโดย</p>
              <p className="mt-1 text-xs font-black text-ink sm:text-sm">มหาวิทยาลัยราชภัฏยะลา</p>
            </div>
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

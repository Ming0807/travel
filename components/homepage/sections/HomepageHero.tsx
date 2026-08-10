import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageSquare, MapTrifold } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { HomepageSearch } from "@/components/homepage/HomepageSearch";

function stripMarkup(value: string) {
  return value.replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function HeroTitle({ title }: { title: string }) {
  const [before, after] = title.split("ยะลา", 2);
  if (after === undefined) return <>{title}</>;
  return <>{before}<span className="text-coral">ยะลา</span>{after}</>;
}

export function HomepageHero({
  title = "เที่ยวยะลาให้ลึกกว่าเดิม",
  subtitle = "วางแผนการเดินทางในจังหวัดยะลา",
  description = "ค้นพบสถานที่ท่องเที่ยว อาหารท้องถิ่น เส้นทางน่าสนใจ และเรื่องราวจากผู้คนในพื้นที่ เพื่อให้ทุกการเดินทางมีความหมายมากขึ้น",
  images = [
    "",
    "",
    ""
  ]
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
    ? "วางแผนการเดินทางในจังหวัดยะลา"
    : stripMarkup(subtitle);
  const cleanDescription = /ปัตตานี|นราธิวาส/.test(description)
    ? "ค้นพบสถานที่ท่องเที่ยว อาหารท้องถิ่น เส้นทางน่าสนใจ และเรื่องราวจากผู้คนในยะลา เพื่อให้ทุกการเดินทางมีความหมายมากขึ้น"
    : stripMarkup(description);

  return (
    <section className="bg-background px-3 pb-8 pt-4 text-ink sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[420px] overflow-hidden border border-ink/10 bg-ink shadow-soft lg:grid lg:min-h-[410px] lg:grid-cols-[0.92fr_1.08fr] lg:bg-white">
          <div className="absolute inset-0 lg:hidden">
            {img0 ? (
              <Image
                src={img0}
                alt="บรรยากาศการท่องเที่ยวจังหวัดยะลา"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 639px) calc(100vw - 1.5rem), (max-width: 1023px) calc(100vw - 3rem), 0px"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-teal text-white"><ImageSquare size={52} aria-hidden="true" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/15" />
          </div>

          <div className="relative z-10 flex flex-col justify-center px-6 py-10 text-white sm:px-10 lg:px-14 lg:text-ink">
            {cleanSubtitle ? <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-coral">{cleanSubtitle}</p> : null}
            <h1 className="max-w-xl text-[2rem] font-black leading-[1.22] sm:text-4xl lg:text-5xl">
              <HeroTitle title={cleanTitle} />
            </h1>
            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-white/85 sm:text-base lg:text-muted">
              {cleanDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/attractions" className="inline-flex min-h-11 items-center gap-2 bg-coral px-5 text-sm font-bold text-white transition-colors hover:bg-[#C95C3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-coral">
                ค้นหาสถานที่ <ArrowRight aria-hidden="true" weight="bold" />
              </Link>
              <Link href="/routes" className="inline-flex min-h-11 items-center gap-2 border border-white/60 bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral lg:border-ink/20 lg:bg-transparent lg:text-ink">
                <MapTrifold aria-hidden="true" size={20} /> ดูเส้นทางแนะนำ
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[410px] bg-cream lg:block">
            {img0 ? (
              <Image src={img0} alt="บรรยากาศการท่องเที่ยวจังหวัดยะลา" fill priority className="object-cover" sizes="(max-width: 1024px) 0px, 54vw" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-tealSoft text-teal">
                <ImageSquare size={52} aria-hidden="true" />
                <p className="text-sm font-bold">เพิ่มภาพ Hero ผ่านหน้า Settings</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-20 mx-auto -mt-7 w-[calc(100%-1.5rem)] max-w-5xl sm:-mt-8">
          <HomepageSearch />
        </div>
      </div>
    </section>
  );
}

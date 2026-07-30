import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Compass,
  MapPin,
  MagnifyingGlass,
  MapTrifold,
  ShieldCheck,
  Sparkle,
  Star,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { listPublicAttractionCards } from "@/lib/repositories/public-content.repository";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import { SettingsService } from "@/lib/services/settings.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttractionCard } from "@/types/tourism";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

type ProvinceOption = {
  value: string;
  label: string;
};

type TypeOption = {
  value: string;
  label: string;
};

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formatReviewSummary(attraction: AttractionCard) {
  if (!attraction.reviewCount || !attraction.rating) return "ยังไม่มีรีวิว";
  return `${attraction.rating.toFixed(1)} (${attraction.reviewCount.toLocaleString("th-TH")} รีวิว)`;
}

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const search = getParam(resolvedParams, "q");
  const province = getParam(resolvedParams, "province");
  const type = getParam(resolvedParams, "type");

  const settingsService = new SettingsService();
  const supabase = await createSupabaseServerClient();

  const [attractions, heroSettings, bannerSettings, liveProvinces, typesRes] = await Promise.all([
    listPublicAttractionCards(24, { search, province, type }),
    settingsService.getSetting("attractions_page_hero", {
      title: "สำรวจ <span class=\"text-coral\">สถานที่ท่องเที่ยว</span><br/>ในจังหวัดยะลา",
      description:
        "ค้นหาสถานที่จริงจากฐานข้อมูล เลือกจังหวัดและประเภทที่เหมาะกับแผนเดินทางของคุณ",
    }),
    settingsService.getSetting("attractions_page_banner", {
      title: "สถานที่แนะนำ",
      subtitle: "เลือกจากข้อมูลที่เผยแพร่แล้วในระบบ",
      linkText: "ดูเพิ่มเติม",
      linkUrl: "/attractions",
      image: "",
    }),
    listLiveDestinationProvinces(),
    supabase
      .from("attraction_types")
      .select("type_name_en, type_name_th")
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("type_name_th", { ascending: true }),
  ]);

  const provinceOptions: ProvinceOption[] =
    liveProvinces.map((item) => ({
      value: item.nameEn,
      label: item.nameTh,
    }));
  const selectedProvince = provinceOptions.some(
    (item) => item.value === province,
  )
    ? province
    : undefined;

  const typeOptions: TypeOption[] =
    typesRes.data?.map((item) => ({
      value: item.type_name_en,
      label: item.type_name_th,
    })) ?? [];

  const buildAttractionsHref = (updates: Partial<{ q: string; province: string; type: string }>) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedProvince) params.set("province", selectedProvince);
    if (type) params.set("type", type);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const query = params.toString();
    return query ? `/attractions?${query}` : "/attractions";
  };

  const featured = attractions[0] ?? null;
  const hasFilters = Boolean(search || selectedProvince || type);
  const emptyMessage = hasFilters
    ? "ไม่พบสถานที่ท่องเที่ยวที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้น จังหวัด หรือประเภท"
    : "ยังไม่มีสถานที่ท่องเที่ยวที่เผยแพร่ในขณะนี้";

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <nav className="mb-6 flex gap-2 text-xs font-bold uppercase tracking-widest text-muted">
          <Link href="/" className="transition hover:text-ink">หน้าแรก</Link>
          <span>/</span>
          <span className="text-ink">สถานที่ท่องเที่ยว</span>
        </nav>

        <section className="mb-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-coral/20 bg-white px-4 py-2 text-xs font-black text-coral shadow-sm">
              <Sparkle size={14} weight="fill" />
              ข้อมูลจาก CMS ที่เผยแพร่แล้ว
            </div>

            <h1
              className="mb-5 text-4xl font-black leading-tight tracking-tight text-ink md:text-5xl lg:text-6xl"
              dangerouslySetInnerHTML={{ __html: heroSettings.title }}
            />
            <p className="max-w-2xl text-base leading-8 text-muted md:text-lg">
              {heroSettings.description}
            </p>

            <form
              action="/attractions"
              method="GET"
              className={`mt-8 grid gap-3 rounded-3xl border border-ink/10 bg-white p-3 shadow-sm ${
                provinceOptions.length > 1
                  ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.8fr)_minmax(160px,0.8fr)_auto]"
                  : "lg:grid-cols-[minmax(0,1.4fr)_minmax(160px,0.8fr)_auto]"
              }`}
            >
              <label className="relative block">
                <span className="sr-only">ค้นหาสถานที่</span>
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} weight="bold" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search ?? ""}
                  placeholder="ค้นหาชื่อสถานที่หรือ slug"
                  className="h-12 w-full rounded-2xl border border-ink/10 bg-cream/40 pl-11 pr-4 text-sm font-semibold text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/15"
                />
              </label>

              {provinceOptions.length > 1 ? (
                <label className="block">
                  <span className="sr-only">จังหวัดปลายทาง</span>
                  <select
                    name="province"
                    defaultValue={selectedProvince ?? ""}
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-cream/40 px-4 text-sm font-bold text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/15"
                  >
                    <option value="">ทุกจังหวัดที่เปิดให้บริการ</option>
                    {provinceOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block">
                <span className="sr-only">ประเภทสถานที่</span>
                <select
                  name="type"
                  defaultValue={type ?? ""}
                  className="h-12 w-full rounded-2xl border border-ink/10 bg-cream/40 px-4 text-sm font-bold text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/15"
                >
                  <option value="">ทุกประเภท</option>
                  {typeOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-coral px-6 text-sm font-black text-white shadow-sm transition hover:bg-coral/90"
              >
                ค้นหา
              </button>
            </form>

            {hasFilters ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-muted">กำลังกรองผลลัพธ์</span>
                {search ? <span className="rounded-full bg-white px-3 py-1 text-ink">คำค้น: {search}</span> : null}
                {selectedProvince ? <span className="rounded-full bg-white px-3 py-1 text-ink">จังหวัด: {provinceOptions.find((item) => item.value === selectedProvince)?.label ?? selectedProvince}</span> : null}
                {type ? <span className="rounded-full bg-white px-3 py-1 text-ink">ประเภท: {typeOptions.find((item) => item.value === type)?.label ?? type}</span> : null}
                <Link href="/attractions" className="rounded-full px-3 py-1 text-coral transition hover:bg-white">
                  ล้างตัวกรอง
                </Link>
              </div>
            ) : null}
          </div>

          <div className="w-full">
            {featured ? (
              <Link
                href={`/attractions/${featured.slug}`}
                className="group relative block h-[340px] overflow-hidden rounded-3xl border border-ink/5 bg-cream shadow-md sm:h-[420px]"
              >
                {featured.imageUrl ? (
                  <Image
                    src={featured.imageUrl}
                    alt={featured.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 520px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold text-muted">
                    ยังไม่มีรูปภาพหน้าปก
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="mb-3 inline-flex rounded-full bg-coral px-3 py-1 text-xs font-black">
                    ผลลัพธ์แนะนำ
                  </span>
                  <h2 className="text-2xl font-black leading-tight md:text-3xl">{featured.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">{featured.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-ink">
                    เปิดหน้าสถานที่ <ArrowRight size={14} weight="bold" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex h-[340px] items-center justify-center rounded-3xl border border-dashed border-ink/10 bg-white px-6 text-center text-sm font-bold text-muted sm:h-[420px]">
                {emptyMessage}
              </div>
            )}
          </div>
        </section>

        {provinceOptions.length > 1 ? (
        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-ink">เลือกตามจังหวัด</h2>
              <p className="mt-1 text-sm text-muted">กดแล้วไปยังรายการสถานที่ของจังหวัดนั้นทันที</p>
            </div>
            {selectedProvince ? (
              <Link href={buildAttractionsHref({ province: "" })} className="text-sm font-black text-coral hover:underline">
                ดูทุกจังหวัด
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {provinceOptions.map((item) => {
              const isActive = selectedProvince === item.value;
              return (
                <Link
                  href={buildAttractionsHref({ province: item.value })}
                  key={item.value}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
                    isActive ? "border-coral bg-coral text-white shadow-md" : "border-ink/10 bg-white hover:border-coral/30 hover:shadow-sm"
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black">{item.label}</p>
                      <p className={`mt-1 text-xs font-bold uppercase tracking-widest ${isActive ? "text-white/80" : "text-muted"}`}>{item.value}</p>
                    </div>
                    <MapPin size={24} weight="fill" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section id="destinations" className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink">สถานที่ทั้งหมด</h2>
                <p className="mt-1 text-sm text-muted">
                  พบ {attractions.length.toLocaleString("th-TH")} รายการที่พร้อมแสดงผล
                </p>
              </div>
              <Link href="/attractions" className="inline-flex items-center gap-2 text-sm font-black text-coral hover:underline">
                ดูสถานที่ทั้งหมด <ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            {attractions.length > 0 ? (
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                {attractions.map((attraction) => (
                  <AttractionListCard key={attraction.slug} attraction={attraction} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-ink/10 bg-white p-10 text-center">
                <p className="text-sm font-bold text-muted">{emptyMessage}</p>
                {hasFilters ? (
                  <Link href="/attractions" className="mt-4 inline-flex rounded-full bg-coral px-5 py-2 text-sm font-black text-white">
                    ล้างตัวกรอง
                  </Link>
                ) : null}
              </div>
            )}
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-ink/5 bg-teal/5 p-6">
              <h3 className="text-lg font-black text-ink">วางแผนจากข้อมูลจริง</h3>
              <p className="mt-2 text-sm leading-7 text-ink/75">
                สถานที่ที่แสดงในหน้านี้มาจาก CMS และต้องเปิดใช้งานพร้อมเผยแพร่แล้วเท่านั้น
              </p>
              <div className="mt-5 grid gap-2">
                <Link href="/routes" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:text-coral">
                  ดูเส้นทางแนะนำ <MapTrifold weight="bold" />
                </Link>
                <Link href="/stories" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm font-black text-ink transition hover:bg-white hover:text-coral">
                  อ่านเรื่องราวนักเดินทาง <Compass weight="bold" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-ink/5 bg-white p-6">
              <h3 className="text-lg font-black text-ink">ข้อมูลที่เชื่อมกับระบบ</h3>
              <div className="mt-5 space-y-5">
                <InfoItem icon={<ShieldCheck size={22} weight="duotone" />} title="เผยแพร่จาก CMS" text="แอดมินควบคุมสถานะ รูปภาพ เนื้อหา พิกัด และความสัมพันธ์ของเนื้อหาได้จาก Dashboard" />
                <InfoItem icon={<Users size={22} weight="duotone" />} title="รีวิวจากฐานข้อมูล" text="คะแนนและความคิดเห็นจะแสดงเมื่อผ่านการอนุมัติในระบบรีวิวแล้วเท่านั้น" />
                <InfoItem icon={<CalendarCheck size={22} weight="duotone" />} title="ต่อยอด Dashboard" text="การเช็กอินและแบบสอบถามจะเชื่อมกับรายงานด้านการวางแผนท่องเที่ยว" />
              </div>
            </div>

            <Link href={bannerSettings.linkUrl || "/attractions"} className="group relative block h-72 overflow-hidden rounded-3xl border border-ink/5 bg-ink">
              {bannerSettings.image ? (
                <Image
                  src={bannerSettings.image}
                  alt={bannerSettings.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 340px"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h4 className="text-xl font-black leading-tight">{bannerSettings.title}</h4>
                <p className="mt-2 text-sm text-white/80">{bannerSettings.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-black">
                  {bannerSettings.linkText} <ArrowRight size={14} weight="bold" />
                </span>
              </div>
            </Link>
          </aside>
        </div>

        <section className="mt-16 rounded-3xl bg-ink p-8 text-white md:p-10">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">ต่อยอดจากสถานที่สู่ประสบการณ์จริง</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">
                เลือกสถานที่ วางแผนเส้นทาง หรืออ่านเรื่องราวก่อนออกเดินทาง ข้อมูลทั้งหมดเชื่อมกับ CMS และระบบวิเคราะห์หลังบ้าน
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/routes" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-ink transition hover:bg-cream">
                ดูเส้นทางแนะนำ
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
                ติดต่อทีมงาน
              </Link>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}

function AttractionListCard({ attraction }: { attraction: AttractionCard }) {
  return (
    <Link href={`/attractions/${attraction.slug}`} className="group block rounded-3xl border border-ink/5 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
        {attraction.imageUrl ? (
          <Image
            src={attraction.imageUrl}
            alt={attraction.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 520px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-bold text-muted">
            ยังไม่มีรูปภาพ
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-ink shadow-sm">
          {attraction.category}
        </div>
      </div>

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-coral">
            <MapPin size={14} weight="fill" /> {attraction.province}
          </p>
          <p className="flex items-center gap-1 text-xs font-bold text-muted">
            <Star size={14} weight="fill" className="text-amber-500" />
            {formatReviewSummary(attraction)}
          </p>
        </div>
        <h3 className="text-xl font-black leading-tight text-ink transition group-hover:text-coral">{attraction.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{attraction.description || "ยังไม่มีคำอธิบายสั้น"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {attraction.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function InfoItem({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 shrink-0 text-coral">{icon}</div>
      <div>
        <h4 className="text-sm font-black text-ink">{title}</h4>
        <p className="mt-1 text-xs leading-6 text-muted">{text}</p>
      </div>
    </div>
  );
}

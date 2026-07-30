import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicStoryCard } from "@/components/stories/PublicStoryCard";
import {
  listPublicStoryPage,
  listPublicStoryTopics,
} from "@/lib/repositories/public-content.repository";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import {
  buildPublicStoryHref,
  parsePublicStorySearchParams,
} from "@/lib/content/public-story-query";
import { plainTextFromLegacyHtml } from "@/lib/content/plain-text";
import { SettingsService } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "เรื่องราวการเดินทาง | ท่องเที่ยวชายแดนใต้",
  description:
    "บทความ คู่มือ และประสบการณ์จริงจากยะลา ปัตตานี และนราธิวาส",
};

export const revalidate = 60;

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const engagementEnabled = Boolean(
    process.env.CONTENT_ENGAGEMENT_HASH_SECRET,
  );
  const rawSearchParams = await searchParams;
  const parsedQuery = parsePublicStorySearchParams(rawSearchParams);
  const liveProvinces = await listLiveDestinationProvinces();
  const provinceOptions = liveProvinces.map((province) => ({
    value: province.nameEn,
    label: province.nameTh,
  }));
  const query = {
    ...parsedQuery,
    province: provinceOptions.some(
      (province) => province.value === parsedQuery.province,
    )
      ? parsedQuery.province
      : undefined,
  };
  const settingsService = new SettingsService();
  const [storyPage, topics, heroSettings] = await Promise.all([
    listPublicStoryPage(query),
    listPublicStoryTopics(),
    settingsService.getSetting("stories_page_hero", {
      title: "เรื่องราวการเดินทาง",
      description:
        "บทความ คู่มือ และประสบการณ์จริงจากผู้คนที่เดินทางในชายแดนใต้",
    }),
  ]);

  const hasFilters = Boolean(
    query.search || query.province || query.topic || query.authorType
  );
  const showFeatured =
    !hasFilters && query.page === 1 && storyPage.items.length > 0;
  const featuredStory = showFeatured ? storyPage.items[0] : null;
  const stories = showFeatured ? storyPage.items.slice(1) : storyPage.items;
  const heroTitle = plainTextFromLegacyHtml(heroSettings.title);
  const heroDescription = plainTextFromLegacyHtml(heroSettings.description);

  return (
    <div className="min-h-screen bg-white text-ink">
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-8 border-b border-slate-200 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-balance sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 text-pretty sm:text-lg">
              {heroDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              เรื่องราวของฉัน
            </Link>
            <Link
              href="/stories/share"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#075E54] px-5 text-sm font-bold text-white hover:bg-[#064C44]"
            >
              <PenNib size={18} weight="bold" aria-hidden="true" />
              แบ่งปันเรื่องราว
            </Link>
          </div>
        </header>

        <section className="border-b border-slate-200 py-7" aria-labelledby="story-filter-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="story-filter-title" className="text-base font-black text-slate-900">
              ค้นหาเรื่องที่อยากอ่าน
            </h2>
            {hasFilters ? (
              <Link
                href="/stories"
                className="inline-flex min-h-11 items-center text-sm font-bold text-[#075E54] underline underline-offset-4"
              >
                ล้างตัวกรองทั้งหมด
              </Link>
            ) : null}
          </div>
          <form action="/stories" method="get" className="mt-4 grid gap-3 md:grid-cols-12">
            <label className="relative md:col-span-5">
              <span className="sr-only">ค้นหาจากชื่อหรือเนื้อหาเรื่องราว</span>
              <MagnifyingGlass
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                defaultValue={query.search}
                placeholder="ค้นหาชื่อเรื่องหรือคำสำคัญ"
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[#075E54] focus:ring-2 focus:ring-[#075E54]/15"
              />
            </label>
            {provinceOptions.length > 1 ? (
            <label className="md:col-span-3">
              <span className="sr-only">เลือกจังหวัด</span>
              <select
                name="province"
                defaultValue={query.province ?? ""}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#075E54] focus:ring-2 focus:ring-[#075E54]/15"
              >
                <option value="">ทุกจังหวัด</option>
                {provinceOptions.map((province) => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
            </label>
            ) : null}
            <label className="md:col-span-3">
              <span className="sr-only">เลือกหัวข้อ</span>
              <select
                name="topic"
                defaultValue={query.topic ?? ""}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#075E54] focus:ring-2 focus:ring-[#075E54]/15"
              >
                <option value="">ทุกหัวข้อ</option>
                {topics.map((topic) => (
                  <option key={topic.key} value={topic.key}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </label>
            {query.authorType ? (
              <input type="hidden" name="type" value={query.authorType} />
            ) : null}
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 md:col-span-1"
              aria-label="ค้นหาเรื่องราว"
            >
              ค้นหา
            </button>
          </form>

          <nav
            aria-label="กรองตามประเภทผู้เขียน"
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
          >
            {[
              { value: undefined, label: "ทั้งหมด" },
              { value: "admin" as const, label: "บทความจากกองบรรณาธิการ" },
              { value: "tourist" as const, label: "เรื่องจากนักเดินทาง" },
            ].map((item) => {
              const active = query.authorType === item.value;
              return (
                <Link
                  key={item.label}
                  href={buildPublicStoryHref(query, {
                    authorType: item.value,
                  })}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center rounded-lg px-4 text-sm font-bold ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 py-8">
          <p className="text-sm font-semibold text-slate-700">
            พบ {storyPage.total.toLocaleString("th-TH")} เรื่อง
            {hasFilters ? " ตามตัวกรองที่เลือก" : ""}
          </p>
          {storyPage.totalPages > 1 ? (
            <p className="text-sm text-slate-600">
              หน้า {storyPage.page.toLocaleString("th-TH")} จาก{" "}
              {storyPage.totalPages.toLocaleString("th-TH")}
            </p>
          ) : null}
        </div>

        {storyPage.loadError ? (
          <section
            className="border-y border-rose-200 bg-rose-50 py-14 text-center"
            role="alert"
          >
            <h2 className="text-xl font-black text-rose-950">
              ยังโหลดเรื่องราวไม่ได้
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-800">
              ระบบเชื่อมต่อข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง โดยตัวกรองที่เลือกจะยังอยู่
            </p>
            <a
              href={buildPublicStoryHref(query, { page: query.page })}
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-rose-900 px-5 text-sm font-bold text-white hover:bg-rose-800"
            >
              ลองโหลดอีกครั้ง
            </a>
          </section>
        ) : storyPage.items.length === 0 ? (
          <section className="border-y border-slate-200 py-20 text-center">
            <PenNib
              size={42}
              weight="light"
              className="mx-auto text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-black text-slate-900">
              {hasFilters
                ? "ยังไม่พบเรื่องราวตามตัวกรองนี้"
                : "ยังไม่มีเรื่องราวที่เผยแพร่"}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-700">
              {hasFilters
                ? "ลองเปลี่ยนคำค้น จังหวัด หัวข้อ หรือประเภทผู้เขียน"
                : "คุณสามารถแบ่งปันประสบการณ์ เพื่อส่งให้ทีมงานตรวจสอบก่อนเผยแพร่"}
            </p>
            <Link
              href={hasFilters ? "/stories" : "/stories/share"}
              className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-[#075E54] px-5 text-sm font-bold text-white hover:bg-[#064C44]"
            >
              {hasFilters ? "ล้างตัวกรอง" : "เขียนเรื่องราว"}
            </Link>
          </section>
        ) : (
          <>
            {featuredStory ? (
              <section className="pb-14" aria-label="เรื่องแนะนำล่าสุด">
                <PublicStoryCard
                  story={featuredStory}
                  featured
                  tracking={
                    engagementEnabled
                      ? { surface: "story_hub", position: 1 }
                      : undefined
                  }
                />
              </section>
            ) : null}
            {stories.length > 0 ? (
              <section
                className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
                aria-label="รายการเรื่องราว"
              >
                {stories.map((story, index) => (
                  <PublicStoryCard
                    key={story.id}
                    story={story}
                    tracking={
                      engagementEnabled
                        ? {
                            surface: "story_hub",
                            position: index + (featuredStory ? 2 : 1),
                          }
                        : undefined
                    }
                  />
                ))}
              </section>
            ) : null}
          </>
        )}

        {storyPage.totalPages > 1 ? (
          <nav
            aria-label="เปลี่ยนหน้ารายการเรื่องราว"
            className="mt-14 flex items-center justify-between border-t border-slate-200 pt-7"
          >
            {storyPage.page > 1 ? (
              <Link
                href={buildPublicStoryHref(query, {
                  page: storyPage.page - 1,
                })}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <ArrowLeft size={17} weight="bold" aria-hidden="true" />
                หน้าก่อน
              </Link>
            ) : (
              <span />
            )}
            {storyPage.page < storyPage.totalPages ? (
              <Link
                href={buildPublicStoryHref(query, {
                  page: storyPage.page + 1,
                })}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
              >
                หน้าถัดไป
                <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

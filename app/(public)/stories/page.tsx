import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicDirectoryIntro } from "@/components/public/directory/PublicDirectoryIntro";
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
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { SettingsService } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "เรื่องราวจากยะลา | ท่องเที่ยวชายแดนใต้",
  description:
    "บทความ คู่มือ และประสบการณ์จริงจากจังหวัดยะลา ซึ่งผ่านการเผยแพร่ในระบบแล้ว",
  alternates: { canonical: "/stories" },
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
      title: "เรื่องราวจากยะลา",
      description:
        "อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม และประสบการณ์จากนักเดินทาง",
    }),
  ]);

  if (
    !storyPage.loadError &&
    query.page > 1 &&
    (storyPage.totalPages === 0 || query.page > storyPage.totalPages)
  ) {
    redirect(
      buildPublicStoryHref(query, {
        page: storyPage.totalPages > 1 ? storyPage.totalPages : 1,
      }),
    );
  }

  const hasFilters = Boolean(
    query.search || query.province || query.topic || query.authorType,
  );
  const showLatest = !hasFilters && query.page === 1 && storyPage.items.length > 0;
  const latestStory = showLatest ? storyPage.items[0] : null;
  const stories = showLatest ? storyPage.items.slice(1) : storyPage.items;
  const heroTitle = launchSafeAttractionsCopy(
    plainTextFromLegacyHtml(heroSettings.title),
    "เรื่องราวจากยะลา",
  );
  const heroDescription = launchSafeAttractionsCopy(
    plainTextFromLegacyHtml(heroSettings.description),
    "อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม และประสบการณ์จากนักเดินทางในยะลา",
  );

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="directory">
        <PublicDirectoryIntro
          breadcrumbs={[{ label: "หน้าแรก", href: "/" }, { label: "เรื่องราว" }]}
          title={heroTitle}
          description={heroDescription}
          scope="บทความและประสบการณ์ที่ผ่านการเผยแพร่"
        />
        <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--public-radius-control)] border border-black/15 bg-white px-4 text-sm font-black hover:border-[var(--public-teal)] hover:text-[var(--public-teal)]"
            >
              เรื่องราวของฉัน
            </Link>
            <Link
              href="/stories/share"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-5 text-sm font-black text-white hover:bg-[#C95739]"
            >
              <PenNib size={18} weight="bold" aria-hidden="true" />
              แบ่งปันเรื่องราว
            </Link>
        </div>

        <section className="mt-7 rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-4 sm:p-5" aria-labelledby="story-filter-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="story-filter-title" className="text-base font-black">
              ค้นหาเรื่องที่อยากอ่าน
            </h2>
            {hasFilters ? (
              <Link href="/stories" className="inline-flex min-h-11 items-center text-sm font-black text-[var(--public-teal)] hover:text-[var(--public-coral)]">
                ล้างตัวกรองทั้งหมด
              </Link>
            ) : null}
          </div>
          <form
            action="/stories"
            method="get"
            className={`mt-4 grid gap-3 ${
              provinceOptions.length > 1
                ? "md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(170px,.65fr)_minmax(170px,.65fr)_auto]"
                : "md:grid-cols-[minmax(0,1.6fr)_minmax(180px,.7fr)_auto]"
            }`}
          >
            <label className="relative">
              <span className="sr-only">ค้นหาจากชื่อหรือคำโปรยเรื่องราว</span>
              <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/45" aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={query.search}
                placeholder="ค้นหาชื่อเรื่องหรือคำสำคัญ"
                className="min-h-11 w-full rounded-[var(--public-radius-control)] border border-black/15 bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/15"
              />
            </label>
            <label>
              <span className="sr-only">เลือกหัวข้อ</span>
              <select
                name="topic"
                defaultValue={query.topic ?? ""}
                className="min-h-11 w-full rounded-[var(--public-radius-control)] border border-black/15 bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/15"
              >
                <option value="">ทุกหัวข้อ</option>
                {topics.map((topic) => <option key={topic.key} value={topic.key}>{topic.name}</option>)}
              </select>
            </label>
            {provinceOptions.length > 1 ? (
              <label>
                <span className="sr-only">เลือกจังหวัด</span>
                <select
                  name="province"
                  defaultValue={query.province ?? ""}
                  className="min-h-11 w-full rounded-[var(--public-radius-control)] border border-black/15 bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/15"
                >
                  <option value="">ทุกจังหวัดที่เปิดให้บริการ</option>
                  {provinceOptions.map((province) => (
                    <option key={province.value} value={province.value}>{province.label}</option>
                  ))}
                </select>
              </label>
            ) : query.province ? (
              <input type="hidden" name="province" value={query.province} />
            ) : null}
            {query.authorType ? <input type="hidden" name="type" value={query.authorType} /> : null}
            <button type="submit" className="min-h-11 rounded-[var(--public-radius-control)] bg-[var(--public-ink)] px-5 text-sm font-black text-white hover:bg-black" aria-label="ค้นหาเรื่องราว">
              ค้นหา
            </button>
          </form>

          <nav aria-label="กรองตามประเภทผู้เขียน" className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {[
              { value: undefined, label: "ทั้งหมด" },
              { value: "admin" as const, label: "จากกองบรรณาธิการ" },
              { value: "tourist" as const, label: "จากนักเดินทาง" },
            ].map((item) => {
              const active = query.authorType === item.value;
              return (
                <Link
                  key={item.label}
                  href={buildPublicStoryHref(query, { authorType: item.value })}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center rounded-[var(--public-radius-control)] px-4 text-sm font-black ${active ? "bg-[var(--public-teal)] text-white" : "border border-black/15 bg-white text-black/65 hover:border-[var(--public-teal)] hover:text-[var(--public-teal)]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </section>

        <section className="mt-10" aria-labelledby="story-results-heading">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <h2 id="story-results-heading" className="text-2xl font-black">เรื่องที่ค้นพบ</h2>
              <p className="mt-1 text-sm leading-6 text-black/60" aria-live="polite">
                พบ {storyPage.total.toLocaleString("th-TH")} เรื่อง{hasFilters ? " ตามตัวกรองที่เลือก" : " ที่เผยแพร่แล้ว"}
              </p>
            </div>
            {storyPage.totalPages > 1 ? <p className="text-sm font-semibold text-black/60">หน้า {storyPage.page.toLocaleString("th-TH")} จาก {storyPage.totalPages.toLocaleString("th-TH")}</p> : null}
          </div>

          {storyPage.loadError ? (
            <div className="mt-6 border-y border-rose-200 bg-rose-50 py-14 text-center" role="alert">
              <h3 className="text-xl font-black text-rose-950">ยังโหลดเรื่องราวไม่ได้</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-800">ระบบเชื่อมต่อข้อมูลไม่สำเร็จ ตัวกรองของคุณยังคงอยู่และสามารถลองใหม่ได้</p>
              <a href={buildPublicStoryHref(query, { page: query.page })} className="mt-6 inline-flex min-h-11 items-center rounded-[var(--public-radius-control)] bg-rose-900 px-5 text-sm font-black text-white">ลองโหลดอีกครั้ง</a>
            </div>
          ) : storyPage.items.length === 0 ? (
            <div className="mt-6 border-y border-black/10 py-16 text-center">
              <PenNib size={40} weight="light" className="mx-auto text-black/35" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-black">{hasFilters ? "ยังไม่พบเรื่องราวตามตัวกรองนี้" : "ยังไม่มีเรื่องราวที่เผยแพร่"}</h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/60">{hasFilters ? "ลองเปลี่ยนคำค้น หัวข้อ หรือประเภทผู้เขียน" : "เมื่อทีมงานตรวจสอบและเผยแพร่เรื่องราว รายการจะปรากฏที่นี่"}</p>
              <Link href={hasFilters ? "/stories" : "/stories/share"} className="mt-7 inline-flex min-h-11 items-center rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-5 text-sm font-black text-white">
                {hasFilters ? "ล้างตัวกรอง" : "ส่งเรื่องให้ทีมตรวจสอบ"}
              </Link>
            </div>
          ) : (
            <>
              {latestStory ? (
                <div className="mt-7">
                  <PublicStoryCard story={latestStory} featured label="เรื่องล่าสุด" tracking={engagementEnabled ? { surface: "story_hub", position: 1 } : undefined} />
                </div>
              ) : null}
              {stories.length > 0 ? (
                <div className="mt-8 grid gap-x-7 gap-y-10 md:grid-cols-2 lg:grid-cols-3" aria-label="รายการเรื่องราว">
                  {stories.map((story, index) => (
                    <PublicStoryCard key={story.id} story={story} tracking={engagementEnabled ? { surface: "story_hub", position: index + (latestStory ? 2 : 1) } : undefined} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>

        {storyPage.totalPages > 1 ? (
          <nav aria-label="เปลี่ยนหน้ารายการเรื่องราว" className="mt-14 flex items-center justify-between border-t border-black/10 pt-7">
            {storyPage.page > 1 ? (
              <Link href={buildPublicStoryHref(query, { page: storyPage.page - 1 })} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--public-radius-control)] border border-black/15 bg-white px-4 text-sm font-black hover:border-[var(--public-teal)]">
                <ArrowLeft size={17} weight="bold" aria-hidden="true" /> หน้าก่อน
              </Link>
            ) : <span />}
            {storyPage.page < storyPage.totalPages ? (
              <Link href={buildPublicStoryHref(query, { page: storyPage.page + 1 })} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-ink)] px-4 text-sm font-black text-white hover:bg-black">
                หน้าถัดไป <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            ) : <span />}
          </nav>
        ) : null}
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import {
  ArrowLeft,
  Clock,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicStoryCard } from "@/components/stories/PublicStoryCard";
import { StoryDetailEngagement } from "@/components/stories/StoryEngagementTracker";
import {
  StoryDocumentRenderer,
  LegacyStoryContent,
  buildStoryTableOfContents,
} from "@/components/stories/StoryDocumentRenderer";
import { StoryShareActions } from "@/components/stories/StoryShareActions";
import { getPublicStory } from "@/lib/repositories/public-content.repository";

export const revalidate = 60;

const loadPublicStory = cache(getPublicStory);

function publicUrl(path: string): string {
  return new URL(
    path,
    process.env.NEXT_PUBLIC_APP_URL || "https://southernborder.app"
  ).toString();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadPublicStory(id);

  if (!data) {
    return {
      title: "ไม่พบเรื่องราว | ท่องเที่ยวชายแดนใต้",
      robots: { index: false, follow: false },
    };
  }

  const { story } = data;
  const title = story.seoTitle || story.title;
  const description = story.seoDescription || story.excerpt;
  const canonical = `/stories/${story.id}`;
  const images = story.imageUrl
    ? [{ url: story.imageUrl, alt: story.imageAlt }]
    : undefined;

  return {
    title: `${title} | ท่องเที่ยวชายแดนใต้`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "th_TH",
      url: canonical,
      title,
      description,
      publishedTime: story.publishedAt ?? undefined,
      modifiedTime: story.updatedAt ?? undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: story.imageUrl ? [story.imageUrl] : undefined,
    },
  };
}

function formatStoryDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(date);
}

export default async function StoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadPublicStory(id);
  if (!data) notFound();

  const { story, relatedStories, relatedDestinations } = data;
  const engagementEnabled = Boolean(
    process.env.CONTENT_ENGAGEMENT_HASH_SECRET,
  );
  const toc = story.contentDocument
    ? buildStoryTableOfContents(story.contentDocument)
    : [];
  const storyUrl = publicUrl(`/stories/${story.id}`);
  const updatedDate = formatStoryDate(story.updatedAt);
  const showUpdatedDate = Boolean(
    updatedDate && story.updatedAt !== story.publishedAt,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.seoDescription || story.excerpt,
    datePublished: story.publishedAt,
    dateModified: story.updatedAt ?? story.publishedAt,
    inLanguage: story.primaryLanguage,
    image: story.imageUrl ? [publicUrl(story.imageUrl)] : undefined,
    mainEntityOfPage: storyUrl,
    author:
      story.authorType === "tourist"
        ? { "@type": "Person", name: story.authorName }
        : {
            "@type": "Organization",
            name: "ท่องเที่ยวชายแดนใต้",
          },
  };

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <nav aria-label="เส้นทางนำทาง">
          <Link
            href="/stories"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-black/65 hover:text-[var(--public-coral)]"
          >
            <ArrowLeft size={17} weight="bold" aria-hidden="true" />
            กลับไปหน้ารวมเรื่องราว
          </Link>
        </nav>

        <header className="mx-auto max-w-5xl border-b border-black/10 pb-9 pt-8">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-black/60">
            <span>{story.category}</span>
            {story.province ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{story.province}</span>
              </>
            ) : null}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-balance sm:text-5xl lg:text-6xl">
            {story.title}
          </h1>
          {story.excerpt ? (
            <p className="mt-6 max-w-[70ch] text-base leading-7 text-black/70 text-pretty sm:text-lg">
              {story.excerpt}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-black/60">
            <span className="font-bold text-[var(--public-ink)]">{story.authorName}</span>
            <span aria-hidden="true">•</span>
            <span>
              {story.authorType === "tourist"
                ? "ประสบการณ์จากนักเดินทาง"
                : "บทความจากกองบรรณาธิการ"}
            </span>
            <span aria-hidden="true">•</span>
            <span>{story.date}</span>
            {showUpdatedDate ? (
              <span>อัปเดต {updatedDate}</span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock size={15} weight="bold" aria-hidden="true" />
              อ่านประมาณ {story.readingMinutes} นาที
            </span>
          </div>
          <div className="mt-7 flex">
            <StoryShareActions title={story.title} url={storyUrl} />
          </div>
        </header>

        <div className="relative mx-auto mt-8 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-[var(--public-radius-panel)] bg-white">
          {story.imageUrl ? (
            <Image
              src={story.imageUrl}
              alt={story.imageAlt}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1024px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm font-semibold text-slate-600">
              <FileText size={34} aria-hidden="true" />
              เรื่องนี้ยังไม่มีภาพปก
            </div>
          )}
        </div>

        {toc.length > 0 ? (
          <details className="mx-auto mt-8 max-w-3xl rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-4 lg:hidden">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-black text-slate-900">
              สารบัญเนื้อหา
            </summary>
            <ol className="mt-2 space-y-2 border-t border-slate-200 pt-3">
              {toc.map((item) => (
                <li key={item.id} className={item.level > 2 ? "pl-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex min-h-10 items-center text-sm font-semibold text-black/70 hover:text-[var(--public-coral)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        <div className="mt-12 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)_120px] lg:items-start">
          {toc.length > 0 ? (
            <aside className="sticky top-24 hidden lg:block" aria-label="สารบัญเนื้อหา">
              <h2 className="text-sm font-black text-slate-900">สารบัญ</h2>
              <ol className="mt-3 space-y-1 border-t border-slate-200 pt-3">
                {toc.map((item) => (
                  <li key={item.id} className={item.level > 2 ? "pl-3" : ""}>
                    <a
                      href={`#${item.id}`}
                      className="block py-2 text-sm font-semibold leading-5 text-black/60 hover:text-[var(--public-coral)]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          ) : (
            <span className="hidden lg:block" />
          )}

          <article>
            {story.contentDocument ? (
              <StoryDocumentRenderer document={story.contentDocument} />
            ) : (
              <LegacyStoryContent content={story.content} fallback={story.excerpt} />
            )}
            {engagementEnabled && story.storyId > 0 ? (
              <StoryDetailEngagement
                storyId={story.storyId}
                locale={story.primaryLanguage === "en" ? "en" : "th"}
              />
            ) : null}
          </article>
          <span className="hidden lg:block" />
        </div>

        {relatedDestinations.length > 0 ? (
          <section className="mx-auto mt-20 max-w-5xl border-t border-black/10 pt-10" aria-labelledby="story-destinations-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="story-destinations-heading" className="text-2xl font-black sm:text-3xl">
                  สถานที่ที่กล่าวถึงในเรื่องนี้
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/60">
                  เปิดข้อมูลสถานที่จริงในระบบเพื่อวางแผนเดินทางต่อ
                </p>
              </div>
              <Link href="/attractions" className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--public-teal)] hover:text-[var(--public-coral)]">
                ดูสถานที่ทั้งหมด
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedDestinations.map((destination) => (
                <Link
                  key={destination.slug}
                  href={`/attractions/${destination.slug}`}
                  className="group grid grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-[var(--public-radius-panel)] border border-black/10 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-coral)]"
                >
                  <div className="relative min-h-28 bg-slate-100">
                    {destination.imageUrl ? (
                      <Image src={destination.imageUrl} alt={destination.imageAlt} fill sizes="112px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-black leading-6 group-hover:text-[var(--public-coral)]">{destination.name}</h3>
                    {destination.province ? <p className="mt-2 text-xs font-semibold text-black/55">{destination.province}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {relatedStories.length > 0 ? (
          <section className="mx-auto mt-20 max-w-5xl border-t border-black/10 pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  เรื่องที่น่าอ่านต่อ
                </h2>
                <p className="mt-2 text-sm text-black/60">
                  คัดจากความสัมพันธ์ของหัวข้อ สถานที่ และลำดับที่ทีมเนื้อหากำหนด
                </p>
              </div>
              <Link
                href="/stories"
                className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--public-teal)] hover:text-[var(--public-coral)]"
              >
                ดูเรื่องราวทั้งหมด
              </Link>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {relatedStories.map((recommendation, index) => (
                <PublicStoryCard
                  key={recommendation.story.id}
                  story={recommendation.story}
                  reason={recommendation.reasonLabel}
                  tracking={
                    engagementEnabled
                      ? {
                          surface: "related_rail",
                          sourceStoryId: story.storyId,
                          position: index + 1,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

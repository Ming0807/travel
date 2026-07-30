import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicStoryCard } from "@/components/stories/PublicStoryCard";
import {
  StoryDocumentRenderer,
  buildStoryTableOfContents,
} from "@/components/stories/StoryDocumentRenderer";
import { StoryShareActions } from "@/components/stories/StoryShareActions";
import { getPublicStory } from "@/lib/repositories/public-content.repository";

export const revalidate = 60;

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
  const data = await getPublicStory(id);

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

function storyParagraphs(content: string | null, excerpt: string) {
  const source = content?.trim() || excerpt.trim();
  return source
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function StoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicStory(id);
  if (!data) notFound();

  const { story, relatedStories } = data;
  const paragraphs = storyParagraphs(story.content, story.excerpt);
  const toc = story.contentDocument
    ? buildStoryTableOfContents(story.contentDocument)
    : [];
  const storyUrl = publicUrl(`/stories/${story.id}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.seoDescription || story.excerpt,
    datePublished: story.publishedAt,
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
    <div className="min-h-screen bg-white text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <nav aria-label="เส้นทางนำทาง">
          <Link
            href="/stories"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#075E54]"
          >
            <ArrowLeft size={17} weight="bold" aria-hidden="true" />
            กลับไปหน้ารวมเรื่องราว
          </Link>
        </nav>

        <header className="mx-auto max-w-4xl pb-10 pt-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-slate-600">
            <span>{story.category}</span>
            {story.province ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{story.province}</span>
              </>
            ) : null}
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight text-balance sm:text-5xl lg:text-6xl">
            {story.title}
          </h1>
          {story.excerpt ? (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-700 text-pretty sm:text-lg">
              {story.excerpt}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-slate-600">
            <span className="font-bold text-slate-800">{story.authorName}</span>
            <span aria-hidden="true">•</span>
            <span>
              {story.authorType === "tourist"
                ? "ประสบการณ์จากนักเดินทาง"
                : "บทความจากกองบรรณาธิการ"}
            </span>
            <span aria-hidden="true">•</span>
            <span>{story.date}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={15} weight="bold" aria-hidden="true" />
              อ่านประมาณ {story.readingMinutes} นาที
            </span>
          </div>
          <div className="mt-7 flex justify-center">
            <StoryShareActions title={story.title} url={storyUrl} />
          </div>
        </header>

        <div className="relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-lg bg-slate-100">
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
          <details className="mx-auto mt-10 max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-4 lg:hidden">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-black text-slate-900">
              สารบัญเนื้อหา
            </summary>
            <ol className="mt-2 space-y-2 border-t border-slate-200 pt-3">
              {toc.map((item) => (
                <li key={item.id} className={item.level > 2 ? "pl-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex min-h-10 items-center text-sm font-semibold text-slate-700 hover:text-[#075E54]"
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
                      className="block py-2 text-sm font-semibold leading-5 text-slate-600 hover:text-[#075E54]"
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
            ) : story.content &&
              story.authorType !== "tourist" &&
              /<[a-z][\s\S]*>/i.test(story.content) ? (
              <div
                className="prose prose-lg mx-auto max-w-[70ch] prose-headings:font-black prose-headings:text-ink prose-p:leading-8 prose-p:text-slate-800 prose-a:font-bold prose-a:text-[#075E54] prose-a:underline prose-a:underline-offset-4 md:prose-xl"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />
            ) : (
              <div className="prose prose-lg mx-auto max-w-[70ch] prose-p:leading-8 prose-p:text-slate-800 md:prose-xl">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 24)}`}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <div className="border-y border-slate-200 py-12 text-center text-sm font-semibold text-slate-600">
                    เรื่องนี้ยังไม่มีเนื้อหาฉบับเต็ม
                  </div>
                )}
              </div>
            )}
          </article>
          <span className="hidden lg:block" />
        </div>

        {relatedStories.length > 0 ? (
          <section className="mt-24 border-t border-slate-200 pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  เรื่องที่น่าอ่านต่อ
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  เนื้อหาเพิ่มเติมจากจังหวัดชายแดนใต้
                </p>
              </div>
              <Link
                href="/stories"
                className="inline-flex min-h-11 items-center text-sm font-bold text-[#075E54] underline underline-offset-4"
              >
                ดูเรื่องราวทั้งหมด
              </Link>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {relatedStories.map((recommendation) => (
                <PublicStoryCard
                  key={recommendation.story.id}
                  story={recommendation.story}
                  reason={recommendation.reasonLabel}
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

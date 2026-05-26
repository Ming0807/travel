import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarBlank, Clock, FileText } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicStory } from "@/lib/repositories/public-content.repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getPublicStory(id);

  if (!data) {
    return { title: "Story Not Found" };
  }

  return {
    title: `${data.story.title} | Southern Border Tourism`,
    description: data.story.excerpt,
  };
}

function storyParagraphs(content: string | null, excerpt: string) {
  const source = content?.trim() || excerpt.trim();
  return source
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function StoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicStory(id);

  if (!data) {
    notFound();
  }

  const { story, relatedStories } = data;
  const paragraphs = storyParagraphs(story.content, story.excerpt);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink">
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 md:pt-20 lg:px-8">
        <Link href="/stories" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-coral">
          <ArrowLeft size={16} weight="bold" />
          Back to stories
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <article className="lg:col-span-8">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted">
              <span className="rounded-full bg-coral px-3 py-1 text-white">{story.category || "Story"}</span>
              {story.province ? <span>{story.province}</span> : null}
              {story.date ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarBlank size={14} />
                  {story.date}
                </span>
              ) : null}
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight text-ink md:text-5xl lg:text-6xl">
              {story.title}
            </h1>

            {story.excerpt ? (
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
                {story.excerpt}
              </p>
            ) : null}

            <div className="mt-8 flex items-center gap-3 border-y border-ink/10 py-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf text-sm font-black text-white">
                ST
              </div>
              <div>
                <p className="text-sm font-black text-ink">Southern Border Tourism Editorial</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-muted">
                  <Clock size={14} />
                  Editorial story
                </p>
              </div>
            </div>

            <div className="relative mt-10 h-[320px] overflow-hidden rounded-[2rem] border border-ink/5 bg-cream shadow-sm md:h-[500px]">
              {story.imageUrl ? (
                <Image
                  src={story.imageUrl}
                  alt={story.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-sm font-semibold text-muted">
                  <FileText size={32} className="text-leaf" />
                  Image not added
                </div>
              )}
            </div>

            <div className="prose prose-lg mt-12 max-w-none prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink/75">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <div className="rounded-2xl border border-dashed border-ink/10 bg-white p-6 text-sm font-semibold text-muted">
                  Full story content has not been added yet.
                </div>
              )}
            </div>
          </article>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-[2rem] border border-ink/5 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-ink">Story Details</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-muted">Category</dt>
                  <dd className="mt-1 font-semibold text-ink">{story.category || "Story"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-muted">Province</dt>
                  <dd className="mt-1 font-semibold text-ink">{story.province || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-muted">Published</dt>
                  <dd className="mt-1 font-semibold text-ink">{story.date || "Not specified"}</dd>
                </div>
              </dl>
            </div>

            {relatedStories.length > 0 ? (
              <div className="rounded-[2rem] border border-ink/5 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-ink">Related Stories</h2>
                <div className="mt-5 space-y-5">
                  {relatedStories.map((related) => (
                    <Link key={related.id} href={`/stories/${related.id}`} className="group flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                        {related.imageUrl ? (
                          <Image
                            src={related.imageUrl}
                            alt={related.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-semibold text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-coral">{related.category || "Story"}</p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-ink transition-colors group-hover:text-coral">
                          {related.title}
                        </h3>
                        {related.date ? <p className="mt-1 text-[10px] font-semibold text-muted">{related.date}</p> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicStory } from "@/lib/repositories/public-content.repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
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

export default async function StoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicStory(id);

  if (!data) {
    notFound();
  }

  const { story, relatedStories } = data;
  const paragraphs = storyParagraphs(story.content, story.excerpt);

  const readTimeWords = (story.content || story.excerpt || "").split(
    /\s+/,
  ).length;
  const readTime =
    readTimeWords > 0 ? Math.max(1, Math.ceil(readTimeWords / 220)) : 1;

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-ink selection:text-white">
      <main className="mx-auto max-w-5xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <Link
          href="/stories"
          className="mb-12 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted transition-colors hover:text-coral"
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Back to stories</span>
        </Link>

        {/* Hero Section */}
        <header className="mx-auto max-w-4xl text-center mb-20 mt-8">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-ink/50">
            <span>{story.category || "Story"}</span>
            {story.province && (
              <>
                <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                <span className="text-ink">{story.province}</span>
              </>
            )}
          </div>

          <h1 className="text-5xl font-black leading-[1.05] text-ink md:text-6xl lg:text-7xl text-balance mb-8">
            {story.title}
          </h1>

          {story.excerpt && (
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-ink/70 font-medium text-pretty">
              {story.excerpt}
            </p>
          )}

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 border-y border-ink/10 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-ink">
                {story.authorType === "tourist"
                  ? story.authorName.charAt(0).toUpperCase()
                  : "A"}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-ink">
                  {story.authorName}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  {story.authorType === "tourist" ? "Tourist UGC" : "Editorial"}
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-ink/10"></div>
            <div className="flex items-center gap-4 text-left">
              <div>
                <p className="text-sm font-black text-ink">
                  {story.date || "Not specified"}
                </p>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/50 mt-0.5">
                  <Clock size={14} weight="bold" />
                  {readTime} min read
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative mx-auto w-full h-[50vh] min-h-[400px] overflow-hidden bg-slate-100 md:h-[70vh] mb-24">
          {story.imageUrl ? (
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center text-sm font-semibold text-muted bg-ink/5">
              <FileText size={32} />
              No cover image
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Main Content */}
          <article className="lg:col-span-8 lg:col-start-3">
            {story.content && /<[a-z][\s\S]*>/i.test(story.content) ? (
              <div 
                className="prose prose-lg md:prose-xl mx-auto max-w-[65ch] prose-headings:font-black prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink/80 prose-p:mb-8 prose-a:text-ink prose-a:font-bold prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-ink/70 prose-img:rounded-2xl prose-img:mx-auto prose-img:my-10"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />
            ) : (
              <div className="prose prose-lg md:prose-xl mx-auto max-w-[65ch] prose-headings:font-black prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink/80 prose-p:mb-8 prose-a:text-ink prose-a:font-bold prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-ink/70 prose-img:rounded-2xl">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <div className="border border-dashed border-ink/20 bg-slate-50 p-12 text-center text-sm font-bold text-ink/50">
                    Full story content has not been added yet.
                  </div>
                )}
              </div>
            )}
          </article>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="mt-32 border-t border-ink/10 pt-20">
            <div className="flex items-end justify-between mb-16">
              <h2 className="text-3xl font-black text-ink">Read Next</h2>
              <Link
                href="/stories"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink hover:text-ink/70 transition-colors"
              >
                View all stories <ArrowUpRight size={16} weight="bold" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {relatedStories.map((related) => (
                <Link
                  key={related.id}
                  href={`/stories/${related.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 mb-6">
                    {related.imageUrl ? (
                      <Image
                        src={related.imageUrl}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-100" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink/50">
                      {related.category}
                    </span>
                    <span className="text-ink/20">•</span>
                    <span className="text-[10px] font-bold text-ink uppercase tracking-wide">
                      {related.authorName}
                    </span>
                  </div>
                  <h3 className="text-xl font-black leading-snug text-ink transition-colors group-hover:text-ink/70">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, PenNib, Clock } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { listPublicStories } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "เรื่องราว | ท่องเที่ยวชายแดนใต้",
  description: "เรื่องราวการเดินทางจากยะลา ปัตตานี และนราธิวาส",
};

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const settingsService = new SettingsService();
  const [allStories, heroSettings] = await Promise.all([
    listPublicStories({ limit: 20 }),
    settingsService.getSetting("stories_page_hero", {
      title: "เรื่องราวการเดินทาง",
      description:
        "บทความและเรื่องราวที่ถูกกลั่นกรองผ่านประสบการณ์ของนักเดินทาง ท้องถิ่น และผู้มาเยือน",
    }),
  ]);

  const featuredStory = allStories[0];
  const remainingStories = allStories.slice(1);

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-ink selection:text-white">
      <main className="mx-auto max-w-5xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <header className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end border-b border-ink/10 pb-12">
          <div className="md:col-span-8">
            <h1
              className="text-5xl md:text-7xl font-black tracking-tight text-ink leading-[1.05]"
              dangerouslySetInnerHTML={{ __html: heroSettings.title }}
            />
            <p className="mt-6 max-w-xl text-lg md:text-xl leading-relaxed text-ink/70 font-medium text-pretty">
              {heroSettings.description}
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <Link
              href="/stories/share"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-ink/80 hover:-translate-y-0.5 active:translate-y-0"
            >
              <PenNib size={18} weight="fill" />
              <span>Share Your Story</span>
            </Link>
          </div>
        </header>

        {featuredStory && (
          <section className="mb-24">
            <Link href={`/stories/${featuredStory.id}`} className="group block">
              <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                <div className="lg:col-span-7 order-2 lg:order-1 mt-6 lg:mt-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink/50">
                      {featuredStory.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                    <span className="text-xs font-bold text-ink uppercase tracking-wide">
                      {featuredStory.authorName}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-ink group-hover:text-ink/70 transition-colors duration-300 text-balance">
                    {featuredStory.title}
                  </h2>
                  <p className="mt-6 md:mt-8 text-lg md:text-xl text-ink/70 leading-relaxed font-medium text-pretty">
                    {featuredStory.excerpt}
                  </p>
                  <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink">
                    <span>Read Story</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 ease-out group-hover:translate-x-2"
                    />
                  </div>
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                    {featuredStory.imageUrl ? (
                      <Image
                        src={featuredStory.imageUrl}
                        alt={featuredStory.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-100" />
                    )}
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {remainingStories.length > 0 && (
          <section className="border-t border-ink/10 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {remainingStories.map((story) => (
                <Link
                  href={`/stories/${story.id}`}
                  key={story.id}
                  className="group flex flex-col h-full"
                >
                  <article className="flex flex-col h-full">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 mb-6">
                      {story.imageUrl ? (
                        <Image
                          src={story.imageUrl}
                          alt={story.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-100" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-ink/50">
                          {story.category}
                        </span>
                        <span className="text-ink/20">•</span>
                        <span className="text-[10px] font-bold text-ink uppercase tracking-wide">
                          {story.authorName}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black leading-snug text-ink mb-3 group-hover:text-ink/70 transition-colors text-balance">
                        {story.title}
                      </h3>
                      <p className="text-sm text-ink/70 leading-relaxed line-clamp-3 mb-6 text-pretty">
                        {story.excerpt}
                      </p>
                      <div className="mt-auto flex items-center gap-1.5 text-[11px] font-bold text-ink/50 uppercase tracking-widest">
                        <Clock size={14} weight="bold" />
                        <span>{story.date}</span>
                      </div>
                    </div>
                  </article>
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

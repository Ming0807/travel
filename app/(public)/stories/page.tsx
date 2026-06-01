import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, FileText, Star } from "@phosphor-icons/react/dist/ssr";
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
  const [allStories, heroSettings, ctaSettings] = await Promise.all([
    listPublicStories({ limit: 12 }),
    settingsService.getSetting("stories_page_hero", {
      title: "เรื่องราวและ<br/>แรงบันดาลใจในการเดินทาง",
      description: "บทความและเรื่องราวการเดินทางจากชุมชนชายแดนใต้",
    }),
    settingsService.getSetting("stories_page_cta", {
      title: "สำรวจเรื่องราวเพิ่มเติม",
      subtitle: "อ่านบทความท่องเที่ยวล่าสุดจากยะลา ปัตตานี และนราธิวาส",
      linkText: "ดูเรื่องราวทั้งหมด",
      linkUrl: "/stories",
      image: "",
    }),
  ]);

  const featuredStory = allStories[0];
  const editorPicks = allStories.slice(1, 4);
  const remainingStories = featuredStory ? allStories.slice(1) : allStories;

  return (
    <div className="min-h-screen bg-background text-ink">
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 md:pt-20 lg:px-8">
        <div className="mb-6 flex gap-2 text-xs font-bold uppercase tracking-widest text-muted">
          <Link href="/" className="transition-colors hover:text-coral">หน้าแรก</Link>
          <span>/</span>
          <span className="text-ink">เรื่องราว</span>
        </div>

        <section className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <h1 className="text-5xl font-black leading-tight text-ink md:text-6xl" dangerouslySetInnerHTML={{ __html: heroSettings.title }} />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {heroSettings.description}
            </p>
          </div>

          <div className="lg:col-span-7">
            {featuredStory ? (
              <Link href={`/stories/${featuredStory.id}`} className="group block overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm transition hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative h-72 overflow-hidden bg-cream md:h-96">
                    {featuredStory.imageUrl ? (
                      <Image
                        src={featuredStory.imageUrl}
                        alt={featuredStory.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-sm font-semibold text-muted">
                        <FileText size={30} className="text-leaf" />
                        ยังไม่มีรูปภาพ
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-coral px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      เรื่องเด่น
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-7 md:p-8">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-coral">{featuredStory.category || "Story"}</p>
                    <h2 className="text-2xl font-black leading-snug text-ink transition-colors group-hover:text-coral">
                      {featuredStory.title}
                    </h2>
                    {featuredStory.excerpt ? (
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
                        {featuredStory.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-6 flex items-center justify-between border-t border-ink/5 pt-5">
                      <span className="flex items-center gap-1 text-xs font-bold text-muted">
                        <Clock size={14} />
                        {featuredStory.date || "เผยแพร่แล้ว"}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-black text-coral">
                        อ่านต่อ <ArrowRight size={14} weight="bold" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/10 bg-white p-10 text-center text-sm font-semibold text-muted">
                ยังไม่มีเรื่องราวที่เผยแพร่ในขณะนี้
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/5 pb-4">
              <div>
                <h2 className="text-2xl font-black text-ink">เรื่องราวทั้งหมด</h2>
                <p className="mt-1 text-sm font-semibold text-muted">{allStories.length} เรื่อง</p>
              </div>
            </div>

            {remainingStories.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {remainingStories.map((story) => (
                  <Link href={`/stories/${story.id}`} key={story.id} className="group block">
                    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-ink/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                      <div className="relative h-48 w-full overflow-hidden bg-cream">
                        {story.imageUrl ? (
                          <Image
                            src={story.imageUrl}
                            alt={story.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-muted">
                            Image not added
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-coral">{story.category || "Story"}</p>
                        <h3 className="line-clamp-2 text-lg font-black leading-snug text-ink transition-colors group-hover:text-coral">
                          {story.title}
                        </h3>
                        {story.excerpt ? (
                          <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
                            {story.excerpt}
                          </p>
                        ) : <div className="flex-1" />}
                        <p className="mt-5 border-t border-ink/5 pt-4 text-[10px] font-semibold text-muted">{story.date || "เผยแพร่แล้ว"}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : featuredStory ? (
              <div className="rounded-xl border border-dashed border-ink/10 bg-white p-8 text-center text-sm font-semibold text-muted">
                เรื่องราวเพิ่มเติมจะปรากฏที่นี่หลังจากเผยแพร่
              </div>
            ) : null}
          </section>

          <aside className="space-y-8 lg:col-span-4">
            <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Star size={20} weight="fill" className="text-coral" />
                <h2 className="text-lg font-black text-ink">บทความแนะนำ</h2>
              </div>
              {editorPicks.length > 0 ? (
                <div className="space-y-5">
                  {editorPicks.map((pick) => (
                    <Link href={`/stories/${pick.id}`} key={pick.id} className="group flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                        {pick.imageUrl ? (
                          <Image src={pick.imageUrl} alt={pick.title} fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-semibold text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-coral">{pick.category || "Story"}</p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-ink transition-colors group-hover:text-coral">
                          {pick.title}
                        </h3>
                        <p className="mt-1 text-[10px] font-semibold text-muted">{pick.date || "เผยแพร่แล้ว"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-muted">เผยแพร่เรื่องราวเพิ่มเติมเพื่อแสดงบทความแนะนำ</p>
              )}
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <div className="relative flex min-h-40 flex-col items-center justify-between gap-5 overflow-hidden rounded-2xl bg-ink px-8 py-8 text-center shadow-md md:flex-row md:px-12 md:text-left">
            {ctaSettings.image ? (
              <Image
                src={ctaSettings.image}
                alt={ctaSettings.title}
                fill
                className="object-cover opacity-30"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,#073F37,#0A6B62)]" />
            )}
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white">{ctaSettings.title}</h2>
              <p className="mt-1 text-sm text-white/80">{ctaSettings.subtitle}</p>
            </div>
            <Link href={ctaSettings.linkUrl} className="relative z-10 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-coral/90">
              {ctaSettings.linkText} <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

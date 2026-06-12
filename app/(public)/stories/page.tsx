import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, PenNib, Clock, LockKey } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listPublicStories, listMyStories } from "@/lib/repositories/public-content.repository";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { SettingsService } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "เรื่องราว | ท่องเที่ยวชายแดนใต้",
  description: "เรื่องราวการเดินทางจากยะลา ปัตตานี และนราธิวาส",
};

export const dynamic = "force-dynamic";

export default async function StoriesPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const authorType = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit) || 12 : 12;

  let touristId: string | undefined;
  try {
    touristId = await resolveCurrentTouristId();
  } catch (e) {
    // Not logged in or no identity
  }

  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session?.user;

  const settingsService = new SettingsService();
  const [allFetchedStories, heroSettings] = await Promise.all([
    authorType === 'mine' && touristId
      ? listMyStories(touristId, { limit: limit + 1 })
      : listPublicStories({ limit: limit + 1, authorType: authorType === 'mine' ? undefined : authorType }),
    settingsService.getSetting("stories_page_hero", {
      title: "เรื่องราวการเดินทาง",
      description:
        "บทความและเรื่องราวที่ถูกกลั่นกรองผ่านประสบการณ์ของนักเดินทาง ท้องถิ่น และผู้มาเยือน",
    }),
  ]);

  const hasMore = allFetchedStories.length > limit;
  const allStories = allFetchedStories.slice(0, limit);

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
              {isAuthenticated ? (
                <PenNib size={18} weight="fill" />
              ) : (
                <LockKey size={18} weight="fill" />
              )}
              <span>แบ่งปันเรื่องราว</span>
            </Link>
          </div>
        </header>

        {/* Category Filters (Aesthetic for MVP) */}
        <div className="mb-16 flex flex-wrap gap-3">
          <Link href="/stories" className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${!authorType ? 'bg-ink text-white' : 'border border-ink/10 bg-transparent text-ink hover:border-ink/30'}`}>
            เรื่องราวทั้งหมด
          </Link>
          <Link href="/stories?category=admin" className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${authorType === 'admin' ? 'bg-ink text-white' : 'border border-ink/10 bg-transparent text-ink hover:border-ink/30'}`}>
            ไกด์แนะนำ
          </Link>
          <Link href="/stories?category=tourist" className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${authorType === 'tourist' ? 'bg-ink text-white' : 'border border-ink/10 bg-transparent text-ink hover:border-ink/30'}`}>
            บันทึกนักเดินทาง
          </Link>
          {touristId && (
            <Link href="/stories?category=mine" className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${authorType === 'mine' ? 'bg-ink text-white' : 'border border-ink/10 bg-transparent text-ink hover:border-ink/30'}`}>
              เรื่องราวของฉัน
            </Link>
          )}
        </div>

        {allStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <PenNib size={48} weight="thin" className="text-ink/30" />
            </div>
            <h2 className="mb-3 text-2xl font-black text-ink">ยังไม่มีเรื่องราว</h2>
            <p className="mb-8 max-w-md text-ink/60">
              ร่วมเป็นคนแรกที่แบ่งปันประสบการณ์การเดินทางในจังหวัดชายแดนใต้ของคุณให้โลกได้รู้
            </p>
            <Link
              href="/stories/share"
              className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              เขียนเรื่องราวของคุณ
            </Link>
          </div>
        ) : (
          <>
            {featuredStory && (
              <section className="mb-24">
                <Link href={`/stories/${featuredStory.id}`} className="group block">
                  <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                    <div className="lg:col-span-7 order-2 lg:order-1 mt-6 lg:mt-0">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-ink/50">
                          {featuredStory.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                        <span className="text-xs font-bold text-ink uppercase tracking-wide">
                          {featuredStory.authorName}
                        </span>
                        {authorType === 'mine' && featuredStory.status && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                            {featuredStory.status === 'published' ? (
                              <span className="bg-leaf/10 text-leaf border border-leaf/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">อนุมัติแล้ว</span>
                            ) : featuredStory.status === 'rejected' ? (
                              <span className="bg-coral/10 text-coral border border-coral/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">ไม่อนุมัติ</span>
                            ) : (
                              <span className="bg-gold/10 text-amber-600 border border-gold/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">รอตรวจสอบ</span>
                            )}
                          </>
                        )}
                      </div>
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-ink group-hover:text-ink/70 transition-colors duration-300 text-balance">
                        {featuredStory.title}
                      </h2>
                      <p className="mt-6 md:mt-8 text-lg md:text-xl text-ink/70 leading-relaxed font-medium text-pretty">
                        {featuredStory.excerpt}
                      </p>
                      <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink">
                        <span>อ่านเรื่องราว</span>
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
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-ink/50">
                              {story.category}
                            </span>
                            <span className="text-ink/20">•</span>
                            <span className="text-[10px] font-bold text-ink uppercase tracking-wide">
                              {story.authorName}
                            </span>
                            {authorType === 'mine' && story.status && (
                              <>
                                <span className="text-ink/20">•</span>
                                {story.status === 'published' ? (
                                  <span className="bg-leaf/10 text-leaf border border-leaf/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">อนุมัติแล้ว</span>
                                ) : story.status === 'rejected' ? (
                                  <span className="bg-coral/10 text-coral border border-coral/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">ไม่อนุมัติ</span>
                                ) : (
                                  <span className="bg-gold/10 text-amber-600 border border-gold/20 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase">รอตรวจสอบ</span>
                                )}
                              </>
                            )}
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
                
                {/* Load More Action */}
                {hasMore && (
                  <div className="mt-20 flex justify-center border-t border-ink/10 pt-16">
                    <Link 
                      href={`/stories?limit=${limit + 12}${authorType ? `&category=${authorType}` : ''}`}
                      className="group inline-flex items-center gap-2 rounded-full border border-ink/20 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-all hover:border-ink hover:bg-ink hover:text-white"
                      scroll={false}
                    >
                      <span>โหลดเรื่องราวเพิ่มเติม</span>
                      <ArrowRight size={16} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
                    </Link>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

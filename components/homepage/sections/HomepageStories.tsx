import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { PublicStoryCard } from "@/lib/repositories/public-content.repository";

function storyImageAlt(title: string) {
  return `ภาพประกอบเรื่อง ${title}`;
}

export function HomepageStories({
  stories,
  title = "เรื่องราวจากยะลา",
  subtitle = "มองพื้นที่ผ่านอาหาร ผู้คน วัฒนธรรม และบันทึกจากนักเดินทาง",
  buttonText = "อ่านเรื่องราวทั้งหมด",
}: {
  stories?: PublicStoryCard[];
  title?: string;
  subtitle?: string;
  buttonText?: string;
}) {
  const storyCards = (stories ?? []).slice(0, 4);
  const featuredStory = storyCards[0];
  const sideStories = storyCards.slice(1);

  return (
    <section id="stories" aria-labelledby="homepage-stories-heading" className="border-t border-ink/10 bg-[#FFFDF9] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
              <span className="text-amber-500">❖</span>
              <span>บทความและเรื่องราว</span>
              <span className="text-amber-500">❖</span>
            </div>
            <h2 id="homepage-stories-heading" className="mt-2.5 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">{title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm lg:text-base">{subtitle}</p>
          </div>
          <Link href="/stories" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-coral/30 bg-white px-6 text-xs font-black text-coral shadow-xs transition-colors hover:bg-coral hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:self-auto sm:text-sm">
            {buttonText} <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>

        {featuredStory ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            {/* Featured Lead Story */}
            <Link
              href={`/stories/${featuredStory.id}`}
              className="group grid overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-2xl sm:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <div className="relative aspect-[16/10] min-h-56 overflow-hidden bg-cream sm:aspect-auto">
                {featuredStory.imageUrl ? (
                  <Image
                    src={featuredStory.imageUrl}
                    alt={storyImageAlt(featuredStory.title)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 55vw, 600px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center text-xs font-bold text-muted">ยังไม่มีภาพจาก CMS</div>
                )}
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <span className="inline-flex items-center rounded-full bg-coral/10 px-3 py-0.5 text-[11px] font-black uppercase text-coral">
                    เรื่องเด่น · {featuredStory.category}
                  </span>
                  <h3 className="mt-3 text-lg font-black leading-snug text-ink transition-colors group-hover:text-coral sm:text-xl">
                    {featuredStory.title}
                  </h3>
                  {featuredStory.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted sm:text-sm">{featuredStory.excerpt}</p>
                  ) : null}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-orange-100/80 pt-4 text-xs font-bold text-muted">
                  <span>{featuredStory.province || "ยะลา"}</span>
                  {featuredStory.date ? <time>{featuredStory.date}</time> : null}
                </div>
              </div>
            </Link>

            {/* Side Story List */}
            <div className="divide-y divide-orange-100/80 rounded-3xl border border-orange-100 bg-white p-5 shadow-xl shadow-orange-500/5">
              {sideStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group grid min-h-24 grid-cols-[88px_minmax(0,1fr)] gap-3.5 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-cream">
                    {story.imageUrl ? (
                      <Image
                        src={story.imageUrl}
                        alt={storyImageAlt(story.title)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="100px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[11px] font-bold text-muted">ไม่มีภาพ</div>
                    )}
                  </div>
                  <div className="min-w-0 py-0.5">
                    <span className="text-[11px] font-black uppercase text-coral">{story.category}</span>
                    <h3 className="mt-1 line-clamp-2 text-xs font-black leading-snug text-ink transition-colors group-hover:text-coral sm:text-sm">
                      {story.title}
                    </h3>
                    <p className="mt-1.5 text-[11px] font-bold text-muted">{story.province || "ยะลา"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white p-8 text-center">
            <p className="text-sm font-bold text-muted">เรื่องที่เผยแพร่จาก CMS จะปรากฏที่นี่</p>
            <Link href="/stories" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-black text-coral hover:underline">
              เปิดหน้ารวมเรื่องราว <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

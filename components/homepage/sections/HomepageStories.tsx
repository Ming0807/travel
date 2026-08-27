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
    <section id="stories" aria-labelledby="homepage-stories-heading" className="border-t border-ink/10 bg-cream px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
              <span className="h-px w-6 bg-coral/40"></span>
              <span>บทความและเรื่องราว</span>
            </div>
            <h2 id="homepage-stories-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{subtitle}</p>
          </div>
          <Link href="/stories" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-teal transition-colors hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
            {buttonText} <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>

        {featuredStory ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <Link href={`/stories/${featuredStory.id}`} className="group grid overflow-hidden rounded-[8px] border border-ink/10 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card sm:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
              <div className="relative aspect-[16/10] min-h-56 bg-cream sm:aspect-auto overflow-hidden">
                {featuredStory.imageUrl ? (
                  <Image src={featuredStory.imageUrl} alt={storyImageAlt(featuredStory.title)} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 55vw, 600px" />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center text-sm font-bold text-muted">ยังไม่มีภาพจาก CMS</div>
                )}
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-coral">เรื่องเด่น · {featuredStory.category}</p>
                  <h3 className="mt-2.5 text-xl font-black leading-snug text-ink transition-colors group-hover:text-coral sm:text-2xl">{featuredStory.title}</h3>
                  {featuredStory.excerpt ? <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-muted">{featuredStory.excerpt}</p> : null}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs font-bold text-muted">
                  <span>{featuredStory.province || "ยะลา"}</span>
                  {featuredStory.date ? <time>{featuredStory.date}</time> : null}
                </div>
              </div>
            </Link>

            <div className="divide-y divide-ink/10 rounded-[8px] border border-ink/10 bg-white p-4 shadow-xs">
              {sideStories.map((story) => (
                <Link key={story.id} href={`/stories/${story.id}`} className="group grid min-h-28 grid-cols-[96px_minmax(0,1fr)] gap-4 py-3.5 first:pt-1 last:pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
                  <div className="relative overflow-hidden rounded-[6px] bg-cream">
                    {story.imageUrl ? (
                      <Image src={story.imageUrl} alt={storyImageAlt(story.title)} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="96px" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[11px] font-bold text-muted">ไม่มีภาพ</div>
                    )}
                  </div>
                  <div className="min-w-0 py-0.5">
                    <p className="text-[11px] font-black uppercase text-coral">{story.category}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-ink transition-colors group-hover:text-coral sm:text-base">{story.title}</h3>
                    <p className="mt-2 text-xs font-bold text-muted">{story.province || "ยะลา"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[8px] border border-dashed border-ink/20 bg-white p-8 text-center">
            <p className="text-sm font-bold text-muted">เรื่องที่เผยแพร่จาก CMS จะปรากฏที่นี่</p>
            <Link href="/stories" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-black text-teal hover:text-coral">เปิดหน้ารวมเรื่องราว <ArrowRight aria-hidden="true" /></Link>
          </div>
        )}
      </div>
    </section>
  );
}

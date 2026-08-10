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
    <section id="stories" aria-labelledby="homepage-stories-heading" className="bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-coral">Story &amp; Blog</p>
            <h2 id="homepage-stories-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
          </div>
          <Link href="/stories" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-teal transition-colors hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
            {buttonText} <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>

        {featuredStory ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <Link href={`/stories/${featuredStory.id}`} className="group grid overflow-hidden rounded-[8px] border border-ink/10 bg-cream sm:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
              <div className="relative aspect-[16/10] min-h-56 bg-white sm:aspect-auto">
                {featuredStory.imageUrl ? (
                  <Image src={featuredStory.imageUrl} alt={storyImageAlt(featuredStory.title)} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 55vw, 600px" />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center text-sm font-bold text-muted">ยังไม่มีภาพจาก CMS</div>
                )}
              </div>
              <div className="flex flex-col justify-between p-5 sm:p-6">
                <div>
                  <p className="text-xs font-black text-coral">เรื่องเด่น · {featuredStory.category}</p>
                  <h3 className="mt-3 text-xl font-black leading-snug text-ink transition-colors group-hover:text-coral sm:text-2xl">{featuredStory.title}</h3>
                  {featuredStory.excerpt ? <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted">{featuredStory.excerpt}</p> : null}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 text-xs font-bold text-muted">
                  <span>{featuredStory.province || "ยะลา"}</span>
                  {featuredStory.date ? <time>{featuredStory.date}</time> : null}
                </div>
              </div>
            </Link>

            <div className="divide-y divide-ink/10 border-y border-ink/10 lg:border-y-0">
              {sideStories.map((story) => (
                <Link key={story.id} href={`/stories/${story.id}`} className="group grid min-h-32 grid-cols-[104px_minmax(0,1fr)] gap-4 py-4 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral lg:first:pt-0">
                  <div className="relative overflow-hidden rounded-[6px] bg-cream">
                    {story.imageUrl ? (
                      <Image src={story.imageUrl} alt={storyImageAlt(story.title)} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="104px" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[11px] font-bold text-muted">ไม่มีภาพ</div>
                    )}
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="text-[11px] font-black text-coral">{story.category}</p>
                    <h3 className="mt-2 line-clamp-3 text-sm font-black leading-5 text-ink transition-colors group-hover:text-coral sm:text-base">{story.title}</h3>
                    <p className="mt-3 text-xs font-bold text-muted">{story.province || "ยะลา"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 border border-dashed border-ink/20 bg-cream p-8 text-center">
            <p className="text-sm font-bold text-muted">เรื่องที่เผยแพร่จาก CMS จะปรากฏที่นี่</p>
            <Link href="/stories" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-black text-teal hover:text-coral">เปิดหน้ารวมเรื่องราว <ArrowRight aria-hidden="true" /></Link>
          </div>
        )}
      </div>
    </section>
  );
}

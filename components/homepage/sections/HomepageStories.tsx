import Image from "next/image";
import Link from "next/link";
import type { PublicStoryCard } from "@/lib/repositories/public-content.repository";

function storyImageAlt(title: string) {
  return `${title} story image`;
}

export function HomepageStories({ stories }: { stories?: PublicStoryCard[] }) {
  const storyCards = stories ?? [];
  const featuredStory = storyCards[0];
  const sideStories = storyCards.slice(1, 4);

  return (
    <section id="stories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-white rounded-3xl my-8 border border-ink/5">
      <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-black text-ink tracking-tight">ประสบการณ์จากนักเดินทาง</h2>
          <p className="mt-4 text-muted text-sm md:text-base font-medium max-w-lg">อ่านเรื่องราวแห่งแรงบันดาลใจจากผู้ที่ได้สัมผัสมนต์เสน่ห์ของปลายด้ามขวาน</p>
        </div>
        <Link
          href="/stories"
          className="inline-flex rounded-full border border-ink/10 px-6 py-3 text-sm font-bold text-ink hover:bg-cream hover:text-coral transition-colors"
        >
          อ่านบทความทั้งหมด &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {featuredStory ? (
          <Link href={`/stories/${featuredStory.id}`} className="group block">
            <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card bg-cream">
              {featuredStory.imageUrl ? (
                <Image
                  src={featuredStory.imageUrl}
                  alt={storyImageAlt(featuredStory.title)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-muted">
                  ยังไม่มีรูปภาพ
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-coral shadow-sm">
                เรื่องเด่น (Featured)
              </div>
            </div>
            <p className="mb-3 text-xs font-bold text-coral uppercase tracking-widest">{featuredStory.category} · {featuredStory.province}</p>
            <h3 className="text-3xl font-black leading-tight text-ink transition-colors group-hover:text-coral">
              {featuredStory.title}
            </h3>
            <p className="body-text mt-4 text-base text-muted font-medium leading-relaxed">
              {featuredStory.excerpt ||
                `ร่วมสำรวจวัฒนธรรม อาหาร และเรื่องราวท้องถิ่นที่ซ่อนเร้น รอให้คุณได้สัมผัสใน${featuredStory.province}`}
            </p>
            <p className="mt-5 text-sm font-bold text-ink/40">{featuredStory.date || "เผยแพร่ล่าสุด"} · ใช้เวลาอ่าน 4 นาที</p>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/10 bg-cream p-8 text-center text-sm font-semibold text-muted">
            เรื่องราวที่เผยแพร่แล้วจะปรากฏที่นี่หลังจากเพิ่มเนื้อหาในฐานข้อมูล
          </div>
        )}

        <div className="flex flex-col gap-8">
          {sideStories.map((story, index) => (
            <Link href={`/stories/${story.id}`} key={story.id} className="group flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-ink/5 pb-8 last:border-0 last:pb-0">
              <div className="relative h-48 sm:h-36 w-full sm:w-36 shrink-0 overflow-hidden rounded-3xl shadow-sm bg-cream">
                {story.imageUrl ? (
                  <Image
                    src={story.imageUrl}
                    alt={storyImageAlt(story.title)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-semibold text-muted">
                    ยังไม่มีรูปภาพ
                  </div>
                )}
              </div>
              <div className="flex-1 mt-2 sm:mt-0">
                <p className="mb-2 text-[10px] font-black text-coral uppercase tracking-widest">{story.category}</p>
                <h3 className="text-xl font-bold leading-snug text-ink transition-colors group-hover:text-coral line-clamp-2">
                  {story.title}
                </h3>
                <p className="mt-4 text-xs font-bold text-ink/40">
                  {story.date || `เรื่องราวแนะนำ ${index + 1}`} · ใช้เวลาอ่าน {3 + index} นาที
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

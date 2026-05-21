import Image from "next/image";
import Link from "next/link";
import { travelStories } from "../homepage-data";
import type { PublicStoryCard } from "@/lib/repositories/public-content.repository";

function fallbackStories(): PublicStoryCard[] {
  return travelStories.map((story) => ({
    id: story.slug,
    title: story.title,
    excerpt: "",
    province: story.province,
    date: "",
    imageUrl: story.imageUrl,
    category: story.category
  }));
}

function storyImageAlt(title: string) {
  return `${title} story image`;
}

export function HomepageStories({ stories }: { stories?: PublicStoryCard[] }) {
  const storyCards = stories && stories.length > 0 ? stories : fallbackStories();
  const featuredStory = storyCards[0];
  const sideStories = storyCards.slice(1, 4);

  return (
    <section id="stories" className="mx-auto mt-8 max-w-7xl border-t border-ink/5 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-bold text-ink">เรื่องราวและแรงบันดาลใจ</h2>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink/10 px-6 py-3 text-sm font-bold text-ink transition-all hover:border-ink hover:bg-ink hover:text-white"
        >
          อ่านบทความทั้งหมด
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {featuredStory && (
          <Link href={`/stories/${featuredStory.id}`} className="group block">
            <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-sm">
              <Image
                src={featuredStory.imageUrl}
                alt={storyImageAlt(featuredStory.title)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            </div>
            <p className="mb-2 text-sm font-semibold text-teal">{featuredStory.category}</p>
            <h3 className="text-2xl font-bold leading-tight text-ink transition-colors group-hover:text-coral">
              {featuredStory.title}
            </h3>
            <p className="body-text mt-3 text-sm text-muted">
              {featuredStory.excerpt ||
                `สำรวจวัฒนธรรม อาหาร และเรื่องราวท้องถิ่นที่รอให้คุณค้นพบใน${featuredStory.province}`}
            </p>
            <p className="mt-4 text-xs text-muted">{featuredStory.date || "เผยแพร่ล่าสุด"} · อ่าน 4 นาที</p>
          </Link>
        )}

        <div className="flex flex-col gap-6">
          {sideStories.map((story, index) => (
            <Link href={`/stories/${story.id}`} key={story.id} className="group flex items-center gap-5">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src={story.imageUrl}
                  alt={storyImageAlt(story.title)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-teal">{story.category}</p>
                <h3 className="text-base font-bold leading-tight text-ink transition-colors group-hover:text-coral">
                  {story.title}
                </h3>
                <p className="mt-2 text-xs text-muted">
                  {story.date || `เรื่องแนะนำ ${index + 1}`} · อ่าน {3 + index} นาที
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

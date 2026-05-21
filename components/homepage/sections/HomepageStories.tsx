import Image from "next/image";
import Link from "next/link";
import { NewspaperClipping, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { travelStories } from "../homepage-data";

export function HomepageStories() {
  return (
    <section id="stories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <span className="section-label">
            <NewspaperClipping size={16} /> Travel Stories
          </span>
          <h2 className="mt-4 text-3xl font-extrabold lg:text-4xl">เรื่องเล่า เส้นทาง และแรงบันดาลใจ</h2>
          <p className="body-text mt-3 max-w-2xl text-muted">
            พื้นที่สำหรับบทความท่องเที่ยว เส้นทางแนะนำ อาหาร วัฒนธรรม และ 360° experience ที่เชื่อมกับสถานที่จริง
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {travelStories.map((story) => (
          <article key={story.slug} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
            <Image
              src={story.imageUrl}
              alt={story.imageAlt}
              width={800}
              height={200}
              className="h-52 w-full object-cover"
              unoptimized
            />
            <div className="p-5">
              <p className="text-xs font-extrabold text-coral">{story.category}</p>
              <h3 className="mt-2 text-lg font-extrabold">{story.title}</h3>
              <p className="body-text mt-2 text-sm text-muted">
                รวมสถานที่และกิจกรรมที่น่าสนใจ ให้คุณวางแผนการเดินทางได้ง่ายขึ้น
              </p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline"
              >
                อ่านต่อ <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

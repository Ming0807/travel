import Link from "next/link";
import { PenNib } from "@phosphor-icons/react/dist/ssr";

import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export interface StoryHeroProps {
  title?: string;
  description?: string;
  image?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
}

export function StoryHero({
  title = "เรื่องราวจากยะลา",
  description = "อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม และประสบการณ์จากนักเดินทางในยะลา",
  image,
  imageUrl,
  imageAlt = "เรื่องราวและบรรยากาศการท่องเที่ยวในจังหวัดยะลา",
}: StoryHeroProps) {
  return <PublicDirectoryHero
    id="stories-hero-heading"
    breadcrumb="เรื่องราว"
    eyebrow="PEOPLE & STORIES"
    title={title}
    description={description}
    imageUrl={siteMediaImageUrl(image) ?? imageUrl}
    imageAlt={imageAlt}
    actions={<>
      <Link href="/stories/share"><PenNib size={17} weight="bold" aria-hidden="true" /> แบ่งปันเรื่องราวของคุณ</Link>
      <Link href="/profile">เรื่องราวของฉัน</Link>
    </>}
  />;
}

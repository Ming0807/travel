import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";

export interface AttractionHeroProps {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  scope?: string;
}

export function AttractionHero({
  title = "สถานที่ท่องเที่ยวในจังหวัดยะลา",
  description = "ค้นพบสถานที่ท่องเที่ยวที่น่าประทับใจในจังหวัดยะลา วัฒนธรรม ธรรมชาติ และวิถีชีวิตที่มีเอกลักษณ์",
  imageUrl,
  scope,
}: AttractionHeroProps) {
  return <PublicDirectoryHero
    id="attractions-hero-heading"
    breadcrumb="สถานที่ท่องเที่ยว"
    eyebrow="EXPLORE YALA"
    title={title}
    description={description}
    imageUrl={imageUrl}
    imageAlt="บรรยากาศสถานที่ท่องเที่ยวในจังหวัดยะลา"
    scope={scope}
  />;
}

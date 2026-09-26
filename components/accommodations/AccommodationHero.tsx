import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export interface AccommodationHeroProps {
  title?: string;
  description?: string;
  scope?: string;
  image?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  imageContext?: string;
}

export function AccommodationHero({
  title = "ที่พักในจังหวัดยะลา",
  description = "ค้นหาที่พักจากประเภท จังหวัด และช่วงราคาที่ผู้ดูแลเผยแพร่",
  scope = "ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา",
  image,
  imageUrl,
  imageAlt = "บรรยากาศที่พักในจังหวัดยะลา",
}: AccommodationHeroProps) {
  return <PublicDirectoryHero
    id="accommodations-hero-heading"
    breadcrumb="ที่พัก"
    eyebrow="STAY IN YALA"
    title={title}
    description={description}
    imageUrl={siteMediaImageUrl(image) ?? imageUrl}
    imageAlt={imageAlt}
    scope={scope}
  />;
}

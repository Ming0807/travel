import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";

export interface RestaurantHeroProps {
  title?: string;
  description?: string;
  imageUrl?: string | null;
}

export function RestaurantHero({
  title = "ร้านอาหารในจังหวัดยะลา",
  description = "ค้นหาร้านอร่อยท้องถิ่นและเมนูขึ้นชื่อ เลือกมื้อที่ใช่สำหรับการเดินทางของคุณ",
  imageUrl,
}: RestaurantHeroProps) {
  return <PublicDirectoryHero
    id="restaurants-hero-heading"
    breadcrumb="ร้านอาหาร"
    eyebrow="TASTE OF YALA"
    title={title}
    description={description}
    imageUrl={imageUrl}
    imageAlt="บรรยากาศอาหารท้องถิ่นในจังหวัดยะลา"
  />;
}

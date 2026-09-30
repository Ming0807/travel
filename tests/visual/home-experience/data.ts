import type { HomepageEditorialProps } from "@/components/homepage/HomepageEditorial";
import type { PublicRouteStop } from "@/lib/routes/public-route";

const mountain = "/site-media/homepage/yala-hero-default.webp";
const valley = "/site-media/homepage/yala-belonging-default.webp";
export const data: HomepageEditorialProps = {
  hero: { title: "คณะทำงานขับเคลื่อนการท่องเที่ยวโดยชุมชน ตำบลหน้าถ้ำ", images: [mountain, valley, mountain] },
  media: {},
  attractions: ["ถ้ำและเรื่องเล่าจากชุมชน", "ภูเขาและสายหมอก", "วัดและวิถีวัฒนธรรม", "ธรรมชาติริมสายน้ำ", "ชุมชนกับผู้คน"].map((name, index) => ({ slug: `fixture-place-${index + 1}`, name, province: "ยะลา", category: index % 2 ? "วัฒนธรรม" : "ธรรมชาติ", typeNameEn: index % 2 ? "Culture & Heritage" : "Nature & Ecotourism", description: "ข้อมูลสังเคราะห์สำหรับตรวจหน้าจอ", imageUrl: index % 2 ? valley : mountain, imageAlt: name, tags: [] })),
  discoveryAttractions: [],
  restaurants: ["อาหารจากครัวชุมชน", "รสชาติจากเบตง", "มื้อเช้าในยะลา", "คาเฟ่ริมทาง"].map((name, index) => ({ slug: `fixture-food-${index + 1}`, name, province: "ยะลา", foodType: "Local food", description: "ข้อมูลสังเคราะห์", imageUrl: valley, imageAlt: name })),
  accommodations: [{ slug: "fixture-homestay", name: "โฮมสเตย์ชุมชน", province: "ยะลา", accommodationType: "Homestay", description: "ข้อมูลสังเคราะห์", imageUrl: mountain, imageAlt: "โฮมสเตย์ชุมชน" }],
  cafeRestaurant: null, cafeCategorySlug: null,
  routes: ["เรื่องเล่าถ้ำและชุมชน", "เที่ยวเมืองเก่าและธรรมชาติ", "อาหาร วัฒนธรรม และสายหมอก"].map((name, index) => ({ slug: `fixture-route-${index + 1}`, name, description: "เส้นทางสังเคราะห์สำหรับทดสอบเท่านั้น", days: index + 1, stopCount: 3, imageUrl: index % 2 ? mountain : valley, imageAlt: name })),
  stories: ["ความทรงจำจากทริปยะลา", "มื้ออาหารกับคนในชุมชน", "เรื่องเล่าระหว่างทาง", "เช้าวันใหม่กับสายหมอก"].map((title, index) => ({ storyId: index + 1, id: `fixture-story-${index + 1}`, title, excerpt: "ข้อมูลสังเคราะห์", province: "ยะลา", date: "30 กันยายน 2569", publishedAt: "2026-09-30T00:00:00Z", updatedAt: null, imageUrl: valley, imageAlt: title, category: "การเดินทาง", authorType: "admin", authorName: "ทีมตัวอย่าง", readingMinutes: 3, primaryLanguage: "th", primaryTopic: null })),
  stats: [{ label: "สถานที่ที่เผยแพร่", value: "12" }, { label: "ตราประทับที่บันทึก", value: "25" }],
  routesUnavailable: false,
};
data.discoveryAttractions = data.attractions;

/** Synthetic stop coordinates and labels; never evidence of a real itinerary. */
export function routeMapData(slug: string) {
  const number = Number(slug.replace("fixture-route-", ""));
  const stops: PublicRouteStop[] = ["ถ้ำตัวอย่าง", "ชุมชนตัวอย่าง", "จุดชมวิวตัวอย่าง"].map((name, index) => ({
    attractionId: number * 10 + index + 1, dayNumber: 1, sequence: index + 1,
    attractionName: `${name} ${number}`, attractionSlug: `fixture-place-${index + 1}`,
    attractionImage: index % 2 ? valley : mountain, attractionImageAlt: name,
    latitude: 6.5 + number * .05 + index * .008, longitude: 101.2 + index * .01,
    stopNote: "พิกัดสังเคราะห์สำหรับตรวจการทำงานของแผนที่",
  }));
  return { stops, directionsUrl: null };
}

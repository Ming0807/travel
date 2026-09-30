import { createRoot } from "react-dom/client";
import { AttractionDirectoryClient } from "@/components/attractions/AttractionDirectoryClient";
import { AttractionDiscoveryFilters } from "@/components/attractions/AttractionDiscoveryFilters";
import { AttractionHero } from "@/components/attractions/AttractionHero";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";
import { AttractionDetailLoading, AttractionDirectoryLoading } from "@/components/attractions/AttractionLoading";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import "@/app/globals.css";

const image = "/site-media/homepage/yala-belonging-default.webp";
const name = "สถานที่ทดสอบชื่อยาวสำหรับตรวจการจัดวางบนมือถือ";
const params = new URLSearchParams(location.search);
const items = Array.from({ length: 6 }, (_, index) => ({
  slug: `fixture-${index}`, name: index === 0 ? name : `สถานที่ตัวอย่าง ${index + 1}`, province: "ยะลา", district: "เมืองยะลา", category: "ธรรมชาติ",
  description: "ข้อมูลจำลองเพื่อตรวจการจัดวาง รูปภาพและปุ่มเท่านั้น", imageUrl: index === 2 ? null : image,
  imageAlt: `ภาพทดสอบ ${index + 1}`, tags: [], latitude: null, longitude: null, rating: null, reviewCount: null, reviewState: "empty" as const,
}));
createRoot(document.getElementById("root")!).render(
  params.has("loading") ? (params.has("detail") ? <AttractionDetailLoading /> : <AttractionDirectoryLoading />) : params.has("detail") ? (
    <PublicPageFrame variant="detail" className="py-6">
      <AttractionHeader name={name} province="ยะลา" attractionType="ธรรมชาติ" reviewState="empty" rating={null} reviewCount={null} />
      <AttractionGallery mainImage={{ url: image, alt: "ภาพทดสอบหลัก" }} attractionName={name} gallery={params.has("single") ? [] : Array.from({ length: 8 }, (_, index) => ({ url: `${image}?view=${index}`, alt: `ภาพทดสอบ ${index + 1}` }))} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]"><div><h2 className="text-2xl font-bold">ข้อมูลสถานที่</h2><p className="mt-4 leading-8">ข้อมูลจำลองสำหรับตรวจการจัดวางเท่านั้น</p></div><AttractionInfoSidebar province="ยะลา" attractionType="ธรรมชาติ" address="ตำบลตัวอย่าง อำเภอเมืองยะลา" openingHours="08:00–17:00" contactInfo={null} /></div>
    </PublicPageFrame>
  ) : <main className="bg-[#FAF7F2]">
    <AttractionHero imageUrl={image} />
    <AttractionDiscoveryFilters query={params.get("q") ?? undefined} typeOptions={[{ value: "Nature", label: "ธรรมชาติ" }, { value: "Culture", label: "วัฒนธรรม" }]} districtOptions={[{ value: "7", label: "เมืองยะลา" }]} />
    <PublicPageFrame variant="directory"><h2 id="attraction-results-heading" className="mb-6 text-2xl font-bold">สถานที่ทดสอบ</h2><AttractionDirectoryClient items={items} /></PublicPageFrame>
  </main>,
);

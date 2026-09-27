import { createRoot } from "react-dom/client";
import { RouteDiscovery } from "@/components/routes/RouteDiscovery";
import { PublicRouteTimeline } from "@/components/routes/PublicRouteTimeline";
import { RouteStopsMap } from "@/components/routes/RouteStopsMap";
import type { PublicRouteStop } from "@/lib/routes/public-route";
import { AdminFixture } from "./admin";
import "@/app/globals.css";

const image = "/site-media/homepage/yala-belonging-default.webp";
const stops: PublicRouteStop[] = [
  { attractionId: 1, dayNumber: 1, sequence: 1, attractionName: "สถานที่ทดสอบแรก", attractionSlug: "fixture-first", attractionImage: image, attractionImageAlt: "ภาพสำหรับทดสอบ layout", latitude: 6.541, longitude: 101.281, stopNote: "คำแนะนำจุดแวะจาก fixture ไม่ใช่ข้อมูลสถานที่จริง" },
  { attractionId: 2, dayNumber: 1, sequence: 2, attractionName: "สถานที่ทดสอบที่ไม่มีพิกัด", attractionSlug: "fixture-second", attractionImage: null, attractionImageAlt: "", latitude: null, longitude: null },
  { attractionId: 3, dayNumber: 2, sequence: 1, attractionName: "สถานที่ทดสอบชื่อยาวสำหรับตรวจข้อความภาษาไทยบนอุปกรณ์มือถือ", attractionSlug: "fixture-third", attractionImage: image, attractionImageAlt: "ภาพสำหรับทดสอบ layout", latitude: 6.542, longitude: 101.282 },
];

createRoot(document.getElementById("root")!).render(
  new URLSearchParams(window.location.search).has("admin") ? <AdminFixture /> : <main className="min-h-screen bg-[#fffdfa] px-4 py-6 text-[#263036] sm:px-8">
    <div className="mx-auto max-w-6xl">
      <p className="border-l-2 border-amber-500 pl-3 text-sm">UI fixture only. No database access or production evidence.</p>
      <h1 className="mt-6 text-2xl font-bold">Curated routes QA</h1>
      <section className="mt-7" aria-label="รายการเส้นทางทดสอบ">
        <RouteDiscovery routes={[
          { slug: "fixture-route", name: "เส้นทางทดสอบหลายวัน", description: "ข้อมูล fixture สำหรับตรวจการจัดวางเท่านั้น", days: 2, stopCount: 3, imageUrl: image, imageAlt: "ภาพสำหรับทดสอบ layout" },
          { slug: "fixture-empty-cover", name: "เส้นทางที่ไม่มีภาพปก", description: "ตรวจ fallback โดยไม่สร้างข้อมูลปลอม", days: 1, stopCount: 2, imageUrl: null, imageAlt: "" },
        ]} />
      </section>
      <section className="mt-10 max-w-3xl" aria-label="ลำดับจุดแวะทดสอบ">
        <h2 className="mb-5 text-2xl font-bold">ลำดับการเดินทาง</h2>
        <PublicRouteTimeline stops={stops} />
        <RouteStopsMap stops={stops} />
      </section>
    </div>
  </main>,
);

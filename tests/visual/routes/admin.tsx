import { RouteVisualEditor } from "@/components/admin/routes/visual-editor/RouteVisualEditor";
import type { RouteAttractionOption } from "@/components/admin/routes/RouteStopsManager";
import type { AdminRouteRow, AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";

const image = "/site-media/homepage/yala-belonging-default.webp";
const route: AdminRouteRow = {
  route_id: 1, slug: "fixture-route", name_th: "เส้นทางทดสอบการจัดวางสำหรับหน้าจอขนาดเล็ก",
  name_en: null, description_th: "ข้อมูล fixture เท่านั้น ไม่ใช่เส้นทางท่องเที่ยวที่เผยแพร่จริง",
  description_en: null, is_published: false, is_active: true,
  created_at: "2026-09-27T00:00:00Z", updated_at: null, stop_count: 2,
};
const attractions: RouteAttractionOption[] = [1, 2, 3].map((id) => ({
  attraction_id: id, name_th: `สถานที่ทดสอบ ${id} สำหรับตรวจชื่อยาวบนมือถือ`,
  name_en: `Fixture ${id}`, province_name_th: "พื้นที่ทดสอบ", is_active: true,
  is_published: true, coverImageUrl: image,
}));
const stops: AdminRouteStopRow[] = attractions.slice(0, 2).map((attraction, index) => ({
  stop_id: index + 1, route_id: 1, attraction_id: attraction.attraction_id,
  day_number: 1, display_order: index + 1, stop_note_th: "คำแนะนำสำหรับทดสอบ UI เท่านั้น",
  stop_note_en: null, attraction_name_th: attraction.name_th,
}));

export function AdminFixture() {
  return (
    <div className="admin-app">
      <p className="bg-amber-50 px-4 py-3 text-sm text-amber-950">Admin UI fixture only. Actions are stubbed; no database writes.</p>
      <RouteVisualEditor route={route} coverMediaUrl={image} stops={stops} attractions={attractions} />
    </div>
  );
}

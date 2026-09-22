import { createRoot } from "react-dom/client";
import { AttractionAnalyticsFilters } from "@/components/dashboard/AttractionAnalyticsFilters";
import { attractionAnalyticsFiltersSchema } from "@/lib/validation/attraction-analytics";
import "@/app/globals.css";

const query = new URLSearchParams(location.search);
const defaults = { dateFrom: "2026-08-01", dateTo: "2026-08-31" };
const filters = attractionAnalyticsFiltersSchema.parse({
  attractionId: query.get("attractionId") || "4",
  dateFrom: query.get("dateFrom") || defaults.dateFrom,
  dateTo: query.get("dateTo") || defaults.dateTo,
  evidenceScope: query.get("evidenceScope") || "field_claim",
  entryChannel: query.get("entryChannel") || undefined,
  campaignId: query.get("campaignId") || undefined,
  checkinCodeId: query.get("checkinCodeId") || undefined,
});
const checkinCodes = filters.attractionId === 4
  ? [{ checkinCodeId: 10, code: "FIXTURE-A", label: "ทางเข้าหลัก", campaignId: 7 }]
  : [{ checkinCodeId: 20, code: "FIXTURE-B", label: "ทางเข้าถ้ำ", campaignId: 8 }];

createRoot(document.getElementById("root")!).render(
  <main className="admin-app min-h-screen bg-slate-50 p-4 sm:p-8">
    <h1 className="mb-4 text-xl font-bold">ตัวกรองรายสถานที่: ข้อมูลจำลองสำหรับทดสอบ</h1>
    <section className="mx-auto max-w-7xl border border-slate-200 bg-white">
      <AttractionAnalyticsFilters
        attractions={[{ value: 4, label: "วัดคูหาภิมุข (วัดหน้าถ้ำ)" }, { value: 5, label: "ถ้ำศิลป์" }]}
        checkinCodes={checkinCodes} defaults={defaults} filters={filters}
      />
    </section>
  </main>,
);

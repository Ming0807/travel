import { createRoot } from "react-dom/client";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { AttractionAnalyticsWorkspace } from "@/components/dashboard/AttractionAnalyticsWorkspace";
import { AttractionAnalyticsFilters } from "@/components/dashboard/AttractionAnalyticsFilters";
import { executiveFixture } from "./executive-fixture";
import { attractionFixture } from "./attraction-fixture";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardSavedViews } from "@/components/dashboard/DashboardSavedViews";
import { DashboardContentState } from "@/components/dashboard/DashboardContentState";
import { ExportPrivacyDialog } from "@/components/dashboard/ExportPrivacyDialog";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { AttractionScoreChart } from "@/components/dashboard/AttractionScoreChart";
import { AttractionDistributionChart } from "@/components/dashboard/AttractionDistributionChart";
import type { DashboardFilters as Filters, DashboardReferenceOptions } from "@/types/dashboard";
import "@/app/globals.css";

const filters: Filters = { dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only", districtId: 1, satisfactionMin: 3.2 };
const options: DashboardReferenceOptions = {
  provinces: [{ value: "1", label: "ยะลา" }], districts: [{ value: "1", label: "อำเภอเมืองยะลา" }],
  attractions: [{ value: "4", label: "วัดคูหาภิมุข (วัดหน้าถ้ำ)" }], attractionTypes: [],
  originCountries: [], originProvinces: [], ageGroups: [], transportModes: [], travelPurposes: [],
};
const rows = [
  { label: "เดินทางเพื่อพักผ่อนและเรียนรู้วัฒนธรรมท้องถิ่น", value: 1280, percent: 0.64 },
  { label: "เยี่ยมเพื่อนและครอบครัว", value: 520, percent: 0.26 },
  { label: "เข้าร่วมกิจกรรมในชุมชน", value: 200, percent: 0.1 },
];
const state = new URLSearchParams(window.location.search).get("state");
const surface = new URLSearchParams(window.location.search).get("page");
const executiveData = executiveFixture(state);
const displayedFilters = surface === "executive" ? executiveData.filters : filters;
const focusedSurface = surface === "executive" || surface === "attraction" || surface === "attraction-filter";
const data = state === "empty" ? [] : state === "low" ? rows.slice(0, 2).map((row) => ({ ...row, value: 1, percent: 0.5 })) : rows;

createRoot(document.getElementById("root")!).render(
  <main className="admin-app min-h-screen bg-[#F6F6F5] p-3 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3" data-print-hide>
        <div><h1 className="text-xl font-bold">Dashboard component QA</h1><p className="text-sm text-slate-600">ข้อมูลจำลองเฉพาะการทดสอบ UI ไม่ใช่หลักฐานวิจัยหรือหน้าระบบจริง</p></div>
        <ExportPrivacyDialog endpoint="/fixture-export-disabled" exportType="summary" label="รายงานสรุป" searchParams="evidence_scope=pilot_only" />
      </header>
      {!focusedSurface ? <><DashboardFilters filters={displayedFilters} options={options} /><DashboardSavedViews filters={displayedFilters} /></> : null}
      {surface === "executive" ? <div className="space-y-4" data-print-report="executive"><div data-print-hide><DashboardFilters filters={displayedFilters} options={options} /><DashboardSavedViews filters={displayedFilters} /></div><DashboardContentState data={executiveData} page="overview" /><ExecutiveOverview data={executiveData} /></div> : surface === "attraction" ? <AttractionAnalyticsWorkspace data={attractionFixture(state)} /> : surface === "attraction-filter" ? (
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-black">ขอบเขตหลักฐานรายสถานที่</h2><p className="mt-1 text-sm text-slate-600">ข้อมูลจำลองสำหรับตรวจ responsive ของแบบฟอร์มเท่านั้น</p></div>
          <AttractionAnalyticsFilters
            attractions={[{ value: 4, label: "วัดคูหาภิมุข (วัดหน้าถ้ำ)" }, { value: 9, label: "สกายวอล์คอัยเยอร์เวง" }]}
            checkinCodes={[{ checkinCodeId: 10, code: "YALA-A", label: "ทางเข้าหลัก", campaignId: 7 }, { checkinCodeId: 11, code: "YALA-B", label: "จุดถ่ายภาพ", campaignId: 7 }, { checkinCodeId: 12, code: "YALA-C", label: "ทางเข้าสำรอง", campaignId: 9 }]}
            defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
            filters={state === "active" ? { attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "field_claim", entryChannel: "nfc", campaignId: 7, checkinCodeId: 10 } : null}
          />
        </section>
      ) : <>
      <TrendChart points={state === "empty" ? [] : [{ label: "2026-08-01", value: 14 }, { label: "2026-08-02", value: 23 }, { label: "2026-08-03", value: 18 }]} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <BarChartCard title="วัตถุประสงค์การเดินทาง" definition="จำนวนคำตอบแยกตามวัตถุประสงค์" data={data} emptyDescription="ไม่มีคำตอบในขอบเขตนี้" sampleCount={state === "low" ? 2 : 2000} />
        <DonutChartCard title="สัดส่วนวัตถุประสงค์" definition="สัดส่วนจากคำตอบที่ระบุวัตถุประสงค์" data={data} emptyDescription="ไม่มีคำตอบในขอบเขตนี้" />
        <AttractionScoreChart metrics={state === "empty" ? [] : [{ key: "overall_score", label: "ประสบการณ์โดยรวม", value: state === "low" ? null : 4.25, sampleSize: state === "low" ? 2 : 40, suppressed: state === "low" }]} />
        <AttractionDistributionChart title="วัตถุประสงค์รายสถานที่" description="คำตอบในสถานที่ที่เลือก" rows={data.map((row) => ({ label: row.label, count: state === "low" ? null : row.value, percent: state === "low" ? null : row.percent * 100, sampleSize: state === "low" ? 2 : 2000, denominator: state === "low" ? 2 : 2000, suppressed: state === "low" }))} />
      </div>
      </>}
    </div>
  </main>,
);

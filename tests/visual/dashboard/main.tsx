import { createRoot } from "react-dom/client";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardSavedViews } from "@/components/dashboard/DashboardSavedViews";
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
const data = state === "empty" ? [] : state === "low" ? rows.slice(0, 2).map((row) => ({ ...row, value: 1, percent: 0.5 })) : rows;

createRoot(document.getElementById("root")!).render(
  <main className="admin-app min-h-screen bg-[#F6F6F5] p-3 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold">Dashboard component QA</h1><p className="text-sm text-slate-600">ข้อมูลจำลองเฉพาะการทดสอบ UI ไม่ใช่หลักฐานวิจัยหรือหน้าระบบจริง</p></div>
        <ExportPrivacyDialog endpoint="/fixture-export-disabled" exportType="summary" label="รายงานสรุป" searchParams="evidence_scope=pilot_only" />
      </header>
      <DashboardFilters filters={filters} options={options} />
      <DashboardSavedViews filters={filters} />
      <TrendChart points={state === "empty" ? [] : [{ label: "2026-08-01", value: 14 }, { label: "2026-08-02", value: 23 }, { label: "2026-08-03", value: 18 }]} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <BarChartCard title="วัตถุประสงค์การเดินทาง" definition="จำนวนคำตอบแยกตามวัตถุประสงค์" data={data} emptyDescription="ไม่มีคำตอบในขอบเขตนี้" sampleCount={state === "low" ? 2 : 2000} />
        <DonutChartCard title="สัดส่วนวัตถุประสงค์" definition="สัดส่วนจากคำตอบที่ระบุวัตถุประสงค์" data={data} emptyDescription="ไม่มีคำตอบในขอบเขตนี้" />
        <AttractionScoreChart metrics={state === "empty" ? [] : [{ key: "overall_score", label: "ประสบการณ์โดยรวม", value: state === "low" ? null : 4.25, sampleSize: state === "low" ? 2 : 40, suppressed: state === "low" }]} />
        <AttractionDistributionChart title="วัตถุประสงค์รายสถานที่" description="คำตอบในสถานที่ที่เลือก" rows={data.map((row) => ({ label: row.label, count: state === "low" ? null : row.value, percent: state === "low" ? null : row.percent * 100, sampleSize: state === "low" ? 2 : 2000, denominator: state === "low" ? 2 : 2000, suppressed: state === "low" }))} />
      </div>
    </div>
  </main>,
);

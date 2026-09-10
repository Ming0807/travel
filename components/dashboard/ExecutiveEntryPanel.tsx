import Link from "next/link";
import { AttractionChannelPanel } from "@/components/dashboard/AttractionChannelPanel";
import { dashboardFiltersToSafeQuery } from "@/lib/dashboard/dashboard-saved-views";
import type { ExecutiveEntryAnalytics } from "@/lib/services/executive-entry.service";
import type { DashboardFilters } from "@/types/dashboard";

const states = {
  disabled: "ยังไม่เปิดเก็บช่องทาง QR / NFC",
  incomplete: "ข้อมูลยังอ่านไม่ครบ กรุณาลดช่วงวันที่",
  unavailable: "ยังอ่านข้อมูลช่องทางไม่ได้ กรุณาลองอีกครั้ง",
  unsupported_filters: "ตัวกรองกลุ่มผู้ตอบใช้คำนวณอัตราจากผู้เริ่มทั้งหมดไม่ได้",
};

export function ExecutiveEntryPanel({ result, filters }: { result: ExecutiveEntryAnalytics; filters: DashboardFilters }) {
  if (result.status === "ready" && result.data) return <AttractionChannelPanel data={result.data} />;
  const query = new URLSearchParams(dashboardFiltersToSafeQuery(filters));
  for (const key of ["origin_country_id", "origin_province_id", "age_group", "transport_mode_id", "travel_purpose_id", "satisfaction_min", "satisfaction_max"]) query.delete(key);
  return <section className="min-w-0 border-y border-slate-200 bg-white px-4 py-5 sm:px-6" aria-label="ผลลัพธ์จากรอบเริ่มเข้าใช้งาน">
    <h2 className="text-xl font-black text-slate-950">จาก QR / NFC สู่การเช็กอิน</h2>
    <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{states[result.status === "ready" ? "unavailable" : result.status]}</p>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">นับตามวันที่เริ่มเข้าใช้งาน ไม่ใช่วันที่บันทึก Visit หรือยอดดูเว็บไซต์</p>
    {result.status === "unsupported_filters" ? <>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">ผู้ที่ออกก่อนกรอกข้อมูลไม่มีข้อมูลอายุ การเดินทาง หรือคะแนนประเมิน การกรองด้วยข้อมูลเหล่านี้จะทำให้ตัวหารไม่ครอบคลุมผู้เริ่มทั้งหมด</p>
      <Link className="mt-3 inline-flex min-h-11 items-center rounded px-2 py-2 text-sm font-bold text-orange-800 underline underline-offset-4 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-700" href={`/admin/dashboard?${query.toString()}`}>ดูผลจากผู้เริ่มทั้งหมดในขอบเขตนี้</Link>
    </> : null}
  </section>;
}

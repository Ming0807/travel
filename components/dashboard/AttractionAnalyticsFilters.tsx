import { CaretDown, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";

import type { AttractionAnalyticsOption, AttractionCheckinOption } from "@/lib/repositories/attraction-analytics.repository";
import type { AttractionAnalyticsFilters as AttractionAnalyticsFilterValues } from "@/lib/validation/attraction-analytics";

type DateDefaults = Pick<AttractionAnalyticsFilterValues, "dateFrom" | "dateTo">;

function campaignOptions(checkinCodes: AttractionCheckinOption[]) {
  const counts = new Map<number, number>();
  for (const code of checkinCodes) {
    if (code.campaignId === null) continue;
    counts.set(code.campaignId, (counts.get(code.campaignId) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([left], [right]) => left - right);
}

const inputClassName = "mt-2 min-h-11 w-full rounded-[4px] border border-slate-300 bg-white px-3 font-normal text-slate-900 focus:border-[#D94717] focus:outline-none focus:ring-2 focus:ring-[#FAD6C7]";

export function AttractionAnalyticsFilters({
  attractions,
  checkinCodes,
  defaults,
  filters,
}: {
  attractions: AttractionAnalyticsOption[];
  checkinCodes: AttractionCheckinOption[];
  defaults: DateDefaults;
  filters: AttractionAnalyticsFilterValues | null;
}) {
  const campaigns = campaignOptions(checkinCodes);
  const hasAdvancedFilter = Boolean(filters?.entryChannel || filters?.campaignId || filters?.checkinCodeId);

  return (
    <form method="get">
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-7">
        <label className="text-sm font-bold sm:col-span-2">
          สถานที่
          <select className={inputClassName} defaultValue={filters ? String(filters.attractionId) : ""} name="attractionId" required>
            {attractions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">
          เริ่มวันที่
          <input className={inputClassName} defaultValue={filters?.dateFrom ?? defaults.dateFrom} name="dateFrom" required type="date" />
        </label>
        <label className="text-sm font-bold">
          สิ้นสุดวันที่
          <input className={inputClassName} defaultValue={filters?.dateTo ?? defaults.dateTo} name="dateTo" required type="date" />
        </label>
        <label className="text-sm font-bold sm:col-span-2 xl:col-span-2">
          ขอบเขตหลักฐาน
          <select className={inputClassName} defaultValue={filters?.evidenceScope ?? "field_claim"} name="evidenceScope">
            <option value="field_claim">ภาคสนาม (แนะนำ)</option>
            <option value="all_records">ทุกระเบียนเพื่อ QA</option>
            <option value="pilot_only">Pilot เท่านั้น</option>
            <option value="simulated_only">Simulation เท่านั้น</option>
          </select>
        </label>
        <button className="min-h-11 self-end rounded-[4px] bg-[#202020] px-4 font-black text-white transition-colors hover:bg-[#B94727] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94717]" type="submit">
          วิเคราะห์ข้อมูล
        </button>
      </div>

      <details className="group border-t border-[var(--admin-border)] bg-slate-50/70" open={hasAdvancedFilter || undefined}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-2 text-sm font-black text-slate-800 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D94717]">
          <span className="inline-flex items-center gap-2"><SlidersHorizontal aria-hidden="true" className="text-[#B94727]" size={18} />ตัวกรองเฉพาะช่องทางและจุดเช็กอิน</span>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            {hasAdvancedFilter ? "กำลังใช้ตัวกรองเพิ่มเติม" : "ไม่บังคับ"}
            <CaretDown aria-hidden="true" className="transition-transform group-open:rotate-180" size={16} />
          </span>
        </summary>
        <div className="grid gap-4 border-t border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-bold">
            ช่องทางเข้า
            <select className={inputClassName} defaultValue={filters?.entryChannel ?? ""} name="entryChannel">
              <option value="">ทุกช่องทาง</option>
              <option value="qr">QR</option>
              <option value="nfc">NFC</option>
              <option value="direct">Direct</option>
              <option value="admin_import">Admin import</option>
              <option value="unknown">ไม่ทราบ</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            แคมเปญ
            <select className={inputClassName} defaultValue={filters?.campaignId ? String(filters.campaignId) : ""} disabled={campaigns.length === 0} name="campaignId">
              <option value="">{campaigns.length === 0 ? "ยังไม่มีแคมเปญที่ผูกกับจุดเช็กอิน" : "ทุกแคมเปญ"}</option>
              {campaigns.map(([campaignId, count]) => (
                <option key={campaignId} value={campaignId}>แคมเปญ {campaignId} · {count.toLocaleString("th-TH")} จุดเช็กอิน</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold sm:col-span-2 xl:col-span-1">
            จุดเช็กอิน
            <select className={inputClassName} defaultValue={filters?.checkinCodeId ? String(filters.checkinCodeId) : ""} disabled={checkinCodes.length === 0} name="checkinCodeId">
              <option value="">{checkinCodes.length === 0 ? "ยังไม่มีจุดเช็กอินสำหรับสถานที่นี้" : "ทุกจุดของสถานที่"}</option>
              {checkinCodes.map((code) => <option key={code.checkinCodeId} value={code.checkinCodeId}>{code.label} ({code.code})</option>)}
            </select>
          </label>
          <button className="min-h-11 rounded-[4px] bg-[#202020] px-4 font-black text-white transition-colors hover:bg-[#B94727] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94717] sm:col-span-2 xl:hidden" type="submit">
            ใช้ตัวกรองเพิ่มเติม
          </button>
          <p className="text-xs leading-5 text-slate-500 sm:col-span-2 xl:col-span-3">
            Campaign แสดงเฉพาะรหัสที่ผูกกับจุดเช็กอินของสถานที่นี้ ข้อมูลช่องทางเป็น Visit ที่บันทึกว่าเข้าผ่าน QR, NFC, Direct หรือการนำเข้า ไม่ใช่จำนวนผู้เยี่ยมชมที่ไม่ซ้ำ
          </p>
        </div>
      </details>
    </form>
  );
}

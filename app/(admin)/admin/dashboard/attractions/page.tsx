import type { Metadata } from "next";
import { ChartBar, Funnel, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AttractionAnalyticsWorkspace } from "@/components/dashboard/AttractionAnalyticsWorkspace";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { requirePermission } from "@/lib/auth/guards";
import { getAttractionAnalytics, getAttractionAnalyticsOptions } from "@/lib/services/attraction-analytics.service";
import { attractionAnalyticsFiltersSchema } from "@/lib/validation/attraction-analytics";

export const metadata: Metadata = { title: "วิเคราะห์รายสถานที่ | Dashboard" };
export const dynamic = "force-dynamic";

type Query = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function defaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 89);
  return { dateFrom: start.toISOString().slice(0, 10), dateTo: end.toISOString().slice(0, 10) };
}

export default async function AttractionAnalyticsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const [guard, query, attractions] = await Promise.all([
    requirePermission("dashboard.read"),
    searchParams,
    getAttractionAnalyticsOptions(),
  ]);
  const defaults = defaultDates();
  const parsed = attractionAnalyticsFiltersSchema.safeParse({
    attractionId: one(query.attractionId) ?? attractions[0]?.value,
    dateFrom: one(query.dateFrom) ?? defaults.dateFrom,
    dateTo: one(query.dateTo) ?? defaults.dateTo,
    campaignId: one(query.campaignId) || undefined,
    checkinCodeId: one(query.checkinCodeId) || undefined,
    evidenceScope: one(query.evidenceScope) ?? "field_claim",
    entryChannel: one(query.entryChannel) || undefined,
  });
  let data = null;
  let loadFailed = false;
  if (parsed.success) {
    try {
      data = await getAttractionAnalytics(parsed.data);
    } catch {
      loadFailed = true;
    }
  }

  return (
    <AdminShell admin={guard.actor}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Attraction Intelligence"
          title="วิเคราะห์ข้อมูลรายสถานที่"
          description="ตอบให้ชัดว่าสถานที่นี้มีผู้ใช้แบบใด Flow หลุดตรงไหน ผู้เยี่ยมชมรายงานอะไร และควรส่งต่อหลักฐานไปสู่แผนปรับปรุงใด"
        />

        <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="analytics-scope-heading">
          <div className="grid gap-4 border-b border-[var(--admin-border)] p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div><h2 id="analytics-scope-heading" className="flex items-center gap-2 text-lg font-black"><MagnifyingGlass aria-hidden="true" className="text-[#B94727]" /> ขอบเขตหลักฐาน</h2><p className="mt-1 text-sm leading-6 text-slate-600">ค่าเริ่มต้นตัด Pilot และ Simulation ออกจากข้อสรุปภาคสนาม ตัวกรอง Campaign ใช้รหัสจาก Check-in code ที่บันทึกจริง</p></div>
            <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="inline-flex min-h-9 items-center gap-1 border border-emerald-200 bg-emerald-50 px-3 text-emerald-900"><ShieldCheck aria-hidden="true" /> Privacy threshold n=10</span><span className="inline-flex min-h-9 items-center gap-1 border border-orange-200 bg-orange-50 px-3 text-[#9A3412]"><Funnel aria-hidden="true" /> Visit-safe funnel</span><span className="inline-flex min-h-9 items-center gap-1 border border-slate-200 bg-slate-50 px-3"><ChartBar aria-hidden="true" /> Metric contract</span></div>
          </div>
          <form method="get" className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-9">
            <label className="text-sm font-bold sm:col-span-2">สถานที่<select name="attractionId" defaultValue={parsed.success ? String(parsed.data.attractionId) : ""} required className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{attractions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-bold">เริ่มวันที่<input type="date" name="dateFrom" defaultValue={parsed.success ? parsed.data.dateFrom : defaults.dateFrom} required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">สิ้นสุดวันที่<input type="date" name="dateTo" defaultValue={parsed.success ? parsed.data.dateTo : defaults.dateTo} required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold xl:col-span-2">Evidence scope<select name="evidenceScope" defaultValue={parsed.success ? parsed.data.evidenceScope : "field_claim"} className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="field_claim">ภาคสนาม (แนะนำ)</option><option value="all_records">ทุกระเบียนเพื่อ QA</option><option value="pilot_only">Pilot เท่านั้น</option><option value="simulated_only">Simulation เท่านั้น</option></select></label>
            <label className="text-sm font-bold">ช่องทางเข้า<select name="entryChannel" defaultValue={parsed.success ? parsed.data.entryChannel ?? "" : ""} className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">ทุกช่องทาง</option><option value="qr">QR</option><option value="nfc">NFC</option><option value="direct">Direct</option><option value="admin_import">Admin import</option><option value="unknown">ไม่ทราบ</option></select></label>
            <label className="text-sm font-bold">Campaign ID<input type="number" name="campaignId" min="1" defaultValue={parsed.success ? parsed.data.campaignId : undefined} placeholder="ทั้งหมด" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            {data && data.referenceOptions.checkinCodes.length > 0 ? <label className="text-sm font-bold sm:col-span-2">จุด Check-in<select name="checkinCodeId" defaultValue={parsed.success ? String(parsed.data.checkinCodeId ?? "") : ""} className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">ทุกจุดของสถานที่</option>{data.referenceOptions.checkinCodes.map((code) => <option key={code.checkinCodeId} value={code.checkinCodeId}>{code.label} ({code.code})</option>)}</select></label> : null}
            <button type="submit" className="min-h-11 self-end bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2 xl:col-span-1">วิเคราะห์ข้อมูล</button>
          </form>
        </section>

        {!parsed.success ? <NoDataState title="ตัวกรองไม่ถูกต้อง" description="กรุณาเลือกสถานที่และช่วงวันที่ไม่เกิน 2 ปี" /> : loadFailed ? <NoDataState title="ยังโหลด Analytics ไม่ได้" description="ตรวจว่าได้รัน migration Phase 21-22 แล้ว จากนั้นลองใหม่" /> : data ? <AttractionAnalyticsWorkspace data={data} /> : <NoDataState title="ยังไม่มีสถานที่" description="เพิ่มและเปิดใช้งานสถานที่ก่อนเริ่มวิเคราะห์" />}
      </div>
    </AdminShell>
  );
}

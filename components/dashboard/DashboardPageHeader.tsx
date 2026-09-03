import type { ReactNode } from "react";
import { CalendarDots, Clock, Database } from "@phosphor-icons/react/dist/ssr";

import type { DashboardFilters, DashboardViewModel } from "@/types/dashboard";

export type DashboardPageKey =
  | "overview"
  | "tourists"
  | "visits"
  | "expenses"
  | "satisfaction"
  | "funnel"
  | "sustainability";

const PAGE_COPY: Record<DashboardPageKey, { eyebrow: string; title: string; description: string; headingId: string }> = {
  overview: {
    eyebrow: "Executive overview",
    title: "ภาพรวมการตัดสินใจ",
    description: "มองเห็นสิ่งที่เปลี่ยน ประเด็นที่ควรให้ความสำคัญ และข้อจำกัดของหลักฐานในช่วงที่เลือก",
    headingId: "executive-overview-heading",
  },
  tourists: {
    eyebrow: "Audience intelligence",
    title: "กลุ่มนักท่องเที่ยว",
    description: "ทำความเข้าใจโปรไฟล์ผู้เข้าร่วมแบบรวม โดยแสดงฐานคำตอบและความครบถ้วนก่อนใช้วางแผน",
    headingId: "dashboard-page-tourists-heading",
  },
  visits: {
    eyebrow: "Travel behavior",
    title: "พฤติกรรมการเดินทาง",
    description: "วิเคราะห์ผู้ร่วมเดินทาง การเดินทาง วัตถุประสงค์ และการค้างคืนจาก Visit ที่ตอบมิตินั้น",
    headingId: "dashboard-page-visits-heading",
  },
  expenses: {
    eyebrow: "Economic signals",
    title: "สัญญาณค่าใช้จ่าย",
    description: "รูปแบบการใช้จ่ายที่ผู้ตอบรายงานเองเพื่อช่วยวางแผน ไม่ใช่รายได้หรือผลกระทบทางเศรษฐกิจอย่างเป็นทางการ",
    headingId: "dashboard-page-expenses-heading",
  },
  satisfaction: {
    eyebrow: "Visitor experience",
    title: "คุณภาพประสบการณ์",
    description: "ติดตามคะแนนรายมิติ ความตั้งใจกลับมา และประเด็นที่ควรส่งต่อสู่การปรับปรุง",
    headingId: "dashboard-page-satisfaction-heading",
  },
  funnel: {
    eyebrow: "Journey and conversion",
    title: "เส้นทางผู้ใช้",
    description: "ตรวจจุดหลุดจากการเข้าสู่ระบบถึงใบประกาศ แบบสำรวจ และ Passport โดยไม่ปน event กับ Visit",
    headingId: "dashboard-page-funnel-heading",
  },
  sustainability: {
    eyebrow: "Sustainability and action",
    title: "ความยั่งยืนและข้อเสนอ",
    description: "จัดลำดับข้อค้นพบจากกติกาที่ตรวจสอบได้ เพื่อประกอบบริบทพื้นที่และส่งต่อเป็นงานที่มีผู้รับผิดชอบ",
    headingId: "dashboard-page-sustainability-heading",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

const UPDATED_FORMATTER = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(`${value}T12:00:00+07:00`));
}

export function DashboardPageHeader({
  actions,
  dataSource,
  filters,
  generatedAt,
  page,
  summaryRefreshTimestamp,
}: {
  actions?: ReactNode;
  dataSource: DashboardViewModel["dataSource"];
  filters: Pick<DashboardFilters, "dateFrom" | "dateTo">;
  generatedAt: string;
  page: DashboardPageKey;
  summaryRefreshTimestamp: string | null;
}) {
  const copy = PAGE_COPY[page];
  const updatedAt = summaryRefreshTimestamp ?? generatedAt;
  const sourceLabel = dataSource === "pre_aggregated" ? "ข้อมูลสรุปที่ประมวลผลแล้ว" : "ฐานข้อมูลปัจจุบัน";

  return (
    <header className="border-b border-slate-200 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-[#B94727]">{copy.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-[1.65rem]" id={copy.headingId}>{copy.title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{copy.description}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600" aria-label="ขอบเขตและความสดของข้อมูล">
        <span className="inline-flex items-center gap-1.5"><CalendarDots aria-hidden="true" size={15} />{formatDate(filters.dateFrom)} - {formatDate(filters.dateTo)}</span>
        <span className="inline-flex items-center gap-1.5"><Database aria-hidden="true" size={15} />{sourceLabel}</span>
        <span className="inline-flex items-center gap-1.5"><Clock aria-hidden="true" size={15} />อัปเดตข้อมูล {UPDATED_FORMATTER.format(new Date(updatedAt))}</span>
      </div>
    </header>
  );
}

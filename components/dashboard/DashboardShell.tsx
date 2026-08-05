import type { ReactNode } from "react";
import { CalendarBlank, Clock, Database, Info, MapPin } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardAlertBar } from "@/components/dashboard/DashboardAlertBar";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import type { DashboardViewModel } from "@/types/dashboard";

function filtersSig(filters: DashboardViewModel["filters"]): string {
  return `${filters.dateFrom}-${filters.dateTo}-${filters.provinceId ?? ""}-${filters.attractionId ?? ""}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function DashboardShell({ data, children }: { data: DashboardViewModel; children: ReactNode }) {
  const visitCount = data.kpis.find((metric) => metric.key === "total_visits")?.rawValue;
  const sourceLabel = data.dataSource === "pre_aggregated" ? "ข้อมูลสรุปที่ประมวลผลแล้ว" : "ฐานข้อมูลปัจจุบัน";
  const updatedAt = data.summaryRefreshTimestamp ?? data.generatedAt;

  return (
    <AdminShell admin={{ displayName: data.viewer.displayName, email: data.viewer.email }}>
      <div className="min-w-0 space-y-4">
        <DashboardTabs />
        <DashboardFilters filters={data.filters} options={data.referenceOptions} />

        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 border-y border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="text-[#D94717]" size={14} weight="fill" />พื้นที่นำร่อง: <strong className="text-slate-900">ยะลา</strong></span>
          <span className="inline-flex items-center gap-1.5"><CalendarBlank aria-hidden="true" size={14} />{formatDate(data.filters.dateFrom)} - {formatDate(data.filters.dateTo)}</span>
          <span className="inline-flex items-center gap-1.5"><Database aria-hidden="true" size={14} />{sourceLabel}</span>
          <span className="inline-flex items-center gap-1.5"><Clock aria-hidden="true" size={14} />อัปเดต {new Date(updatedAt).toLocaleString("th-TH")}</span>
          <span className="tabular-nums">ฐาน {visitCount !== null && visitCount !== undefined ? `${visitCount.toLocaleString("th-TH")} รายการเข้าชม` : "ยังไม่มีข้อมูล"}</span>
          <details className="relative ml-auto">
            <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-[4px] px-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D94717]">
              <Info aria-hidden="true" size={14} /> วิธีอ่านข้อมูล
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-[min(22rem,calc(100vw-2rem))] rounded-[4px] border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-600 shadow-[0_4px_8px_rgba(15,23,42,0.12)]">
              ข้อมูลนี้ไม่ใช่สถิตินักท่องเที่ยวทางการ การสแกน QR เพียงอย่างเดียวยังไม่นับเป็นการเข้าชม และค่าใช้จ่ายเป็นค่าประมาณจากแบบสำรวจ
            </div>
          </details>
        </div>

        {children}
        {data.dashboardAlerts.length > 0 ? (
          <DashboardAlertBar alerts={data.dashboardAlerts} filtersSig={filtersSig(data.filters)} />
        ) : null}
      </div>
    </AdminShell>
  );
}

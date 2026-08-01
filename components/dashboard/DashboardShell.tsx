import type { ReactNode } from "react";
import { CalendarBlank, Clock, Database, MapPin } from "@phosphor-icons/react/dist/ssr";
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
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#B94727]">ศูนย์วิเคราะห์ข้อมูล</p>
            <h1 className="mt-1 text-2xl font-black text-[#171717]">ภาพรวมการท่องเที่ยว</h1>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-600">
              ติดตามพฤติกรรม การเข้าชม และคุณภาพประสบการณ์ เพื่อวางแผนพื้นที่นำร่องจังหวัดยะลา
            </p>
          </div>
          <div className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-[#E8B8A8] bg-[#FFF7F3] px-3 text-sm font-bold text-[#8F351F] lg:self-auto">
            <MapPin aria-hidden="true" size={17} weight="fill" />
            พื้นที่นำร่อง: ยะลา
          </div>
        </header>

        <section aria-label="บริบทของข้อมูล" className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_4px_8px_rgba(15,23,42,0.05)] xl:flex">
          <dl className="grid min-w-0 flex-1 grid-cols-2 xl:grid-cols-4">
            <div className="border-b border-r border-slate-200 px-3 py-2.5 xl:border-b-0">
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarBlank aria-hidden="true" size={16} />ช่วงข้อมูล</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-900">{formatDate(data.filters.dateFrom)} - {formatDate(data.filters.dateTo)}</dd>
            </div>
            <div className="border-b border-slate-200 px-3 py-2.5 xl:border-b-0 xl:border-r">
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Database aria-hidden="true" size={16} />แหล่งข้อมูล</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-900">{sourceLabel}</dd>
            </div>
            <div className="border-b border-r border-slate-200 px-3 py-2.5 xl:border-b-0">
              <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Clock aria-hidden="true" size={16} />อัปเดตล่าสุด</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-900">{new Date(updatedAt).toLocaleString("th-TH")}</dd>
            </div>
            <div className="px-3 py-2.5">
              <dt className="text-xs font-semibold text-slate-500">ฐานข้อมูลที่นำมาวิเคราะห์</dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{visitCount !== null && visitCount !== undefined ? `${visitCount.toLocaleString("th-TH")} รายการเข้าชม` : "ยังไม่มีข้อมูล"}</dd>
            </div>
          </dl>
          <details className="min-w-44 border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 xl:border-l xl:border-t-0">
            <summary className="flex min-h-9 cursor-pointer items-center font-semibold text-slate-700">วิธีอ่านข้อมูล</summary>
            <p className="pb-1 leading-5 xl:max-w-64">ข้อมูลนี้ไม่ใช่สถิตินักท่องเที่ยวทางการ การสแกน QR เพียงอย่างเดียวยังไม่นับเป็นการเข้าชม และค่าใช้จ่ายเป็นค่าประมาณจากแบบสำรวจ</p>
          </details>
        </section>

        <DashboardFilters filters={data.filters} options={data.referenceOptions} />
        <DashboardTabs />
        {children}
        {data.dashboardAlerts.length > 0 ? (
          <DashboardAlertBar alerts={data.dashboardAlerts} filtersSig={filtersSig(data.filters)} />
        ) : null}
      </div>
    </AdminShell>
  );
}

import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
      <div className="min-w-0 space-y-5">
        <AdminPageHeader
          eyebrow="ศูนย์วิเคราะห์ข้อมูล"
          title="ภาพรวมการท่องเที่ยว"
          description="ข้อมูลการมีส่วนร่วมของนักท่องเที่ยวสำหรับวางแผนและติดตามผลในยะลา ปัตตานี และนราธิวาส"
        />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-slate-200 py-3 text-xs text-slate-600">
          <span><strong className="text-slate-800">ช่วงข้อมูล:</strong> {formatDate(data.filters.dateFrom)} ถึง {formatDate(data.filters.dateTo)}</span>
          <span><strong className="text-slate-800">แหล่งข้อมูล:</strong> {sourceLabel}</span>
          <span><strong className="text-slate-800">อัปเดต:</strong> {new Date(updatedAt).toLocaleString("th-TH")}</span>
          {visitCount !== null && visitCount !== undefined ? (
            <span><strong className="text-slate-800">ฐานตัวอย่าง:</strong> {visitCount.toLocaleString("th-TH")} รายการเข้าชม</span>
          ) : null}
          <span className="basis-full text-slate-500">
            ข้อมูลในระบบไม่ใช่สถิตินักท่องเที่ยวทางการ การสแกน QR ยังไม่นับเป็นการเข้าชม และค่าใช้จ่ายเป็นค่าประมาณจากแบบสำรวจ
          </span>
        </div>

        <DashboardFilters filters={data.filters} options={data.referenceOptions} />
        <DashboardTabs />
        {data.dashboardAlerts.length > 0 ? (
          <DashboardAlertBar alerts={data.dashboardAlerts} filtersSig={filtersSig(data.filters)} />
        ) : null}
        {children}
      </div>
    </AdminShell>
  );
}

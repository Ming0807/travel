import type { ReactNode } from "react";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardAlertBar } from "@/components/dashboard/DashboardAlertBar";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardPageHeader, type DashboardPageKey } from "@/components/dashboard/DashboardPageHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import type { DashboardViewModel } from "@/types/dashboard";

function filtersSig(filters: DashboardViewModel["filters"]): string {
  return `${filters.dateFrom}-${filters.dateTo}-${filters.provinceId ?? ""}-${filters.attractionId ?? ""}`;
}

export function DashboardShell({
  actions,
  children,
  data,
  page,
}: {
  actions?: ReactNode;
  children: ReactNode;
  data: DashboardViewModel;
  page: DashboardPageKey;
}) {
  return (
    <AdminShell admin={{ displayName: data.viewer.displayName, email: data.viewer.email, permissions: data.viewer.permissions }}>
      <div className="min-w-0 space-y-4">
        <DashboardPageHeader
          actions={actions}
          dataSource={data.dataSource}
          filters={data.filters}
          generatedAt={data.generatedAt}
          page={page}
          summaryRefreshTimestamp={data.summaryRefreshTimestamp}
        />
        <DashboardTabs />
        <DashboardFilters filters={data.filters} options={data.referenceOptions} />

        {children}

        <footer className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 pt-3 text-[11px] font-semibold text-slate-500">
          <span>ขอบเขตนำร่อง: จังหวัดยะลา</span>
          <details className="relative ml-auto">
            <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-[4px] px-2 text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D94717]">
              <Info aria-hidden="true" size={14} /> วิธีอ่านข้อมูล
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-[min(22rem,calc(100vw-2rem))] rounded-[4px] border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-600 shadow-[0_4px_8px_rgba(15,23,42,0.12)]">
              ข้อมูลนี้ไม่ใช่สถิตินักท่องเที่ยวทางการ การสแกน QR เพียงอย่างเดียวยังไม่นับเป็นการเข้าชม และค่าใช้จ่ายเป็นค่าประมาณจากแบบสำรวจ
            </div>
          </details>
        </footer>
        {data.dashboardAlerts.length > 0 ? (
          <DashboardAlertBar alerts={data.dashboardAlerts} filtersSig={filtersSig(data.filters)} />
        ) : null}
      </div>
    </AdminShell>
  );
}

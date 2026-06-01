import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardAlertBar } from "@/components/dashboard/DashboardAlertBar";
import type { DashboardViewModel } from "@/types/dashboard";

/* ─── generate a lightweight filters signature for localStorage scoping ─── */
function filtersSig(filters: DashboardViewModel["filters"]): string {
  return `${filters.dateFrom}-${filters.dateTo}-${filters.provinceId ?? ""}-${filters.attractionId ?? ""}`;
}

export function DashboardShell({ data, children }: { data: DashboardViewModel; children: ReactNode }) {
  const sig = filtersSig(data.filters);

  return (
    <AdminShell admin={{ displayName: data.viewer.displayName, email: data.viewer.email }}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Phase 09"
          title="Dashboard Analytics"
          description="Privacy-safe tourism planning metrics for Yala, Pattani, Narathiwat, and wider southern border participation data."
        />
        <div className="rounded-2xl border border-[#0A6B62]/15 bg-[#E6F4EF] p-4 text-sm leading-6 text-[#073F37]">
          <strong>Data source:</strong> live database. <strong>Last updated:</strong>{" "}
          {new Date(data.generatedAt).toLocaleString("th-TH")}.{" "}
          <strong>Important:</strong> QR scans are tracked separately from visits. Tourist profiles are system profiles, not verified unique people. Estimated spending is self-reported range data, not revenue. Missing values are shown as "No data" — not zero.
        </div>

        {/* Dashboard alerts — integrated into all dashboard pages */}
        {data.dashboardAlerts.length > 0 && (
          <DashboardAlertBar alerts={data.dashboardAlerts} filtersSig={sig} />
        )}

        <DashboardFilters filters={data.filters} options={data.referenceOptions} />
        <DashboardTabs />
        {children}
      </div>
    </AdminShell>
  );
}

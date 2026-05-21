import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import type { DashboardViewModel } from "@/types/dashboard";

export function DashboardShell({ data, children }: { data: DashboardViewModel; children: ReactNode }) {
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
          {new Date(data.generatedAt).toLocaleString("th-TH")}. QR scans are tracked separately from visits, and estimated spending is not revenue.
        </div>
        <DashboardFilters filters={data.filters} options={data.referenceOptions} />
        {children}
      </div>
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { FunnelDetailTable } from "@/components/dashboard/FunnelDetailTable";
import { RefreshSummaryButton } from "@/components/dashboard/RefreshSummaryButton";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "Funnel Analytics | Admin Dashboard"
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminDashboardFunnelPage({ searchParams = {} }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  let data;
  let caughtError: Error | null = null;

  try {
    data = await getDashboardAnalytics(resolvedSearchParams, "funnel");
  } catch (error) {
    caughtError = error as Error;
  }

  if (caughtError || !data) {
    const isValidationError = caughtError instanceof DashboardServiceError && caughtError.code === "VALIDATION_ERROR";
    return (
      <AdminShell>
        <div className="space-y-6">
          <AdminPageHeader eyebrow="Phase 09" title={isValidationError ? "Invalid filters" : "Dashboard unavailable"} description="Dashboard analytics are protected." />
          <NoDataState title="Error" description={caughtError?.message ?? "Could not load data."} />
        </div>
      </AdminShell>
    );
  }

  const refreshTime = data.summaryRefreshTimestamp;

  return (
    <DashboardShell data={data}>
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Summary data:{" "}
            {refreshTime
              ? `Last refreshed ${new Date(refreshTime).toLocaleString("th-TH")}`
              : "Not yet refreshed (using live queries)"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Pre-computed aggregates for faster dashboard loading. Click refresh to recompute from raw data.
          </p>
        </div>
        <RefreshSummaryButton />
      </div>
      <FunnelSection data={data} />
      <div className="mt-6">
        <FunnelDetailTable stages={data.funnel.stages} />
      </div>
    </DashboardShell>
  );
}

import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requirePermission } from "@/lib/auth/guards";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "Dashboard Analytics | Admin"
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminDashboardPage({ searchParams = {} }: DashboardPageProps) {
  await requirePermission("dashboard.read");
  const resolvedSearchParams = await searchParams;
  let data;
  let caughtError: Error | null = null;

  try {
    data = await getDashboardAnalytics(resolvedSearchParams);
  } catch (error) {
    caughtError = error as Error;
  }

  if (caughtError || !data) {
    const isValidationError = caughtError instanceof DashboardServiceError && caughtError.code === "VALIDATION_ERROR";
    return (
      <AdminShell>
        <div className="space-y-6">
          <AdminPageHeader eyebrow="Phase 09" title={isValidationError ? "Invalid filters" : "Dashboard unavailable"} description="Dashboard analytics are protected and return aggregated data only." />
          <NoDataState title={isValidationError ? "Invalid filters" : "Error"} description={caughtError?.message ?? "Could not load dashboard data."} />
        </div>
      </AdminShell>
    );
  }

  return (
    <DashboardShell data={data}>
      <ErrorBoundary fallbackTitle="Executive overview unavailable" fallbackDescription="The chart section encountered an error. Try refreshing the page.">
        <ExecutiveOverview data={data} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

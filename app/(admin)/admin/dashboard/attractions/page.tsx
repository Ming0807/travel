import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requirePermission } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AttractionPerformanceSection } from "@/components/dashboard/AttractionPerformanceSection";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { getDashboardAnalytics, DashboardServiceError } from "@/lib/services/dashboard.service";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Attraction Performance | Dashboard | Admin",
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AttractionPerformanceDashboardPage({ searchParams = {} }: DashboardPageProps) {
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
      <ErrorBoundary fallbackTitle="Attraction performance unavailable" fallbackDescription="The chart section encountered an error. Try refreshing the page.">
        <AttractionPerformanceSection data={data} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

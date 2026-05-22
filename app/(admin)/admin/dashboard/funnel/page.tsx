import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "Funnel | Admin Dashboard"
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

  return (
    <DashboardShell data={data}>
      <FunnelSection data={data} />
    </DashboardShell>
  );
}

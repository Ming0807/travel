import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExpenseSection } from "@/components/dashboard/ExpenseSection";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { SatisfactionSection } from "@/components/dashboard/SatisfactionSection";
import { SustainableTourismSection } from "@/components/dashboard/SustainableTourismSection";
import { TouristProfileSection } from "@/components/dashboard/TouristProfileSection";
import { TravelBehaviorSection } from "@/components/dashboard/TravelBehaviorSection";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "Dashboard Analytics | Admin"
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

function DashboardErrorPage({ error }: { error: DashboardServiceError | Error }) {
  const title =
    error instanceof DashboardServiceError && error.code === "VALIDATION_ERROR"
      ? "Invalid dashboard filters"
      : "Dashboard unavailable";

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Phase 09"
          title={title}
          description="Dashboard analytics are protected and return aggregated data only."
        />
        <NoDataState
          title={title}
          description={
            error instanceof DashboardServiceError
              ? error.message
              : "Could not load dashboard data. Please try again."
          }
        />
      </div>
    </AdminShell>
  );
}

export default async function AdminDashboardPage({ searchParams = {} }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  let data;
  let caughtError: Error | null = null;

  try {
    data = await getDashboardAnalytics(resolvedSearchParams);
  } catch (error) {
    caughtError = error as Error;
  }

  if (caughtError || !data) {
    return <DashboardErrorPage error={caughtError ?? new Error("Could not load dashboard data.")} />;
  }

  return (
    <DashboardShell data={data}>
      <ExecutiveOverview data={data} />
      <TouristProfileSection data={data} />
      <TravelBehaviorSection data={data} />
      <ExpenseSection data={data} />
      <SatisfactionSection data={data} />
      <FunnelSection data={data} />
      <SustainableTourismSection data={data} />
    </DashboardShell>
  );
}

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardPageFailure } from "@/components/dashboard/DashboardPageFailure";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { RefreshSummaryButton } from "@/components/dashboard/RefreshSummaryButton";
import { getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "เส้นทางการใช้งาน | Dashboard"
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
    return (
      <AdminShell>
        <DashboardPageFailure error={caughtError} />
      </AdminShell>
    );
  }

  return (
    <DashboardShell actions={<RefreshSummaryButton />} data={data} page="funnel">
      <FunnelSection data={data} />
    </DashboardShell>
  );
}

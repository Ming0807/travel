import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { TravelBehaviorSection } from "@/components/dashboard/TravelBehaviorSection";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardPageFailure } from "@/components/dashboard/DashboardPageFailure";
import { getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "พฤติกรรมการเดินทาง | Dashboard"
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminDashboardVisitsPage({ searchParams = {} }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  let data;
  let caughtError: Error | null = null;

  try {
    data = await getDashboardAnalytics(resolvedSearchParams, "visits");
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
    <DashboardShell data={data} page="visits">
      <TravelBehaviorSection data={data} />
    </DashboardShell>
  );
}

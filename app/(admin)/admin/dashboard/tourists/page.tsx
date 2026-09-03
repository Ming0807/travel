import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { TouristProfileSection } from "@/components/dashboard/TouristProfileSection";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardPageFailure } from "@/components/dashboard/DashboardPageFailure";
import { getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "ลักษณะนักท่องเที่ยว | Dashboard"
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminDashboardTouristsPage({ searchParams = {} }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  let data;
  let caughtError: Error | null = null;

  try {
    data = await getDashboardAnalytics(resolvedSearchParams, "tourists");
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
    <DashboardShell data={data} page="tourists">
      <TouristProfileSection data={data} />
    </DashboardShell>
  );
}

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requirePermission } from "@/lib/auth/guards";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardPageFailure } from "@/components/dashboard/DashboardPageFailure";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "ภาพรวมการวิเคราะห์ | ผู้ดูแลระบบ"
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
    return (
      <AdminShell>
        <DashboardPageFailure error={caughtError} />
      </AdminShell>
    );
  }

  return (
    <DashboardShell actions={<ExportCsvButton />} data={data} page="overview">
      <ErrorBoundary fallbackTitle="ไม่สามารถแสดงภาพรวมได้" fallbackDescription="ส่วนแสดงผลพบข้อผิดพลาด กรุณารีเฟรชหน้าแล้วลองอีกครั้ง">
        <ExecutiveOverview data={data} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

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
    const isValidationError = caughtError instanceof DashboardServiceError && caughtError.code === "VALIDATION_ERROR";
    return (
      <AdminShell>
        <div className="space-y-6">
          <AdminPageHeader eyebrow="ศูนย์วิเคราะห์ข้อมูล" title={isValidationError ? "ตัวกรองไม่ถูกต้อง" : "ไม่สามารถเปิด Dashboard ได้"} description="ข้อมูลวิเคราะห์ได้รับการป้องกันและแสดงเฉพาะข้อมูลแบบสรุป" />
          <NoDataState title={isValidationError ? "ตรวจสอบตัวกรอง" : "เกิดข้อผิดพลาด"} description={isValidationError ? "กรุณาตรวจสอบช่วงวันที่และค่าตัวกรอง แล้วลองใหม่" : "ระบบยังโหลดข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง"} />
        </div>
      </AdminShell>
    );
  }

  return (
    <DashboardShell data={data}>
      <ErrorBoundary fallbackTitle="ไม่สามารถแสดงภาพรวมได้" fallbackDescription="ส่วนแสดงผลพบข้อผิดพลาด กรุณารีเฟรชหน้าแล้วลองอีกครั้ง">
        <ExecutiveOverview data={data} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

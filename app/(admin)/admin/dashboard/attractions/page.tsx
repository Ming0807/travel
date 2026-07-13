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
  title: "ผลงานสถานที่ท่องเที่ยว | Dashboard",
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
          <AdminPageHeader eyebrow="ศูนย์วิเคราะห์ข้อมูล" title={isValidationError ? "ตัวกรองไม่ถูกต้อง" : "ไม่สามารถเปิด Dashboard ได้"} description="ข้อมูลวิเคราะห์แสดงในรูปแบบสรุปเพื่อปกป้องข้อมูลส่วนบุคคล" />
          <NoDataState title={isValidationError ? "ตรวจสอบตัวกรอง" : "เกิดข้อผิดพลาด"} description={isValidationError ? "กรุณาตรวจสอบช่วงวันที่และตัวกรอง แล้วลองใหม่" : "ระบบยังโหลดข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง"} />
        </div>
      </AdminShell>
    );
  }

  return (
    <DashboardShell data={data}>
      <ErrorBoundary fallbackTitle="ไม่สามารถแสดงผลงานสถานที่ได้" fallbackDescription="ส่วนแสดงผลพบข้อผิดพลาด กรุณารีเฟรชหน้าแล้วลองอีกครั้ง">
        <AttractionPerformanceSection data={data} />
      </ErrorBoundary>
    </DashboardShell>
  );
}

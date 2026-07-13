import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExpenseSection } from "@/components/dashboard/ExpenseSection";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata: Metadata = {
  title: "ค่าใช้จ่ายโดยประมาณ | Dashboard"
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminDashboardExpensesPage({ searchParams = {} }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  let data;
  let caughtError: Error | null = null;

  try {
    data = await getDashboardAnalytics(resolvedSearchParams, "expenses");
  } catch (error) {
    caughtError = error as Error;
  }

  if (caughtError || !data) {
    const isValidationError = caughtError instanceof DashboardServiceError && caughtError.code === "VALIDATION_ERROR";
    return (
      <AdminShell>
        <div className="space-y-6">
          <AdminPageHeader eyebrow="ศูนย์วิเคราะห์ข้อมูล" title={isValidationError ? "ตัวกรองไม่ถูกต้อง" : "ไม่สามารถเปิด Dashboard ได้"} description="ข้อมูลวิเคราะห์ได้รับการป้องกันและแสดงเฉพาะข้อมูลแบบสรุป" />
          <NoDataState title="เกิดข้อผิดพลาด" description={isValidationError ? "กรุณาตรวจสอบช่วงวันที่และตัวกรอง" : "ระบบยังโหลดข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง"} />
        </div>
      </AdminShell>
    );
  }

  return (
    <DashboardShell data={data}>
      <ExpenseSection data={data} />
    </DashboardShell>
  );
}

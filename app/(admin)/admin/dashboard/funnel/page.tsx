import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { RefreshSummaryButton } from "@/components/dashboard/RefreshSummaryButton";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

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

  const refreshTime = data.summaryRefreshTimestamp;

  return (
    <DashboardShell data={data}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            ข้อมูลสรุป:{" "}
            {refreshTime
              ? `ประมวลผลล่าสุด ${new Date(refreshTime).toLocaleString("th-TH")}`
              : "ยังไม่ได้ประมวลผลล่วงหน้า ขณะนี้ใช้ข้อมูลปัจจุบัน"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            ประมวลผลข้อมูลรวมล่วงหน้าเพื่อให้ Dashboard โหลดเร็วขึ้น
          </p>
        </div>
        <RefreshSummaryButton />
      </div>
      <FunnelSection data={data} />
    </DashboardShell>
  );
}

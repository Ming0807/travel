import type { Metadata } from "next";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { PublicEvidenceDashboard } from "@/components/dashboard/PublicEvidenceDashboard";
import { getPublicDashboardEvidence } from "@/lib/services/public-dashboard.service";
import type { PublicDashboardEvidence } from "@/types/public-dashboard";

export const metadata: Metadata = {
  title: "ข้อมูลการท่องเที่ยวที่ระบบบันทึกได้ | ท่องเที่ยวชายแดนใต้",
  description: "รายงานหลักฐานสาธารณะจากรายการเข้าชม ใบประกาศ และแบบสำรวจโดยสมัครใจของระบบนำร่องจังหวัดยะลา",
};

export const revalidate = 300;

export default async function PublicDashboardPage() {
  let evidence: PublicDashboardEvidence | null = null;

  try {
    evidence = await getPublicDashboardEvidence();
  } catch {
    evidence = null;
  }

  if (!evidence) {
    return (
      <main className="bg-background px-4 py-16 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border border-ink/10 bg-white p-7 sm:p-10">
          <WarningCircle aria-hidden="true" size={34} className="text-coral" />
          <h1 className="mt-5 text-3xl font-black">ยังไม่สามารถโหลดรายงานสาธารณะได้</h1>
          <p className="mt-3 text-base leading-7 text-muted">
            ระบบไม่สามารถอ่านข้อมูลรวมของจังหวัดยะลาได้ในขณะนี้ กรุณาลองเปิดหน้านี้อีกครั้งภายหลัง
            ข้อมูลส่วนอื่นของเว็บไซต์ยังใช้งานได้ตามปกติ
          </p>
        </div>
      </main>
    );
  }

  return <PublicEvidenceDashboard evidence={evidence} />;
}

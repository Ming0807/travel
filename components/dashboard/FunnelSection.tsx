import { FunnelChart } from "@/components/dashboard/FunnelChart";
import type { DashboardViewModel } from "@/types/dashboard";

export function FunnelSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-5" aria-labelledby="funnel-heading">
      <div>
        <h2 id="funnel-heading" className="text-lg font-bold text-slate-900">เส้นทางการใช้งาน</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">ใช้ค้นหาขั้นตอนที่ผู้ใช้ออกจากกระบวนการ ตั้งแต่สแกน QR จนถึงรับใบประกาศและตอบแบบสำรวจ</p>
      </div>
      <FunnelChart stages={data.funnel.stages} />
      <p className="text-xs leading-5 text-slate-500">ข้อควรระวัง: เหตุการณ์หนึ่งคนอาจเกิดซ้ำได้ จึงไม่ควรตีความเป็นจำนวนบุคคลจริงจนกว่าจะมีการวิเคราะห์ระดับ session ที่สมบูรณ์</p>
    </section>
  );
}

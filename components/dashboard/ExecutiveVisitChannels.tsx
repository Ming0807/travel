import { BarChartCard } from "@/components/dashboard/BarChartCard";
import type { DashboardVisitChannels } from "@/types/dashboard";

const states = {
  disabled: "ยังไม่เปิดเก็บช่องทาง QR / NFC",
  incomplete: "ข้อมูลยังอ่านไม่ครบ กรุณาลดช่วงวันที่",
  suppressed: "ยังไม่แสดงสัดส่วน เพราะบางช่องทางมีข้อมูลน้อยกว่า 10 รายการ",
  empty: "ยังไม่มีรายการเช็กอินในขอบเขตนี้",
};

export function ExecutiveVisitChannels({ data }: { data: DashboardVisitChannels }) {
  if (data.status !== "ready") return <section className="min-w-0 border-y border-slate-200 bg-white px-4 py-5 sm:px-5" aria-label="ช่องทางของรายการเช็กอิน">
    <h2 className="text-base font-black text-slate-950">ช่องทางของรายการเช็กอิน</h2>
    <p className="mt-3 text-sm font-semibold text-slate-700">{states[data.status]}</p>
    <p className="mt-2 text-xs leading-5 text-slate-600">นับรายการเช็กอินที่บันทึกแล้ว ไม่ใช่ยอดดูเว็บไซต์หรือจำนวนครั้งที่แตะแท็ก</p>
  </section>;
  return <div className="min-w-0 space-y-2"><BarChartCard title="ช่องทางของรายการเช็กอิน"
    definition="จำนวน Visit ไม่ซ้ำ แยกตามช่องทางของ entry ที่เชื่อมโยง ใช้วันที่ Visit และตัวกรองเดียวกับภาพรวม ไม่มีการเดาว่าข้อมูลเก่ามาจาก QR"
    data={data.distribution} emptyDescription="ยังไม่มีข้อมูลช่องทาง"
    sampleCount={data.denominator ?? undefined} sampleLabel="รายการเช็กอิน" />
    <p className="px-1 text-xs leading-5 text-slate-600">ฐาน {data.denominator?.toLocaleString("th-TH")} รายการเช็กอิน ไม่ใช่ยอดดูเว็บหรือยอดสแกนทั้งหมด ลิงก์ NFC ที่ถูกคัดลอกยังนับเป็นช่องทาง NFC จึงไม่ยืนยันการแตะแท็กจริง</p>
  </div>;
}

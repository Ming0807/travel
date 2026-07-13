import { Info } from "@phosphor-icons/react/dist/ssr";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatEstimatedSpending } from "@/lib/services/dashboard-math";
import type { DashboardViewModel } from "@/types/dashboard";

export function ExpenseSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-5" aria-labelledby="expense-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="expense-heading" className="text-lg font-bold text-slate-900">ค่าใช้จ่ายโดยประมาณ</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">ประมาณจากช่วงค่าใช้จ่ายที่ผู้ตอบเลือกด้วยตนเอง ไม่ใช่รายได้จริงหรือข้อมูลธุรกรรม</p>
        </div>
        <ExportCsvButton />
      </div>

      <div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm leading-6 text-sky-900">
        <Info aria-hidden="true" className="mt-0.5 shrink-0" size={18} weight="fill" />
        <p><strong>วิธีคำนวณ:</strong> รวมค่าต่ำสุดและสูงสุดของช่วงค่าใช้จ่ายที่ผู้ตอบเลือก ช่องที่ไม่ตอบจะไม่ถูกรวม และผลลัพธ์ไม่ใช่รายได้ที่ตรวจสอบแล้ว</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard metric={{ key: "expense_estimate", label: "ช่วงค่าใช้จ่ายรวมโดยประมาณ", value: formatEstimatedSpending(data.expense.estimatedMin, data.expense.estimatedMax, data.expense.hasOpenEndedRange), rawValue: data.expense.estimatedMin, valueType: "currency_range", definition: "ผลรวมค่าต่ำสุดและสูงสุดจากช่วงค่าใช้จ่ายที่ผู้ตอบเลือก", note: `จากคำตอบ ${data.expense.responseCount.toLocaleString("th-TH")} รายการ` }} sampleCount={data.expense.responseCount} sampleLabel="คำตอบค่าใช้จ่าย" />
        <KpiCard metric={{ key: "expense_min", label: "ค่าประมาณต่ำสุด", value: data.expense.estimatedMin === null ? "No data" : `${data.expense.estimatedMin.toLocaleString("th-TH")} บาท`, rawValue: data.expense.estimatedMin, valueType: "currency_range", definition: "ผลรวมค่าต่ำสุดของช่วงค่าใช้จ่ายที่เลือก" }} sampleCount={data.expense.responseCount} sampleLabel="คำตอบค่าใช้จ่าย" />
        <KpiCard metric={{ key: "expense_max", label: "ค่าประมาณสูงสุด", value: data.expense.estimatedMax === null ? (data.expense.hasOpenEndedRange ? "ไม่กำหนดเพดาน" : "No data") : `${data.expense.estimatedMax.toLocaleString("th-TH")} บาท`, rawValue: data.expense.estimatedMax, valueType: "currency_range", definition: "ผลรวมค่าสูงสุดของช่วงค่าใช้จ่าย หากมีช่วงปลายเปิดจะไม่แสดงเพดานที่ทำให้เข้าใจผิด" }} sampleCount={data.expense.responseCount} sampleLabel="คำตอบค่าใช้จ่าย" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <BarChartCard data={data.expense.spendingRanges} definition="การกระจายช่วงค่าใช้จ่ายที่ผู้ตอบเลือกด้วยตนเอง ไม่ใช่ยอดธุรกรรมจริง" emptyDescription="ยังไม่มีคำตอบช่วงค่าใช้จ่ายสำหรับตัวกรองที่เลือก" title="ช่วงค่าใช้จ่ายที่ผู้ใช้เลือก" sampleCount={data.expense.responseCount} sampleLabel="คำตอบค่าใช้จ่าย" />
        <BarChartCard data={data.expense.expenseCategories} definition="จำนวนคำตอบแยกตามหมวดค่าใช้จ่ายที่ผู้ใช้เลือก" emptyDescription="ยังไม่มีข้อมูลหมวดค่าใช้จ่าย" title="หมวดค่าใช้จ่าย" sampleCount={data.expense.responseCount} sampleLabel="คำตอบค่าใช้จ่าย" />
      </div>
    </section>
  );
}

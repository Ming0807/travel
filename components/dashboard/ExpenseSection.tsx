import { CurrencyCircleDollar, Info, Receipt, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { ExpenseDetailTable } from "@/components/dashboard/ExpenseDetailTable";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SurveyRecordsLink } from "@/components/dashboard/SurveyRecordsLink";
import { formatEstimatedSpending } from "@/lib/services/dashboard-math";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";

function highest(items: DistributionItem[]): DistributionItem | null {
  return items.reduce<DistributionItem | null>((current, item) => (
    current === null || item.value > current.value ? item : current
  ), null);
}

export function ExpenseSection({ data }: { data: DashboardViewModel }) {
  const topRange = highest(data.expense.spendingRanges);
  const topCategory = highest(data.expense.expenseCategories);
  const spendingRangeResponseCount = data.expense.spendingRangeResponseCount;

  return (
    <section aria-labelledby="expense-heading" className="space-y-5">
      <AnalyticsSectionHeader
        actions={<><SurveyRecordsLink data={data} /><ExportCsvButton /></>}
        description="สำรวจรูปแบบการใช้จ่ายที่ผู้ตอบเลือกด้วยตนเอง เพื่อประกอบการวางแผนเศรษฐกิจท้องถิ่น"
        headingId="expense-heading"
        title="ค่าใช้จ่ายโดยประมาณ"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard metric={{ key: "expense_estimate", label: "ช่วงค่าใช้จ่ายรวมโดยประมาณ", value: formatEstimatedSpending(data.expense.estimatedMin, data.expense.estimatedMax, data.expense.hasOpenEndedRange), rawValue: data.expense.estimatedMin, valueType: "currency_range", definition: "ผลรวมค่าต่ำสุดและสูงสุดจากช่วงค่าใช้จ่ายที่ผู้ตอบเลือก", note: `จากคำตอบช่วงค่าใช้จ่าย ${spendingRangeResponseCount.toLocaleString("th-TH")} รายการ` }} sampleCount={spendingRangeResponseCount} sampleLabel="คำตอบช่วงค่าใช้จ่าย" />
        <KpiCard metric={{ key: "expense_min", label: "ค่าประมาณต่ำสุด", value: data.expense.estimatedMin === null ? "ยังไม่มีข้อมูล" : `${data.expense.estimatedMin.toLocaleString("th-TH")} บาท`, rawValue: data.expense.estimatedMin, valueType: "currency_range", definition: "ผลรวมค่าต่ำสุดของช่วงค่าใช้จ่ายที่เลือก" }} sampleCount={spendingRangeResponseCount} sampleLabel="คำตอบช่วงค่าใช้จ่าย" />
        <KpiCard metric={{ key: "expense_max", label: "ค่าประมาณสูงสุด", value: data.expense.estimatedMax === null ? (data.expense.hasOpenEndedRange ? "ไม่กำหนดเพดาน" : "ยังไม่มีข้อมูล") : `${data.expense.estimatedMax.toLocaleString("th-TH")} บาท`, rawValue: data.expense.estimatedMax, valueType: "currency_range", definition: "ผลรวมค่าสูงสุดของช่วงค่าใช้จ่าย ช่วงปลายเปิดจะไม่ถูกกำหนดเพดานเทียม" }} sampleCount={spendingRangeResponseCount} sampleLabel="คำตอบช่วงค่าใช้จ่าย" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div aria-label="หลักฐานค่าใช้จ่ายโดยประมาณ" className="min-w-0 xl:col-span-8" role="region">
          <BarChartCard data={data.expense.spendingRanges} definition="การกระจายช่วงค่าใช้จ่ายที่ผู้ตอบเลือกด้วยตนเอง ไม่ใช่ยอดธุรกรรมจริง" emptyDescription="ยังไม่มีคำตอบช่วงค่าใช้จ่ายสำหรับตัวกรองที่เลือก" title="ช่วงค่าใช้จ่ายที่รายงาน" sampleCount={spendingRangeResponseCount} sampleLabel="คำตอบช่วงค่าใช้จ่าย" />
        </div>

        <aside aria-label="การตีความค่าใช้จ่าย" className="min-w-0 rounded-md border border-slate-200 bg-white p-4 xl:col-span-4" role="region">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#FFF0EA] text-[#B94727]"><TrendUp aria-hidden="true" size={20} weight="bold" /></span>
            <div>
              <h3 className="font-bold text-slate-900">อ่านข้อมูลอย่างระมัดระวัง</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">ข้อมูลเป็นค่าประมาณแบบช่วงจากผู้ตอบแบบสำรวจ ไม่ใช่รายได้ที่ตรวจสอบแล้ว</p>
            </div>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
            <div className="grid grid-cols-[32px_1fr] gap-3 py-3">
              <Receipt aria-hidden="true" className="mt-0.5 text-[#B94727]" size={20} />
              <div><dt className="text-xs font-semibold text-slate-600">ช่วงที่มีคำตอบมากที่สุด</dt><dd className="mt-1 font-bold text-slate-900">{topRange?.label ?? "ยังไม่มีข้อมูล"}</dd></div>
            </div>
            <div className="grid grid-cols-[32px_1fr] gap-3 py-3">
              <CurrencyCircleDollar aria-hidden="true" className="mt-0.5 text-[#0A6B62]" size={20} />
              <div><dt className="text-xs font-semibold text-slate-600">หมวดที่ถูกเลือกมากที่สุด</dt><dd className="mt-1 font-bold text-slate-900">{topCategory?.label ?? "ยังไม่มีข้อมูล"}</dd></div>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600">
            <Info aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" size={16} weight="fill" />
            <p>{data.expense.methodologyNote || "ไม่รวมช่องที่ไม่ตอบ และไม่สร้างเพดานเทียมให้ช่วงปลายเปิด"}</p>
          </div>
        </aside>
      </div>

      <ExpenseDetailTable
        estimatedMax={data.expense.estimatedMax}
        estimatedMin={data.expense.estimatedMin}
        expenseCategories={data.expense.expenseCategories}
        expenseCategoryResponseCount={data.expense.expenseCategoryResponseCount}
        spendingRangeResponseCount={spendingRangeResponseCount}
        spendingRanges={data.expense.spendingRanges}
      />
    </section>
  );
}

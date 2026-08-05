import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import type { DistributionItem } from "@/types/dashboard";

function formatNumber(value: number): string {
  return value.toLocaleString("th-TH");
}

function formatPercent(value: number | null): string {
  return value === null ? "ยังคำนวณไม่ได้" : `${(value * 100).toFixed(1)}%`;
}

type ExpenseDetailTableProps = {
  spendingRanges: DistributionItem[];
  expenseCategories: DistributionItem[];
  estimatedMin: number | null;
  estimatedMax: number | null;
  responseCount: number;
};

function DistributionTable({
  ariaLabel,
  firstColumn,
  items,
  color,
}: {
  ariaLabel: string;
  firstColumn: string;
  items: DistributionItem[];
  color: "orange" | "teal";
}) {
  const visible = items.slice(0, 10);
  const max = Math.max(...visible.map((item) => item.value), 0);
  const barColor = color === "orange" ? "bg-[#B94727]" : "bg-[#0A6B62]";

  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table aria-label={ariaLabel} className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600">
              <th className="px-4 py-3">{firstColumn}</th>
              <th className="px-4 py-3 text-right">จำนวนคำตอบ</th>
              <th className="px-4 py-3 text-right">สัดส่วน</th>
              <th className="w-36 px-4 py-3">เทียบรายการสูงสุด</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-600" colSpan={4}>ยังไม่มีข้อมูลสำหรับตัวกรองที่เลือก</td>
              </tr>
            ) : visible.map((item) => {
              const width = max > 0 ? Math.min((item.value / max) * 100, 100) : 0;
              return (
                <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50" key={item.label}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{localizeDashboardLabel(item.label)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">{formatNumber(item.value)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatPercent(item.percent)}</td>
                  <td className="px-4 py-3">
                    <div aria-label={`${localizeDashboardLabel(item.label)} ${formatNumber(item.value)} คำตอบ`} className="h-2 overflow-hidden rounded-sm bg-slate-100" role="img">
                      <div className={`h-full rounded-sm ${barColor}`} style={{ width: `${width}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length > 10 ? <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-600">ยังมีอีก {formatNumber(items.length - 10)} รายการในชุดข้อมูล</p> : null}
    </div>
  );
}

export function ExpenseDetailTable({
  spendingRanges,
  expenseCategories,
  estimatedMin,
  estimatedMax,
  responseCount,
}: ExpenseDetailTableProps) {
  const estimate = estimatedMin === null
    ? "ยังไม่มีข้อมูล"
    : estimatedMax === null
      ? `${formatNumber(estimatedMin)} บาทขึ้นไป`
      : `${formatNumber(estimatedMin)} ถึง ${formatNumber(estimatedMax)} บาท`;

  return (
    <section aria-labelledby="expense-detail-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900" id="expense-detail-heading">ตารางตรวจสอบข้อมูลค่าใช้จ่าย</h3>
          <p className="mt-1 text-sm text-slate-600">ข้อมูล {responseCount.toLocaleString("th-TH")} คำตอบ ช่วงรวมโดยประมาณ {estimate}</p>
        </div>
        <p className="text-xs text-slate-500">ตารางแสดงข้อมูลสรุป ไม่มีข้อมูลระบุตัวบุคคล</p>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <DistributionTable ariaLabel="รายละเอียดช่วงค่าใช้จ่าย" color="orange" firstColumn="ช่วงค่าใช้จ่าย" items={spendingRanges} />
        <DistributionTable ariaLabel="รายละเอียดหมวดค่าใช้จ่าย" color="teal" firstColumn="หมวดค่าใช้จ่าย" items={expenseCategories} />
      </div>
    </section>
  );
}

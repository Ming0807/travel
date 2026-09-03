import { CaretDown, ChartBar, Info, LockKey, Warning } from "@phosphor-icons/react/dist/ssr";

import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";

type PeerComparison = AttractionAnalyticsViewModel["peerComparison"];
type PeerSummary = NonNullable<PeerComparison["selected"]>;
type PrivacyValue = PeerSummary["overallSatisfaction"];

function formatDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatNumber(value: number | null, suffix = "") {
  if (value === null) return "ยังไม่มีข้อมูล";
  return `${value.toLocaleString("th-TH", { maximumFractionDigits: 1 })}${suffix}`;
}

function formatPrivateValue(metric: PrivacyValue, suffix = "") {
  if (metric.suppressed) return `ปกปิด (n=${metric.sampleSize.toLocaleString("th-TH")})`;
  if (metric.value === null) return "ยังไม่มีข้อมูล";
  return `${metric.value.toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}${suffix}`;
}

function formatPrivateLabel(metric: PeerSummary["topExpenseRange"]) {
  if (metric.suppressed) return `ปกปิด (n=${metric.sampleSize.toLocaleString("th-TH")})`;
  return metric.label ?? "ยังไม่มีข้อมูล";
}

function MetricCell({ children, selected }: { children: React.ReactNode; selected: boolean }) {
  return (
    <td className={`min-w-36 px-4 py-3 text-right font-bold tabular-nums ${selected ? "bg-orange-50/70 text-orange-950" : "text-slate-700"}`}>
      {children}
    </td>
  );
}

function ComparisonTable({ summaries }: { summaries: PeerSummary[] }) {
  const dimensions = summaries[0]?.satisfaction ?? [];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm" aria-label="ข้อมูลเปรียบเทียบสถานที่">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-600">
              <th scope="col" className="sticky left-0 z-10 min-w-52 bg-slate-50 px-5 py-3 font-bold">ตัวชี้วัดหลัก</th>
              {summaries.map((summary, index) => (
                <th key={summary.attractionId} scope="col" className={`min-w-36 px-4 py-3 text-right ${index === 0 ? "bg-orange-100/80 text-[#9A3412]" : ""}`}>
                  <span className="block font-black text-slate-950">{summary.nameTh}</span>
                  <span className="mt-0.5 block font-medium">{index === 0 ? "สถานที่นี้" : "สถานที่เทียบ"}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">รายการเข้าชม</th>
              {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{summary.visits.toLocaleString("th-TH")}</MetricCell>)}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">Coverage แบบสำรวจ</th>
              {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatNumber(summary.surveyCoverage, "%")} <span className="block text-xs font-medium text-slate-500">n={summary.surveyResponses.toLocaleString("th-TH")}</span></MetricCell>)}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">ความพึงพอใจภาพรวม</th>
              {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatPrivateValue(summary.overallSatisfaction, " / 5")}</MetricCell>)}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">สร้างใบประกาศสำเร็จ</th>
              {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatNumber(summary.certificateCompletion, "%")}</MetricCell>)}
            </tr>
          </tbody>
        </table>
      </div>

      <details className="group border-t border-slate-200">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-black text-slate-800 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500">
          ดูมิติประสบการณ์ Flow และค่าใช้จ่ายเพิ่มเติม
          <CaretDown className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full min-w-[760px] border-collapse text-sm" aria-label="รายละเอียดข้อมูลเปรียบเทียบสถานที่">
            <thead className="sr-only">
              <tr><th>ตัวชี้วัด</th>{summaries.map((summary) => <th key={summary.attractionId}>{summary.nameTh}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dimensions.map((dimension, dimensionIndex) => (
                <tr key={dimension.key}>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">{dimension.label}</th>
                  {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatPrivateValue(summary.satisfaction[dimensionIndex] ?? { value: null, sampleSize: 0, suppressed: false }, " / 5")}</MetricCell>)}
                </tr>
              ))}
              {[
                ["อัปโหลดรูปสำเร็จ", "photoCompletion"],
                ["ได้รับตราประทับ", "stampCompletion"],
                ["ตอบแบบสำรวจท่องเที่ยว", "surveyCompletion"],
                ["ส่งแบบประเมินงานวิจัย", "researchCompletion"],
              ].map(([label, key]) => (
                <tr key={key}>
                  <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">{label}</th>
                  {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatNumber(summary[key as keyof Pick<PeerSummary, "photoCompletion" | "stampCompletion" | "surveyCompletion" | "researchCompletion">] as number | null, "%")}</MetricCell>)}
                </tr>
              ))}
              <tr>
                <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">ตั้งใจกลับมา</th>
                {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatPrivateValue(summary.revisitRate, "%")}</MetricCell>)}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">ตั้งใจแนะนำ</th>
                {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatPrivateValue(summary.recommendRate, "%")}</MetricCell>)}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">ช่วงค่าใช้จ่ายหลัก</th>
                {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatPrivateLabel(summary.topExpenseRange)}</MetricCell>)}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 bg-white px-5 py-3 text-left font-medium text-slate-600">หมวดค่าใช้จ่ายหลัก</th>
                {summaries.map((summary, index) => <MetricCell key={summary.attractionId} selected={index === 0}>{formatPrivateLabel(summary.topExpenseCategory)}</MetricCell>)}
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}

export function AttractionPeerComparison({
  comparison,
  attractionTypeName,
}: {
  comparison: PeerComparison;
  attractionTypeName: string | null;
}) {
  const dateRange = `${formatDate(comparison.dateFrom)} - ${formatDate(comparison.dateTo)}`;
  const summaries = comparison.selected ? [comparison.selected, ...comparison.peers] : [];

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white" aria-labelledby="peer-comparison-heading">
      <div className="grid gap-4 border-b border-slate-200 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-[#B94727]">
            <ChartBar size={20} weight="fill" aria-hidden="true" />
            <h2 id="peer-comparison-heading" className="text-lg font-black text-slate-950">เปรียบเทียบกลุ่มสถานที่ที่เข้าเกณฑ์</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">ใช้บริบทเดียวกันเพื่อช่วยตั้งคำถามเชิงบริหาร ไม่ใช่การจัดอันดับคุณภาพหรือยืนยันเหตุและผล</p>
        </div>
        {comparison.selectedRank !== null && comparison.rankDenominator > 0 ? (
          <p className="w-fit rounded-full bg-[#202020] px-3 py-1.5 text-sm font-black tabular-nums text-white">อันดับ {comparison.selectedRank.toLocaleString("th-TH")} จาก {comparison.rankDenominator.toLocaleString("th-TH")} สถานที่</p>
        ) : null}
      </div>

      <dl className="grid border-b border-slate-200 bg-slate-50 text-sm sm:grid-cols-3">
        <div className="border-b border-slate-200 px-5 py-3 sm:border-b-0 sm:border-r"><dt className="text-xs font-bold text-slate-500">ประเภทหลัก</dt><dd className="mt-1 font-black text-slate-900">{attractionTypeName ?? "ยังไม่ระบุ"}</dd></div>
        <div className="border-b border-slate-200 px-5 py-3 sm:border-b-0 sm:border-r"><dt className="text-xs font-bold text-slate-500">ช่วงข้อมูลเดียวกัน</dt><dd className="mt-1 font-black tabular-nums text-slate-900">{dateRange}</dd></div>
        <div className="px-5 py-3"><dt className="text-xs font-bold text-slate-500">เพื่อนเทียบที่เข้าเกณฑ์</dt><dd className="mt-1 font-black tabular-nums text-slate-900">{comparison.eligiblePeerCount.toLocaleString("th-TH")} สถานที่</dd></div>
      </dl>

      {comparison.status === "unavailable" ? (
        <div className="flex items-start gap-3 px-5 py-6 text-sm">
          <Warning className="mt-0.5 shrink-0 text-amber-700" size={22} weight="fill" aria-hidden="true" />
          <div><h3 className="font-black text-slate-950">ยังเปรียบเทียบไม่ได้</h3><p className="mt-1 leading-6 text-slate-600">{comparison.unavailableReason ?? "ชุดข้อมูลนี้ยังไม่พร้อมสำหรับการเปรียบเทียบ"}</p></div>
        </div>
      ) : summaries.length > 0 ? (
        <>
          {comparison.status === "insufficient_peers" ? (
            <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
              <Warning className="mt-0.5 shrink-0" weight="fill" aria-hidden="true" />
              <p><strong>ฐานเพื่อนเทียบยังน้อย:</strong> แสดงข้อมูลที่เข้าเกณฑ์ได้ แต่ยังไม่ควรใช้สรุปค่ากลางหรือเปรียบเทียบภาพรวมของกลุ่ม</p>
            </div>
          ) : null}
          <ComparisonTable summaries={summaries} />
        </>
      ) : (
        <div className="px-5 py-6 text-sm text-slate-600">ยังไม่มีข้อมูลของสถานที่ที่เลือกในช่วงเวลานี้</div>
      )}

      <div className="grid gap-3 border-t border-slate-200 bg-[#FCFAF7] px-5 py-4 text-xs leading-5 text-slate-600 lg:grid-cols-2">
        <p className="flex items-start gap-2"><Info className="mt-0.5 shrink-0 text-[#B94727]" size={16} aria-hidden="true" /><span>{comparison.eligibilityNote}</span></p>
        <p className="flex items-start gap-2"><LockKey className="mt-0.5 shrink-0 text-emerald-700" size={16} aria-hidden="true" /><span>ค่าจากแบบสำรวจที่มี n ต่ำกว่า 10 ถูกปกปิด และข้อมูลค่าใช้จ่ายเป็นข้อมูลที่ผู้ตอบรายงานเอง ไม่ใช่รายได้ธุรกิจ</span></p>
      </div>
    </section>
  );
}

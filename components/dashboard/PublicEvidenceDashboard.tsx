import {
  CalendarBlank,
  ChartBar,
  CheckCircle,
  Database,
  Info,
  MapPin,
  ShieldCheck,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type {
  PublicDashboardEvidence,
  PublicEvidenceDistributionGroup,
} from "@/types/public-dashboard";

function formatThaiDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("th-TH-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function formatDataAsOf(value: string) {
  const date = new Date(value);
  const dateLabel = new Intl.DateTimeFormat("th-TH-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("th-TH-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  }).format(date);
  return `ข้อมูล ณ ${dateLabel} เวลา ${timeLabel} น.`;
}

function SampleNote({ status, sampleSize, minimum }: {
  status: string;
  sampleSize: number | null;
  minimum: number;
}) {
  if (status === "suppressed") return <span>ปกปิดจำนวนต่ำกว่า 5</span>;
  if (status === "small_sample") {
    return <span>{sampleSize === null ? `ตัวอย่างต่ำกว่า ${minimum}` : `ฐาน n=${sampleSize} / ขั้นต่ำ ${minimum}`}</span>;
  }
  if (sampleSize !== null) return <span>ฐาน n={sampleSize}</span>;
  return <span>ยังไม่มีฐานข้อมูล</span>;
}

function DistributionTable({ group }: { group: PublicEvidenceDistributionGroup }) {
  const maxValue = Math.max(1, ...group.items.map((item) => item.value ?? 0));

  return (
    <article className="min-w-0 border-t border-ink/10 pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-black text-ink">{group.label}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">{group.definition}</p>
        </div>
        <p className="shrink-0 text-xs font-bold text-teal">แหล่งข้อมูล: {group.source}</p>
      </div>

      <div className="mt-4 space-y-3" aria-hidden="true">
        {group.items.map((item) => (
          <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-ink">
                <span className="truncate">{item.label}</span>
                <span className="shrink-0 tabular-nums">{item.displayValue}</span>
              </div>
              <div className="h-2 overflow-hidden bg-ink/[0.06]">
                <div
                  className={item.status === "available" ? "h-full bg-teal" : "h-full bg-coral/60"}
                  style={{ width: item.value === null ? "12%" : `${Math.max(6, (item.value / maxValue) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm" aria-label={`ตาราง${group.label}`}>
          <thead className="border-y border-ink/10 bg-background text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 font-bold">กลุ่ม</th>
              <th className="px-3 py-2.5 text-right font-bold">จำนวน</th>
              <th className="px-3 py-2.5 text-right font-bold">สัดส่วน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {group.items.map((item) => (
              <tr key={item.label}>
                <th scope="row" className="px-3 py-3 font-bold text-ink">{item.label}</th>
                <td className="px-3 py-3 text-right tabular-nums text-ink">{item.displayValue}</td>
                <td className="px-3 py-3 text-right tabular-nums text-muted">
                  {item.percent === null ? "ไม่แสดง" : `${Math.round(item.percent * 100)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function PublicEvidenceDashboard({ evidence }: { evidence: PublicDashboardEvidence }) {
  const maxTrend = Math.max(1, ...evidence.trend.map((point) => point.value ?? 0));
  const hasProfileData = evidence.visitorProfile.length > 0;
  const hasBehaviorData = evidence.travelBehavior.length > 0;

  return (
    <main className="bg-background text-ink">
      <section className="border-b border-ink/10 bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 border border-coral/25 bg-coral/[0.06] px-3 py-2 text-xs font-black text-coral">
                <MapPin aria-hidden="true" weight="fill" /> รายงานหลักฐานสาธารณะ · จังหวัดยะลา
              </div>
              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-normal sm:text-4xl lg:text-5xl">
                ข้อมูลการท่องเที่ยวที่ระบบบันทึกได้
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                ภาพรวมจากรายการเข้าชม ใบประกาศ และแบบสำรวจที่ผู้ใช้สมัครใจตอบในระบบนำร่อง
                ใช้เพื่อมองเห็นสัญญาณเบื้องต้น ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์หรือสถิติทางการ
              </p>
            </div>

            <dl className="grid gap-3 border-l-2 border-coral bg-background p-5 text-sm">
              <div className="flex items-start gap-3">
                <CalendarBlank aria-hidden="true" className="mt-0.5 shrink-0 text-coral" size={20} />
                <div><dt className="font-black">ช่วงข้อมูล</dt><dd className="mt-1 text-muted">{formatThaiDate(evidence.scope.dateFrom)} - {formatThaiDate(evidence.scope.dateTo)}</dd></div>
              </div>
              <div className="flex items-start gap-3">
                <Database aria-hidden="true" className="mt-0.5 shrink-0 text-teal" size={20} />
                <div><dt className="font-black">แหล่งข้อมูล</dt><dd className="mt-1 text-muted">{evidence.scope.sourceLabel}</dd></div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle aria-hidden="true" className="mt-0.5 shrink-0 text-teal" size={20} />
                <div><dt className="font-black">เวลาประมวลผล</dt><dd className="mt-1 text-muted">{formatDataAsOf(evidence.scope.dataAsOf)}</dd></div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="public-kpi-heading" className="border-b border-ink/10 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-coral">Executive evidence</p>
              <h2 id="public-kpi-heading" className="mt-2 text-2xl font-black">ตัวเลขหลักที่อธิบายได้</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted">ทุกตัวเลขมีนิยาม แหล่งข้อมูล ฐานคำนวณ และข้อจำกัดกำกับ</p>
          </div>

          <dl className="mt-6 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {evidence.kpis.map((item) => (
              <div key={item.key} className="bg-white p-5">
                <dt className="text-sm font-black leading-5 text-ink">{item.label}</dt>
                <dd className="mt-4 min-h-10 text-3xl font-black tabular-nums text-ink">{item.displayValue}</dd>
                <p className="mt-2 text-xs font-bold text-coral"><SampleNote status={item.status} sampleSize={item.sampleSize} minimum={evidence.thresholds.interpretationMinimum} /></p>
                <p className="mt-4 text-xs leading-5 text-muted">{item.definition}</p>
                <p className="mt-2 text-xs font-bold text-teal">{item.source}</p>
                <p className="mt-2 border-t border-ink/10 pt-2 text-xs leading-5 text-muted">{item.limitation}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="visit-trend-heading" className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <article className="min-w-0 border border-ink/10 bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-teal">Recorded visits</p>
                  <h2 id="visit-trend-heading" className="mt-2 text-2xl font-black">แนวโน้มรายการเข้าชมที่บันทึก</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">หน่วยคือรายการ visit ที่เกิดหลังผู้ใช้กรอกข้อมูลขั้นต่ำและยินยอม ไม่ใช่ยอดเข้าหน้าเว็บ</p>
                </div>
                <TrendUp aria-hidden="true" size={28} className="shrink-0 text-coral" />
              </div>

              {evidence.trend.length > 0 ? (
                <>
                  <div className="mt-7 flex h-52 items-end gap-2 border-b border-l border-ink/15 px-3 pt-4" aria-hidden="true">
                    {evidence.trend.map((point) => (
                      <div key={point.isoDate} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2 self-stretch">
                        <span className="text-xs font-black tabular-nums text-ink">{point.displayValue}</span>
                        <div
                          className={point.status === "available" ? "w-full max-w-10 bg-teal" : "w-full max-w-10 bg-coral/45"}
                          style={{ height: point.value === null ? "10%" : `${Math.max(10, (point.value / maxTrend) * 82)}%` }}
                        />
                        <span className="w-full truncate text-center text-[11px] font-bold text-muted">{point.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse text-left text-sm" aria-label="แนวโน้มรายการเข้าชมที่บันทึก">
                      <thead className="border-y border-ink/10 bg-background text-xs text-muted"><tr><th className="px-3 py-2.5 font-bold">วันที่</th><th className="px-3 py-2.5 text-right font-bold">รายการเข้าชม</th><th className="px-3 py-2.5 text-right font-bold">สถานะข้อมูล</th></tr></thead>
                      <tbody className="divide-y divide-ink/10">
                        {evidence.trend.map((point) => (
                          <tr key={point.isoDate}><th scope="row" className="px-3 py-3 font-bold">{point.label}</th><td className="px-3 py-3 text-right tabular-nums">{point.displayValue}</td><td className="px-3 py-3 text-right text-muted">{point.status === "suppressed" ? "ปกปิด cell เล็ก" : point.status === "no_data" ? "ไม่มีรายการ" : "แสดงได้"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="mt-7 border border-dashed border-ink/20 bg-background px-5 py-12 text-center">
                  <ChartBar aria-hidden="true" size={30} className="mx-auto text-ink/35" />
                  <p className="mt-3 font-black">ยังไม่มีรายการเข้าชมในช่วงข้อมูลนี้</p>
                  <p className="mt-2 text-sm text-muted">ระบบจะเริ่มแสดงแนวโน้มเมื่อมี visit ที่บันทึกสำเร็จ</p>
                </div>
              )}
            </article>

            <aside className="min-w-0 border border-ink/10 bg-ink p-6 text-white">
              <ShieldCheck aria-hidden="true" size={30} className="text-coral" weight="duotone" />
              <h2 className="mt-5 text-xl font-black">เกณฑ์ก่อนเผยแพร่และแปลผล</h2>
              <dl className="mt-6 divide-y divide-white/15 border-y border-white/15">
                <div className="py-4"><dt className="text-xs font-bold text-white/55">การปกปิดกลุ่มย่อย</dt><dd className="mt-1 text-2xl font-black">น้อยกว่า {evidence.thresholds.publicCellMinimum}</dd></div>
                <div className="py-4"><dt className="text-xs font-bold text-white/55">ขั้นต่ำก่อนตีความคะแนน</dt><dd className="mt-1 text-2xl font-black">n ≥ {evidence.thresholds.interpretationMinimum}</dd></div>
              </dl>
              <p className="mt-5 text-sm leading-6 text-white/65">เวลา “ข้อมูล ณ” คือเวลาที่หน้าอ่านและประมวลผลฐานข้อมูล ไม่ใช่วันที่เกิดเหตุการณ์ล่าสุด</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-coral">Visitor profile</p>
            <h2 className="mt-2 text-2xl font-black">ภาพรวมผู้เข้าร่วม</h2>
            <div className="mt-6 space-y-7">
              {hasProfileData ? evidence.visitorProfile.map((group) => <DistributionTable key={group.key} group={group} />) : <p className="border border-dashed border-ink/20 bg-background p-6 text-sm text-muted">ยังไม่มีข้อมูลโปรไฟล์ที่ผ่านเกณฑ์เผยแพร่</p>}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-teal">Travel behavior</p>
            <h2 className="mt-2 text-2xl font-black">พฤติกรรมการเดินทาง</h2>
            <div className="mt-6 space-y-7">
              {hasBehaviorData ? evidence.travelBehavior.map((group) => <DistributionTable key={group.key} group={group} />) : <p className="border border-dashed border-ink/20 bg-background p-6 text-sm text-muted">ยังไม่มีคำตอบแบบสำรวจที่ผ่านเกณฑ์เผยแพร่</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            <article className="min-w-0">
              <p className="text-xs font-black uppercase text-coral">Attraction evidence</p>
              <h2 className="mt-2 text-2xl font-black">สถานที่ที่มีรายการเข้าชมในระบบ</h2>
              <p className="mt-2 text-sm leading-6 text-muted">แสดงเฉพาะสถานที่ที่มีอย่างน้อย {evidence.thresholds.publicCellMinimum} รายการ และคะแนนจะแสดงเมื่อมีคำตอบอย่างน้อย {evidence.thresholds.interpretationMinimum}</p>
              {evidence.topAttractions.length > 0 ? (
                <div className="mt-6 overflow-x-auto border border-ink/10 bg-white">
                  <table className="w-full min-w-[680px] border-collapse text-left text-sm" aria-label="สถานที่ที่มีรายการเข้าชมในระบบ">
                    <thead className="border-b border-ink/10 bg-ink text-xs text-white"><tr><th className="px-4 py-3 font-bold">สถานที่</th><th className="px-4 py-3 text-right font-bold">รายการเข้าชม</th><th className="px-4 py-3 text-right font-bold">ใบประกาศ</th><th className="px-4 py-3 text-right font-bold">ความพึงพอใจ</th></tr></thead>
                    <tbody className="divide-y divide-ink/10">
                      {evidence.topAttractions.map((row) => (
                        <tr key={row.label}><th scope="row" className="px-4 py-4 font-black">{row.label}</th><td className="px-4 py-4 text-right tabular-nums">{row.visitDisplayValue}</td><td className="px-4 py-4 text-right tabular-nums">{row.certificateDisplayValue}</td><td className="px-4 py-4 text-right"><span className="font-black tabular-nums">{row.satisfactionDisplayValue}</span>{row.satisfactionSampleSize !== null ? <span className="ml-2 text-xs text-muted">n={row.satisfactionSampleSize}</span> : null}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="mt-6 border border-dashed border-ink/20 bg-white p-6 text-sm text-muted">ยังไม่มีสถานที่ที่ผ่านเกณฑ์เผยแพร่ในช่วงข้อมูลนี้</p>}
            </article>

            <article className="min-w-0 border border-ink/10 bg-white p-6">
              <p className="text-xs font-black uppercase text-teal">Experience quality</p>
              <h2 className="mt-2 text-2xl font-black">คุณภาพประสบการณ์</h2>
              <p className="mt-2 text-sm leading-6 text-muted">คะแนน 1-5 จากแบบสำรวจโดยสมัครใจ Missing data ไม่ถูกนับเป็นศูนย์</p>
              <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {evidence.satisfaction.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="font-bold">{item.label}</dt>
                    <dd className="text-right"><span className="font-black tabular-nums">{item.displayValue}</span><span className="block text-xs text-muted"><SampleNote status={item.status} sampleSize={item.sampleSize} minimum={evidence.thresholds.interpretationMinimum} /></span></dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-3">
            <Info aria-hidden="true" size={26} className="mt-0.5 shrink-0 text-coral" />
            <div><p className="text-xs font-black uppercase text-coral">Decision support</p><h2 className="mt-2 text-2xl font-black">สัญญาณสำหรับการวางแผน</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">เป็นข้อสังเกตเชิงปฏิบัติการจากเกณฑ์ที่ประกาศไว้ ไม่ใช่ข้อสรุปเชิงเหตุและผล</p></div>
          </div>
          {evidence.opportunities.length > 0 ? (
            <div className="mt-7 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2">
              {evidence.opportunities.map((item) => (
                <article key={`${item.kind}-${item.title}`} className="bg-background p-6">
                  <p className={`text-xs font-black uppercase ${item.kind === "improvement" ? "text-coral" : "text-teal"}`}>{item.confidenceLabel}</p>
                  <h3 className="mt-2 text-lg font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink">{item.finding}</p>
                  <p className="mt-4 border-l-2 border-ink/20 pl-3 text-sm font-bold leading-6 text-muted">{item.evidence}</p>
                  <p className="mt-4 text-sm leading-6 text-muted"><strong className="text-ink">แนวทางถัดไป:</strong> {item.suggestedAction}</p>
                </article>
              ))}
            </div>
          ) : <p className="mt-7 border border-dashed border-ink/20 bg-background p-6 text-sm text-muted">ยังไม่มีหลักฐานมากพอสำหรับสร้างสัญญาณการปรับปรุงหรือประชาสัมพันธ์</p>}
        </div>
      </section>

      <section aria-labelledby="limitations-heading" className="bg-ink px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div><WarningCircle aria-hidden="true" size={30} className="text-coral" /><h2 id="limitations-heading" className="mt-4 text-2xl font-black">ข้อจำกัดที่ต้องอ่านก่อนใช้ข้อมูล</h2><p className="mt-3 text-sm leading-6 text-white/60">รายงานที่น่าเชื่อถือควรบอกสิ่งที่ข้อมูลยังตอบไม่ได้ด้วย</p></div>
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {evidence.limitations.map((item) => <li key={item} className="flex gap-3 py-4 text-sm leading-6 text-white/75"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-coral" />{item}</li>)}
          </ul>
        </div>
      </section>
    </main>
  );
}

import {
  CheckCircle,
  Clock,
  Database,
  Info,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

import type { DashboardQuality } from "@/types/dashboard";

const GRADE = {
  unavailable: { label: "ยังประเมินไม่ได้", className: "bg-slate-100 text-slate-700", icon: Info },
  insufficient: { label: "หลักฐานไม่เพียงพอ", className: "bg-rose-50 text-rose-800", icon: WarningCircle },
  limited: { label: "หลักฐานจำกัด", className: "bg-amber-50 text-amber-900", icon: WarningCircle },
  usable: { label: "หลักฐานพอใช้", className: "bg-sky-50 text-sky-900", icon: Info },
  strong: { label: "หลักฐานแข็งแรง", className: "bg-emerald-50 text-emerald-900", icon: CheckCircle },
} as const;

function percent(value: number | null) {
  return value === null ? "ไม่ใช้กับมิตินี้" : `${(value * 100).toFixed(1)}%`;
}

export function DashboardQualityCenter({ quality }: { quality: DashboardQuality }) {
  const grade = GRADE[quality.evidenceGrade];
  const GradeIcon = grade.icon;
  const statusClass = quality.status === "blocked"
    ? "border-rose-200 bg-rose-50/40"
    : quality.status === "caution"
      ? "border-amber-200 bg-amber-50/35"
      : "border-emerald-200 bg-emerald-50/25";

  return (
    <section aria-label="คุณภาพและความเชื่อมั่นของข้อมูล" className={`overflow-hidden rounded-md border ${statusClass}`}>
      <div className="grid bg-white md:grid-cols-2 xl:grid-cols-6">
        <QualityItem icon={<ShieldCheck aria-hidden="true" size={17} weight="fill" />} label="ขอบเขตหลักฐาน" value={quality.scope.label} wide />
        <QualityItem icon={<Database aria-hidden="true" size={17} weight="fill" />} label="ฐานข้อมูล" value={quality.sampleSize.toLocaleString("th-TH")} />
        <QualityItem
          icon={<CheckCircle aria-hidden="true" size={17} weight="fill" />}
          label="Coverage"
          value={quality.coverage ? `${quality.coverage.answeredCount.toLocaleString("th-TH")} / ${quality.coverage.denominatorCount.toLocaleString("th-TH")} · ${percent(quality.coverage.rate)}` : "ไม่ใช้กับมิตินี้"}
        />
        <QualityItem icon={<WarningCircle aria-hidden="true" size={17} weight="fill" />} label="Missing" value={quality.coverage ? `${quality.coverage.missingCount.toLocaleString("th-TH")} (${percent(quality.coverage.missingRate)})` : "ไม่ใช้กับมิตินี้"} />
        <QualityItem icon={<Clock aria-hidden="true" size={17} weight="fill" />} label="ความสด" value={quality.freshness.label} />
      </div>

      <div className="flex flex-col gap-2 border-t border-inherit px-3 py-2.5 sm:flex-row sm:items-center">
        <span className={`inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs font-bold ${grade.className}`}>
          <GradeIcon aria-hidden="true" size={14} weight="fill" /> {grade.label}
        </span>
        <p className="text-xs leading-5 text-slate-700">
          {quality.truncated ? "ข้อมูลถูกตัด: ระงับข้อสรุปและการส่งออก" : `ปกปิด ${quality.suppressedCellCount.toLocaleString("th-TH")} เซลล์ · ${quality.claimsAllowed ? "ใช้สรุปเชิงพรรณนาได้ตามขอบเขต" : "ยังไม่ควรใช้สรุปผล"}`}
        </p>
        <details className="group sm:ml-auto">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-[4px] px-2 text-xs font-bold text-slate-700 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D94717]">
            <Info aria-hidden="true" size={15} /> รายละเอียดและที่มาของข้อมูล
          </summary>
          <div className="mt-2 grid gap-4 border-t border-inherit bg-white p-4 text-xs leading-5 text-slate-700 lg:grid-cols-3">
            <div><p className="font-black text-slate-950">แหล่งและเวอร์ชัน</p><p className="mt-1">{quality.metadata.sourceTables.join(", ")}</p><p className="mt-1 text-slate-500">Metric version: {quality.metadata.metricVersion}</p></div>
            <div><p className="font-black text-slate-950">เวลาและฟิลด์วันที่</p><p className="mt-1">{quality.metadata.dateField}</p><p className="mt-1 text-slate-500">รีเฟรช {new Date(quality.metadata.refreshedAt).toLocaleString("th-TH")}</p></div>
            <div><p className="font-black text-slate-950">รายการที่ไม่นำมาคำนวณ</p><ul className="mt-1 space-y-1">{quality.metadata.exclusions.map((item) => <li key={item}>• {item}</li>)}</ul></div>
            {quality.blockers.length > 0 ? <div className="border-l-2 border-rose-400 pl-3 lg:col-span-3"><p className="font-black text-rose-900">เหตุผลที่ระงับ</p>{quality.blockers.map((item) => <p key={item} className="mt-1 text-rose-800">• {item}</p>)}</div> : null}
            {quality.warnings.length > 0 ? <div className="border-l-2 border-amber-400 pl-3 lg:col-span-3"><p className="font-black text-amber-950">ข้อจำกัดที่ต้องอ่านประกอบ</p>{quality.warnings.map((item) => <p key={item} className="mt-1 text-amber-900">• {item}</p>)}</div> : null}
            {quality.operationalTasks.length > 0 ? <div className="border-t border-slate-200 pt-3 lg:col-span-3"><p className="font-black text-slate-950">งานเก็บข้อมูลที่ควรทำต่อ</p><div className="mt-2 grid gap-2 md:grid-cols-2">{quality.operationalTasks.map((task) => <div className="border-l-2 border-[#D94717] pl-3" key={task.key}><p className="font-bold text-slate-900">{task.title}</p><p className="text-slate-600">{task.detail}</p></div>)}</div></div> : null}
          </div>
        </details>
      </div>
    </section>
  );
}

function QualityItem({ icon, label, value, wide = false }: { icon: React.ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 md:border-r xl:border-b-0 ${wide ? "xl:col-span-2" : ""}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-[#B94727]">{icon}</span>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-slate-500">{label}</p><p className="truncate text-xs font-black text-slate-900" title={value}>{value}</p></div>
    </div>
  );
}

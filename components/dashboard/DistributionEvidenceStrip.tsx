import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import { buildDistributionEvidence } from "@/lib/dashboard/distribution-evidence";

const STRENGTH = {
  unavailable: { label: "ยังประเมินไม่ได้", className: "bg-slate-100 text-slate-700", icon: Info },
  insufficient: { label: "หลักฐานไม่เพียงพอ", className: "bg-rose-50 text-rose-800", icon: WarningCircle },
  limited: { label: "หลักฐานจำกัด", className: "bg-amber-50 text-amber-900", icon: WarningCircle },
  usable: { label: "หลักฐานพอใช้", className: "bg-sky-50 text-sky-900", icon: Info },
  strong: { label: "หลักฐานแข็งแรง", className: "bg-emerald-50 text-emerald-900", icon: CheckCircle },
} as const;

function percent(value: number | null) {
  return value === null ? "ยังคำนวณไม่ได้" : `${(value * 100).toFixed(1)}%`;
}

export function DistributionEvidenceStrip({
  answeredCount,
  denominatorCount,
  interpretation,
}: {
  answeredCount: number;
  denominatorCount: number;
  interpretation: string;
}) {
  const evidence = buildDistributionEvidence({ answeredCount, denominatorCount });
  const config = STRENGTH[evidence.strength];
  const Icon = config.icon;

  return (
    <div className="mt-3 border-y border-slate-100 bg-slate-50/70 px-3 py-2.5 text-xs text-slate-600">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <strong className="text-slate-800">ตอบ {evidence.answeredCount.toLocaleString("th-TH")} / {evidence.denominatorCount.toLocaleString("th-TH")}</strong>
        <span>ความครอบคลุม {percent(evidence.coverage)}</span>
        <span>ขาด {evidence.missingCount.toLocaleString("th-TH")} ({percent(evidence.missingRate)})</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 px-2 py-1 font-bold ${config.className}`}>
          <Icon aria-hidden="true" size={14} weight="fill" /> {config.label}
        </span>
      </div>
      <p className="mt-2 leading-5 text-slate-700">{interpretation}</p>
    </div>
  );
}

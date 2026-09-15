"use client";

import { useState } from "react";

import type { AdminResearchActivationEvidence } from "@/lib/repositories/admin-research.repository";

type EvidenceType = AdminResearchActivationEvidence["evidenceType"];

export function ResearchEvidenceVersionFields({ evidence, labels }: {
  evidence: ReadonlyArray<Pick<AdminResearchActivationEvidence, "evidenceType" | "versionNumber">>;
  labels: Record<EvidenceType, string>;
}) {
  const [type, setType] = useState<EvidenceType>("expert_review");
  const [overrides, setOverrides] = useState<Partial<Record<EvidenceType, string>>>({});
  const nextVersion = evidence.reduce((latest, item) => item.evidenceType === type
    ? Math.max(latest, item.versionNumber) : latest, 0) + 1;
  const inputClass = "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

  return (
    <>
      <label className="min-w-0 text-sm font-bold">ประเภทหลักฐาน
        <select name="evidenceType" value={type} onChange={(event) => {
          const value = event.target.value;
          if (value === "expert_review" || value === "cognitive_pretest" || value === "mobile_flow_qa") setType(value);
        }} className={inputClass}>
          {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-sm font-bold">รุ่นหลักฐาน
        <input type="number" name="versionNumber" min="1" step="1" required
          value={overrides[type] ?? String(nextVersion)}
          onChange={(event) => setOverrides({ ...overrides, [type]: event.target.value })}
          className={inputClass} />
      </label>
    </>
  );
}

import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DistributionItem } from "@/types/dashboard";

export type DistributionEvidenceStrength = "unavailable" | "insufficient" | "limited" | "usable" | "strong";

export type DistributionEvidence = {
  answeredCount: number;
  denominatorCount: number;
  coverage: number | null;
  missingCount: number;
  missingRate: number | null;
  strength: DistributionEvidenceStrength;
};

const SMALL_CELL_THRESHOLD = 10;
const STRONG_COVERAGE_THRESHOLD = 0.7;

export function buildDistributionEvidence({
  answeredCount,
  denominatorCount,
}: {
  answeredCount: number;
  denominatorCount: number;
}): DistributionEvidence {
  const safeDenominator = Math.max(0, Math.trunc(denominatorCount));
  const safeAnswered = Math.max(0, Math.min(Math.trunc(answeredCount), safeDenominator));
  const missingCount = safeDenominator - safeAnswered;
  const coverage = safeDenominator > 0 ? safeAnswered / safeDenominator : null;
  const missingRate = safeDenominator > 0 ? missingCount / safeDenominator : null;
  const strength: DistributionEvidenceStrength = safeDenominator === 0
    ? "unavailable"
    : safeAnswered < SMALL_CELL_THRESHOLD
      ? "insufficient"
      : safeAnswered < DASHBOARD_MIN_SAMPLE_SIZE
        ? "limited"
        : coverage !== null && coverage >= STRONG_COVERAGE_THRESHOLD
          ? "strong"
          : "usable";

  return {
    answeredCount: safeAnswered,
    denominatorCount: safeDenominator,
    coverage,
    missingCount,
    missingRate,
    strength,
  };
}

export function buildDistributionInterpretation(
  items: DistributionItem[],
  counts: { answeredCount: number; denominatorCount: number },
): string {
  const evidence = buildDistributionEvidence(counts);
  if (evidence.strength === "unavailable" || items.length === 0) {
    return "ยังไม่มีคำตอบสำหรับอธิบายการกระจายในขอบเขตนี้";
  }
  if (evidence.strength === "insufficient" || evidence.strength === "limited") {
    return `มีเพียง ${evidence.answeredCount.toLocaleString("th-TH")} คำตอบ จึงยังไม่ควรใช้สรุปแนวโน้มของกลุ่มทั้งหมด`;
  }

  const top = [...items].sort((left, right) => right.value - left.value)[0];
  const topShare = top.percent ?? (evidence.answeredCount > 0 ? top.value / evidence.answeredCount : null);
  return topShare === null
    ? `${top.label}มีจำนวนคำตอบสูงสุดในข้อมูลที่ระบุ`
    : `${top.label}มีสัดส่วนสูงสุด ${(topShare * 100).toFixed(1)}% ของคำตอบที่ระบุ`;
}

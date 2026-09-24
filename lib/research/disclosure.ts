export function disclosableResearchCount(count: number, base: number, threshold: number): number | null {
  if (!Number.isInteger(count) || !Number.isInteger(base) || !Number.isInteger(threshold)) return null;
  if (count < 0 || base < threshold || count > base || threshold < 1) return null;
  if (count > 0 && count < threshold) return null;
  const complement = base - count;
  if (complement > 0 && complement < threshold) return null;
  return count;
}

export function researchCountLabel(count: number, base: number, threshold: number): string {
  if (base === 0) return "ยังไม่มีข้อมูล";
  const visible = disclosableResearchCount(count, base, threshold);
  return visible === null ? "ปกปิด" : visible.toLocaleString("th-TH");
}

export function researchRateLabel(count: number, base: number, threshold: number): string {
  if (base === 0) return "ยังไม่มีข้อมูล";
  const visible = disclosableResearchCount(count, base, threshold);
  return visible === null ? "ปกปิด" : `${((visible / base) * 100).toLocaleString("th-TH", { maximumFractionDigits: 1 })} %`;
}

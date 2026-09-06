import type { DashboardVisitChannels } from "@/types/dashboard";

export function buildDashboardVisitChannels(
  visits: Record<string, unknown>[], enabled: boolean, incomplete: boolean,
): DashboardVisitChannels {
  if (!enabled) return { status: "disabled", denominator: null, distribution: [] };
  if (incomplete) return { status: "incomplete", denominator: null, distribution: [] };
  const unique = new Map(visits.filter((row) => typeof row.visit_id === "string" && row.visit_id).map((row) => [row.visit_id, row]));
  if (!unique.size) return { status: "empty", denominator: 0, distribution: [] };
  const counts = { qr: 0, nfc: 0, unknown: 0 };
  for (const visit of unique.values()) {
    const value = visit.checkin_entry_sessions;
    const entries: unknown[] = Array.isArray(value) ? value : value ? [value] : [];
    const entry = entries.length === 1 ? entries[0] : null;
    const channel = entry && typeof entry === "object" && "entry_channel" in entry ? entry.entry_channel : null;
    counts[channel === "qr" || channel === "nfc" ? channel : "unknown"] += 1;
  }
  // Suppress complementary cells as well: the Visit total may appear elsewhere.
  if (Object.values(counts).some((count) => count > 0 && count < 10)) {
    return { status: "suppressed", denominator: null, distribution: [] };
  }
  return {
    status: "ready", denominator: unique.size,
    distribution: (["qr", "nfc", "unknown"] as const).map((key) => ({
      label: key === "qr" ? "QR Code" : key === "nfc" ? "NFC" : "ยังระบุไม่ได้",
      value: counts[key], percent: counts[key] / unique.size, note: "รายการเช็กอินตามวันที่และตัวกรองที่เลือก",
    })),
  };
}

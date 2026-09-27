import type { TrendPoint } from "@/types/dashboard";

export function buildDailyVisitTrend(visitDates: readonly string[], dateFrom: string, dateTo: string): TrendPoint[] {
  if (visitDates.length === 0) return [];

  const counts = new Map<string, number>();
  for (const rawDate of visitDates) {
    const date = rawDate.slice(0, 10);
    if (date >= dateFrom && date <= dateTo) counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  const days: TrendPoint[] = [];
  const cursor = new Date(`${dateFrom}T00:00:00.000Z`);
  const end = new Date(`${dateTo}T00:00:00.000Z`);
  for (; cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const label = cursor.toISOString().slice(0, 10);
    days.push({ label, value: counts.get(label) ?? 0 });
  }
  return days;
}

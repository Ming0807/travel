const DAY_MS = 86_400_000;

function dateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

export function previousEqualLengthPeriod(dateStart: string, dateEnd: string) {
  const start = dateValue(dateStart);
  const end = dateValue(dateEnd);
  if (start === null || end === null || end < start) return null;
  const duration = end - start + DAY_MS;
  return {
    comparisonStart: new Date(start - duration).toISOString().slice(0, 10),
    comparisonEnd: new Date(start - DAY_MS).toISOString().slice(0, 10),
  };
}

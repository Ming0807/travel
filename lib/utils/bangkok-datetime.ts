const BANGKOK_TIME_ZONE = "Asia/Bangkok";
const BANGKOK_OFFSET = "+07:00";
const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;

export function bangkokDateRangeBounds(dateFrom: string, dateTo: string) {
  for (const value of [dateFrom, dateTo]) {
    const date = new Date(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime())
      || date.toISOString().slice(0, 10) !== value) throw new Error("INVALID_DATE_RANGE");
  }
  if (dateFrom > dateTo) throw new Error("INVALID_DATE_RANGE");
  const nextDay = new Date(`${dateTo}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  if (nextDay.getUTCFullYear() > 9999) throw new Error("INVALID_DATE_RANGE");
  return {
    fromInclusive: `${dateFrom}T00:00:00${BANGKOK_OFFSET}`,
    toExclusive: `${nextDay.toISOString().slice(0, 10)}T00:00:00${BANGKOK_OFFSET}`,
  };
}

export function bangkokDateTimeInputToIso(value: string) {
  const normalized = value.trim();
  const instant = LOCAL_DATE_TIME_PATTERN.test(normalized)
    ? new Date(`${normalized}${BANGKOK_OFFSET}`)
    : new Date(normalized);

  return instant.toISOString();
}

export function isoToBangkokDateTimeInput(value?: string | null) {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

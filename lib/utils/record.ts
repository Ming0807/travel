export type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

export function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function nullableBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

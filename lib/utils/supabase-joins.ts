export type SupabaseJoin<T> = T | T[] | null | undefined;

export function firstJoin<T>(value: SupabaseJoin<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

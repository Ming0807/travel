export const TRIP_SHORTLIST_KEY = "southern-border-trip-shortlist";
export const RESTAURANT_SHORTLIST_KEY = "southern-border-restaurant-shortlist";
export const TRIP_SHORTLIST_LIMIT = 20;

type StoredTripShortlist = {
  version: 1;
  slugs: string[];
};

function normalizeSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((slug): slug is string => typeof slug === "string")
        .map((slug) => slug.trim())
        .filter(Boolean),
    ),
  ).slice(0, TRIP_SHORTLIST_LIMIT);
}

export function parseTripShortlist(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Partial<StoredTripShortlist>;
    if (parsed.version !== 1) return [];
    return normalizeSlugs(parsed.slugs);
  } catch {
    return [];
  }
}

export function serializeTripShortlist(slugs: string[]): string {
  return JSON.stringify({ version: 1, slugs: normalizeSlugs(slugs) } satisfies StoredTripShortlist);
}

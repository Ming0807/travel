import {
  RELATED_CONTENT_MODES,
  RELATED_CONTENT_TYPES,
  type RelatedContentMode,
  type RelatedContentType,
} from "@/lib/content/attraction-related-content";

export type AttractionRelatedContentSetting = {
  contentType: RelatedContentType;
  mode: RelatedContentMode;
  maxItems: number;
};

export type AttractionRelatedContentSettings = Record<
  RelatedContentType,
  AttractionRelatedContentSetting
>;

export type RelatedContentRelationCounts = Record<RelatedContentType, number>;

type PersistedSettingRow = {
  content_type?: unknown;
  mode?: unknown;
  max_items?: unknown;
};

const DEFAULT_LIMITS: Record<RelatedContentType, number> = {
  attractions: 4,
  restaurants: 4,
  accommodations: 4,
  stories: 3,
};

function isContentType(value: unknown): value is RelatedContentType {
  return typeof value === "string"
    && RELATED_CONTENT_TYPES.some((contentType) => contentType === value);
}

function isMode(value: unknown): value is RelatedContentMode {
  return typeof value === "string"
    && RELATED_CONTENT_MODES.some((mode) => mode === value);
}

function isValidMaxItems(value: unknown): value is number {
  return typeof value === "number"
    && Number.isInteger(value)
    && value >= 1
    && value <= 8;
}

function legacySetting(
  contentType: RelatedContentType,
  relationCount: number,
): AttractionRelatedContentSetting {
  return {
    contentType,
    mode: relationCount > 0 ? "manual" : "automatic",
    maxItems: DEFAULT_LIMITS[contentType],
  };
}

export function resolveRelatedContentSettings(
  rows: readonly PersistedSettingRow[],
  relationCounts: RelatedContentRelationCounts,
): AttractionRelatedContentSettings {
  const persisted = new Map<RelatedContentType, AttractionRelatedContentSetting>();

  rows.forEach((row) => {
    if (
      !isContentType(row.content_type)
      || !isMode(row.mode)
      || !isValidMaxItems(row.max_items)
    ) {
      return;
    }

    persisted.set(row.content_type, {
      contentType: row.content_type,
      mode: row.mode,
      maxItems: row.max_items,
    });
  });

  return {
    attractions: persisted.get("attractions")
      ?? legacySetting("attractions", relationCounts.attractions),
    restaurants: persisted.get("restaurants")
      ?? legacySetting("restaurants", relationCounts.restaurants),
    accommodations: persisted.get("accommodations")
      ?? legacySetting("accommodations", relationCounts.accommodations),
    stories: persisted.get("stories")
      ?? legacySetting("stories", relationCounts.stories),
  };
}

export function isMissingRelatedContentSettingsError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = String(error.code);
  return code === "42P01" || code === "PGRST205";
}

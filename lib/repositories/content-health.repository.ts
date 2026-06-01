import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

// ─── Types ────────────────────────────────────────────────────────────────

export type ContentType = "attraction" | "story" | "route" | "restaurant" | "accommodation" | "photo_spot";

export type ContentHealthItem = {
  id: number;
  contentType: ContentType;
  nameTh: string;
  nameEn: string | null;
  slug: string | null;
  isPublished: boolean;
  isActive: boolean;
  provinceName: string | null;
  createdAt: string;
  updatedAt: string | null;
  // Health indicators
  hasEnglishName: boolean;
  hasEnglishDescription: boolean;
  hasCoverMedia: boolean;
  hasPotentialStockMedia: boolean;
  hasMissingAltMedia: boolean;
  stockMediaPaths: string[];
  missingTranslations: string[];
  issues: string[];
};

export type ContentHealthSummary = {
  totalItems: number;
  totalPublished: number;
  totalDraft: number;
  totalActive: number;
  itemsMissingEnglish: number;
  itemsMissingMedia: number;
  itemsMissingAltText: number;
  itemsWithPotentialStockMedia: number;
  itemsWithIssues: number;
  publishedPercentage: number;
  activePercentage: number;
  byType: Record<ContentType, {
    total: number;
    published: number;
    draft: number;
    active: number;
    missingEnglish: number;
    missingMedia: number;
    missingAltText: number;
    stockMedia: number;
  }>;
};

export type ContentHealthReport = {
  items: ContentHealthItem[];
  summary: ContentHealthSummary;
};

// ─── English translation fields to check per content type ────────────────

const EN_FIELDS: Record<ContentType, { name: string; field: string }[]> = {
  attraction: [
    { name: "name_en", field: "name_en" },
    { name: "short_description_en", field: "short_description_en" },
    { name: "description_en", field: "description_en" },
    { name: "history_en", field: "history_en" },
    { name: "travel_tips_en", field: "travel_tips_en" },
    { name: "how_to_get_there_en", field: "how_to_get_there_en" },
  ],
  story: [
    { name: "English title", field: "title_en" },
  ],
  route: [
    { name: "name_en", field: "name_en" },
    { name: "description_en", field: "description_en" },
  ],
  restaurant: [
    { name: "name_en", field: "name_en" },
    { name: "description_en", field: "description_en" },
  ],
  accommodation: [
    { name: "name_en", field: "name_en" },
    { name: "description_en", field: "description_en" },
  ],
  photo_spot: [
    { name: "name_en", field: "spot_name_en" },
    { name: "description_en", field: "description_en" },
  ],
};

const COVER_FIELDS: Record<ContentType, string | null> = {
  attraction: null,
  story: null,
  route: null,
  restaurant: null,
  accommodation: null,
  photo_spot: "sample_image_path",
};

// Tables that have a `content_media` relationship
const HAS_CONTENT_MEDIA: ContentType[] = ["attraction", "story", "route", "restaurant", "accommodation"];

// ─── Helpers ──────────────────────────────────────────────────────────────

function hasEnglishValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

function hasCoverMedia(row: Record<string, unknown>, contentType: ContentType, contentMediaCoverCounts: Map<string, number>): boolean {
  // First check direct cover field
  const coverField = COVER_FIELDS[contentType];
  if (coverField && hasEnglishValue(row[coverField])) return true;

  // Then check content_media for cover images
  if (HAS_CONTENT_MEDIA.includes(contentType)) {
    const key = `${contentType}_${row.id ?? row[getPkColumn(contentType)]}`;
    const count = contentMediaCoverCounts.get(key) ?? 0;
    if (count > 0) return true;
  }

  return false;
}

function contentKey(contentType: ContentType, row: Record<string, unknown>): string {
  return `${contentType}_${row.id ?? row[getPkColumn(contentType)]}`;
}

function isPotentialStockOrDemoMedia(storagePath: unknown): storagePath is string {
  if (typeof storagePath !== "string") return false;
  const value = storagePath.toLowerCase();
  return (
    value.includes("images.unsplash.com") ||
    value.includes("source.unsplash.com") ||
    value.includes("placeholder") ||
    value.includes("/demo/") ||
    value.includes("demo-") ||
    value.includes("sample-")
  );
}

function getPkColumn(contentType: ContentType): string {
  switch (contentType) {
    case "attraction": return "attraction_id";
    case "story": return "story_id";
    case "route": return "route_id";
    case "restaurant": return "restaurant_id";
    case "accommodation": return "accommodation_id";
    case "photo_spot": return "photo_spot_id";
  }
}

// ─── Helper: safe query that returns empty array on table-not-found errors ─

async function safeQueryAll<T = Record<string, unknown>>(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  table: string,
  select: string
): Promise<T[]> {
  try {
    const res = await supabase.from(table).select(select).order("name_th");
    if (res.error) {
      return [];
    }
    return (res.data ?? []) as unknown as T[];
  } catch {
    return [];
  }
}

// ─── Query functions ──────────────────────────────────────────────────────

export async function getContentHealth(): Promise<ContentHealthReport> {
  const supabase = createSupabaseServiceRoleClient();

  // Fetch all content media cover counts in one query
  const { data: contentMediaRows } = await supabase
    .from("content_media")
    .select("storage_path, attraction_id, story_id, route_id, restaurant_id, accommodation_id, alt_text_th, alt_text_en, media_type")
    .eq("is_active", true)
    .eq("lifecycle_status", "active");

  const contentMediaCoverCounts = new Map<string, number>();
  const potentialStockMediaByKey = new Map<string, string[]>();
  const missingAltByKey = new Set<string>();
  if (contentMediaRows) {
    for (const row of contentMediaRows) {
      const keys = [
        row.attraction_id ? `attraction_${row.attraction_id}` : null,
        row.story_id ? `story_${row.story_id}` : null,
        row.route_id ? `route_${row.route_id}` : null,
        row.restaurant_id ? `restaurant_${row.restaurant_id}` : null,
        row.accommodation_id ? `accommodation_${row.accommodation_id}` : null,
      ].filter(Boolean) as string[];

      const isVisual = row.media_type === "image" || row.media_type === "panorama";
      const hasAlt = Boolean(row.alt_text_th?.trim() || row.alt_text_en?.trim());

      for (const key of keys) {
        contentMediaCoverCounts.set(key, (contentMediaCoverCounts.get(key) ?? 0) + 1);

        if (isPotentialStockOrDemoMedia(row.storage_path)) {
          potentialStockMediaByKey.set(key, [
            ...(potentialStockMediaByKey.get(key) ?? []),
            row.storage_path,
          ]);
        }

        if (isVisual && !hasAlt) {
          missingAltByKey.add(key);
        }
      }
    }
  }

  // Fetch all content types in parallel
  const [
    attractionsRes,
    storiesRes,
    routesRes,
    restaurantsRes,
    accommodationsRes,
    photoSpotsRes,
  ] = await Promise.all([
    supabase.from("attractions").select("*, provinces(province_name_th)").order("name_th"),
    supabase.from("travel_stories").select("*, provinces(province_name_th)").order("title"),
    supabase.from("suggested_routes").select("*").order("name_th"),
    supabase.from("restaurants").select("*, provinces(province_name_th)").order("name_th"),
    safeQueryAll(supabase, "accommodations", "*, provinces(province_name_th)"),
    supabase.from("photo_spots").select("*, attractions(name_th)").order("spot_name_th"),
  ]);

  // Accommodations are processed from the safe-query result (table may not exist yet)
  const accommodationsData = Array.isArray(accommodationsRes) ? accommodationsRes : [];

  const items: ContentHealthItem[] = [];
  const byType: ContentHealthSummary["byType"] = {
    attraction: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
    story: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
    route: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
    restaurant: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
    accommodation: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
    photo_spot: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
  };

  function processItems<T extends Record<string, unknown>>(
    contentType: ContentType,
    rows: T[],
    mapRow: (row: T) => {
      id: number;
      nameTh: string;
      nameEn: string | null;
      slug: string | null;
      isPublished: boolean;
      isActive: boolean;
      provinceName: string | null;
      createdAt: string;
      updatedAt: string | null;
      raw: Record<string, unknown>;
    },
  ) {
    const typeSummary = byType[contentType];

    for (const row of rows) {
      const mapped = mapRow(row);
      typeSummary.total++;

      if (mapped.isPublished) typeSummary.published++;
      else typeSummary.draft++;

      if (mapped.isActive) typeSummary.active++;

      // Check missing English translations
      const missingTranslations: string[] = [];
      const enFields = EN_FIELDS[contentType];
      for (const ef of enFields) {
        if (!hasEnglishValue(row[ef.field])) {
          missingTranslations.push(ef.name);
        }
      }
      if (missingTranslations.length > 0) typeSummary.missingEnglish++;

      // Check cover media
      const coverOk = hasCoverMedia(mapped.raw, contentType, contentMediaCoverCounts);
      if (!coverOk) typeSummary.missingMedia++;

      const cKey = contentKey(contentType, mapped.raw);
      const stockMediaPaths = potentialStockMediaByKey.get(cKey) ?? [];
      if (stockMediaPaths.length > 0) typeSummary.stockMedia++;

      const missingAlt = missingAltByKey.has(cKey);
      if (missingAlt) typeSummary.missingAltText++;

      // Collect issues
      const issues: string[] = [];
      if (!mapped.isPublished) issues.push("draft");
      if (!mapped.isActive) issues.push("inactive");
      if (missingTranslations.length > 0) {
        issues.push(`missing ${missingTranslations.length} EN field(s)`);
      }
      if (!coverOk) issues.push("no cover");
      if (stockMediaPaths.length > 0) issues.push("stock/demo media");
      if (missingAlt) issues.push("missing alt text");

      items.push({
        id: mapped.id,
        contentType,
        nameTh: mapped.nameTh,
        nameEn: mapped.nameEn,
        slug: mapped.slug,
        isPublished: mapped.isPublished,
        isActive: mapped.isActive,
        provinceName: mapped.provinceName,
        createdAt: mapped.createdAt,
        updatedAt: mapped.updatedAt,
        hasEnglishName: mapped.nameEn !== null && mapped.nameEn.trim().length > 0,
        hasEnglishDescription: missingTranslations.length < enFields.length,
        hasCoverMedia: coverOk,
        hasPotentialStockMedia: stockMediaPaths.length > 0,
        hasMissingAltMedia: missingAlt,
        stockMediaPaths,
        missingTranslations,
        issues,
      });
    }
  }

  // Process attractions
  processItems("attraction", (attractionsRes.data ?? []) as Record<string, unknown>[], (row) => {
    const province = Array.isArray(row.provinces) ? (row.provinces as Record<string, unknown>[])[0] : row.provinces as Record<string, unknown>;
    return {
      id: Number(row.attraction_id),
      nameTh: String(row.name_th ?? ""),
      nameEn: (row.name_en as string) ?? null,
      slug: (row.slug as string) ?? null,
      isPublished: Boolean(row.is_published),
      isActive: Boolean(row.is_active),
      provinceName: (province?.province_name_th as string) ?? null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: (row.updated_at as string) ?? null,
      raw: row as Record<string, unknown>,
    };
  });

  // Process stories
  processItems("story", (storiesRes.data ?? []) as Record<string, unknown>[], (row) => {
    const province = Array.isArray(row.provinces) ? (row.provinces as Record<string, unknown>[])[0] : row.provinces as Record<string, unknown>;
    return {
      id: Number(row.story_id),
      nameTh: String(row.title ?? ""),
      nameEn: (row.title_en as string) ?? null,
      slug: (row.slug as string) ?? null,
      isPublished: Boolean(row.is_published),
      isActive: true,
      provinceName: (province?.province_name_th as string) ?? null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: (row.updated_at as string) ?? null,
      raw: row as Record<string, unknown>,
    };
  });
  // Stories have no is_active field — override to true for all
  items.filter(i => i.contentType === "story").forEach(i => { i.isActive = true; });

  // Process routes
  processItems("route", (routesRes.data ?? []) as Record<string, unknown>[], (row) => {
    return {
      id: Number(row.route_id),
      nameTh: String(row.name_th ?? ""),
      nameEn: (row.name_en as string) ?? null,
      slug: (row.slug as string) ?? null,
      isPublished: Boolean(row.is_published),
      isActive: Boolean(row.is_active),
      provinceName: null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: (row.updated_at as string) ?? null,
      raw: row as Record<string, unknown>,
    };
  });

  // Process restaurants
  processItems("restaurant", (restaurantsRes.data ?? []) as Record<string, unknown>[], (row) => {
    const province = Array.isArray(row.provinces) ? (row.provinces as Record<string, unknown>[])[0] : row.provinces as Record<string, unknown>;
    return {
      id: Number(row.restaurant_id),
      nameTh: String(row.name_th ?? ""),
      nameEn: (row.name_en as string) ?? null,
      slug: (row.slug as string) ?? null,
      isPublished: Boolean(row.is_published),
      isActive: Boolean(row.is_active),
      provinceName: (province?.province_name_th as string) ?? null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: (row.updated_at as string) ?? null,
      raw: row as Record<string, unknown>,
    };
  });

  // Process accommodations
  processItems("accommodation", (Array.isArray(accommodationsData) ? accommodationsData : []) as Record<string, unknown>[], (row) => {
    const province = Array.isArray(row.provinces) ? (row.provinces as Record<string, unknown>[])[0] : row.provinces as Record<string, unknown>;
    return {
      id: Number(row.accommodation_id),
      nameTh: String(row.name_th ?? ""),
      nameEn: (row.name_en as string) ?? null,
      slug: null,
      isPublished: Boolean(row.is_published),
      isActive: Boolean(row.is_active),
      provinceName: (province?.province_name_th as string) ?? null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: (row.updated_at as string) ?? null,
      raw: row as Record<string, unknown>,
    };
  });

  // Process photo spots
  processItems("photo_spot", (photoSpotsRes.data ?? []) as Record<string, unknown>[], (row) => {
    const attraction = Array.isArray(row.attractions) ? (row.attractions as Record<string, unknown>[])[0] : row.attractions as Record<string, unknown>;
    return {
      id: Number(row.photo_spot_id),
      nameTh: String(row.spot_name_th ?? ""),
      nameEn: (row.spot_name_en as string) ?? null,
      slug: null,
      isPublished: true,
      isActive: Boolean(row.is_active),
      provinceName: (attraction?.name_th as string) ?? null,
      createdAt: String(row.created_at ?? ""),
      updatedAt: (row.updated_at as string) ?? null,
      raw: row as Record<string, unknown>,
    };
  });

  // Calculate summary
  let totalItems = 0;
  let totalPublished = 0;
  let totalDraft = 0;
  let totalActive = 0;
  let itemsMissingEnglish = 0;
  let itemsMissingMedia = 0;
  let itemsMissingAltText = 0;
  let itemsWithPotentialStockMedia = 0;
  let itemsWithIssues = 0;

  for (const type of Object.keys(byType) as ContentType[]) {
    const s = byType[type];
    totalItems += s.total;
    totalPublished += s.published;
    totalDraft += s.draft;
    totalActive += s.active;
    itemsMissingEnglish += s.missingEnglish;
    itemsMissingMedia += s.missingMedia;
    itemsMissingAltText += s.missingAltText;
    itemsWithPotentialStockMedia += s.stockMedia;
  }

  itemsWithIssues = items.filter(i => i.issues.length > 0).length;

  return {
    items,
    summary: {
      totalItems,
      totalPublished,
      totalDraft,
      totalActive,
      itemsMissingEnglish,
      itemsMissingMedia,
      itemsMissingAltText,
      itemsWithPotentialStockMedia,
      itemsWithIssues,
      publishedPercentage: totalItems > 0 ? Math.round((totalPublished / totalItems) * 100) : 0,
      activePercentage: totalItems > 0 ? Math.round((totalActive / totalItems) * 100) : 0,
      byType,
    },
  };
}

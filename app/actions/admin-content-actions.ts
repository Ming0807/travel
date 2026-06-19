"use server";

import { requirePermission } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type QueryError = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
};

type ProvinceRelation = {
  province_name_th: string | null;
  province_name_en: string | null;
};

type ContentMediaRelation = {
  storage_path: string | null;
  media_type: string | null;
  is_cover: boolean | null;
  is_active: boolean | null;
  display_order: number | null;
};

type RawAttractionRow = {
  attraction_id: number | string;
  name_th: string;
  name_en: string | null;
  slug: string;
  is_published: boolean;
  is_active: boolean;
  province?: ProvinceRelation | ProvinceRelation[] | null;
  content_media?: ContentMediaRelation | ContentMediaRelation[] | null;
};

type HomepagePickerAttraction = {
  id: number;
  name_th: string;
  name_en: string | null;
  slug: string;
  cover_media_path: string | null;
  is_published: boolean;
  is_active: boolean;
  province: {
    name_th: string | null;
    name_en: string | null;
  } | null;
};

type AttractionQueryResponse = {
  data: RawAttractionRow[] | null;
  error: QueryError | null;
};

const ATTRACTION_BASE_SELECT = `
  attraction_id,
  name_th,
  name_en,
  slug,
  is_published,
  is_active,
  province:provinces(province_name_th, province_name_en)
`;

const ATTRACTION_WITH_MEDIA_SELECT = `
  ${ATTRACTION_BASE_SELECT},
  content_media(storage_path, media_type, is_cover, is_active, display_order)
`;

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function pickCoverMediaPath(row: RawAttractionRow): string | null {
  const media = row.content_media
    ? Array.isArray(row.content_media)
      ? row.content_media
      : [row.content_media]
    : [];

  const visualMedia = media
    .filter((item) => item.is_active !== false)
    .filter((item) => ["image", "panorama", "external_url"].includes(String(item.media_type ?? "")))
    .sort((a, b) => {
      if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
      return Number(a.display_order ?? 0) - Number(b.display_order ?? 0);
    });

  return visualMedia[0]?.storage_path ?? null;
}

function mapHomepagePickerAttraction(row: RawAttractionRow): HomepagePickerAttraction {
  const province = firstRelation(row.province);

  return {
    id: Number(row.attraction_id),
    name_th: row.name_th,
    name_en: row.name_en,
    slug: row.slug,
    cover_media_path: pickCoverMediaPath(row),
    is_published: row.is_published,
    is_active: row.is_active,
    province: province
      ? {
          name_th: province.province_name_th ?? null,
          name_en: province.province_name_en ?? null,
        }
      : null,
  };
}

async function runAttractionPickerQuery(
  buildQuery: (selectClause: string) => PromiseLike<unknown>
): Promise<AttractionQueryResponse> {
  const withMedia = (await buildQuery(ATTRACTION_WITH_MEDIA_SELECT)) as AttractionQueryResponse;
  if (!withMedia.error) return withMedia;

  return (await buildQuery(ATTRACTION_BASE_SELECT)) as AttractionQueryResponse;
}

type AttractionSearchOptions = {
  query?: string;
  province?: string;
  status?: "all" | "published" | "draft" | "inactive" | "has_cover";
  limit?: number;
};

export async function searchAttractionsAction(queryOrOptions: string | AttractionSearchOptions) {
  try {
    await requirePermission("attraction.read");
    const supabase = await createSupabaseServerClient();

    const options: AttractionSearchOptions =
      typeof queryOrOptions === "string"
        ? { query: queryOrOptions }
        : queryOrOptions;

    const trimmedQuery = (options.query ?? "").trim();
    const limit = options.limit ?? 20;

    const { data, error } = await runAttractionPickerQuery((selectClause) => {
      let dbQuery = supabase
        .from("attractions")
        .select(selectClause)
        .order("name_th", { ascending: true })
        .limit(limit);

      if (trimmedQuery) {
        const escaped = trimmedQuery.replace(/[\\%_]/g, "\\$&").replace(/,/g, " ");
        dbQuery = dbQuery.or(
          `name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`
        );
      }

      if (options.province && options.province !== "all") {
        dbQuery = dbQuery.eq("provinces.province_name_en", options.province);
      }

      if (options.status && options.status !== "all") {
        switch (options.status) {
          case "published":
            dbQuery = dbQuery.eq("is_published", true).eq("is_active", true);
            break;
          case "draft":
            dbQuery = dbQuery.eq("is_published", false);
            break;
          case "inactive":
            dbQuery = dbQuery.eq("is_active", false);
            break;
          case "has_cover":
            break;
        }
      }

      return dbQuery;
    });

    if (error) {
      return { success: false, error: "ไม่สามารถค้นหาสถานที่ได้ กรุณาลองอีกครั้ง" };
    }

    let results = (data ?? []).map(mapHomepagePickerAttraction);

    if (options.status === "has_cover") {
      results = results.filter((item) => item.cover_media_path !== null);
    }

    return { success: true, data: results };
  } catch {
    return { success: false, error: "Internal server error" };
  }
}

export async function getAttractionsBySlugsAction(slugs: string[]) {
  if (!slugs || slugs.length === 0) return { success: true, data: [] };

  try {
    await requirePermission("attraction.read");
    const supabase = await createSupabaseServerClient();

    const { data, error } = await runAttractionPickerQuery((selectClause) =>
      supabase
        .from("attractions")
        .select(selectClause)
        .in("slug", slugs)
    );

    if (error) {
      return { success: false, error: "ไม่สามารถโหลดข้อมูลสถานที่ได้ กรุณาลองอีกครั้ง" };
    }

    const rows = data ?? [];
    const sortedData = slugs
      .map((slug) => rows.find((attraction) => attraction.slug === slug))
      .filter((attraction): attraction is RawAttractionRow => Boolean(attraction))
      .map(mapHomepagePickerAttraction);

    return { success: true, data: sortedData };
  } catch {
    return { success: false, error: "Internal server error" };
  }
}

// ─── Route picker for settings ────────────────────────────────────────

export async function searchRoutesAction(query: string) {
  try {
    await requirePermission("route.read");
    const supabase = await createSupabaseServerClient();
    const trimmed = query.trim();
    if (!trimmed) return { success: true, data: [] };

    const escaped = trimmed.replace(/[\\%_]/g, "\\$&").replace(/,/g, " ");

    const { data, error } = await supabase
      .from("suggested_routes")
      .select("route_id, name_th, name_en, slug, is_published, is_active")
      .or(`name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
      .order("name_th", { ascending: true })
      .limit(20);

    if (error) return { success: false, error: "ไม่สามารถค้นหาเส้นทางได้" };
    return { success: true, data: (data ?? []).map((r) => ({
      id: Number(r.route_id), name_th: String(r.name_th ?? ""), name_en: (r.name_en as string | null),
      slug: String(r.slug ?? ""), is_published: Boolean(r.is_published), is_active: Boolean(r.is_active),
    })) };
  } catch { return { success: false, error: "Internal server error" }; }
}

export async function getRoutesBySlugsAction(slugs: string[]) {
  if (!slugs?.length) return { success: true, data: [] };
  try {
    await requirePermission("route.read");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("suggested_routes").select("route_id, name_th, name_en, slug, is_published, is_active")
      .in("slug", slugs).limit(slugs.length);
    if (error) return { success: false, error: "ไม่สามารถโหลดข้อมูลเส้นทางได้" };
    const rows = (data ?? []).map((r) => ({
      id: Number(r.route_id), name_th: String(r.name_th ?? ""), name_en: (r.name_en as string | null),
      slug: String(r.slug ?? ""), is_published: Boolean(r.is_published), is_active: Boolean(r.is_active),
    }));
    return { success: true, data: slugs.map((s) => rows.find((r) => r.slug === s)).filter(Boolean) };
  } catch { return { success: false, error: "Internal server error" }; }
}

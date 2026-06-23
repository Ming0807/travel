import "server-only";

import { normalizePublicContentMediaReference } from "@/lib/media/storage-paths";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type DbRecord = Record<string, unknown>;
type ServiceRoleClient = ReturnType<typeof createSupabaseServiceRoleClient>;

export type PublicContentMediaSource = {
  bucket: "visit-photos";
  storagePath: string;
};

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function rowExists(
  supabase: ServiceRoleClient,
  params: {
    table: string;
    idColumn: string;
    idValue: number;
    equals?: Record<string, unknown>;
    orFilter?: string;
  },
) {
  let query = supabase
    .from(params.table)
    .select(params.idColumn)
    .eq(params.idColumn, params.idValue);

  Object.entries(params.equals ?? {}).forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  if (params.orFilter) {
    query = query.or(params.orFilter);
  }

  const { data, error } = await query.maybeSingle();
  return !error && Boolean(data);
}

async function hasVisibleOwner(supabase: ServiceRoleClient, row: DbRecord) {
  const attractionId = numberValue(row.attraction_id);
  if (attractionId) {
    return rowExists(supabase, {
      table: "attractions",
      idColumn: "attraction_id",
      idValue: attractionId,
      equals: { is_published: true, is_active: true },
    });
  }

  const restaurantId = numberValue(row.restaurant_id);
  if (restaurantId) {
    return rowExists(supabase, {
      table: "restaurants",
      idColumn: "restaurant_id",
      idValue: restaurantId,
      equals: { is_published: true, is_active: true },
    });
  }

  const accommodationId = numberValue(row.accommodation_id);
  if (accommodationId) {
    return rowExists(supabase, {
      table: "accommodations",
      idColumn: "accommodation_id",
      idValue: accommodationId,
      equals: { is_published: true, is_active: true },
    });
  }

  const routeId = numberValue(row.route_id);
  if (routeId) {
    return rowExists(supabase, {
      table: "suggested_routes",
      idColumn: "route_id",
      idValue: routeId,
      equals: { is_published: true, is_active: true },
    });
  }

  const storyId = numberValue(row.story_id);
  if (storyId) {
    return rowExists(supabase, {
      table: "travel_stories",
      idColumn: "story_id",
      idValue: storyId,
      orFilter: "status.eq.published,is_published.eq.true",
    });
  }

  return false;
}

export async function getPublicContentMediaSource(rawPath: string): Promise<PublicContentMediaSource | null> {
  let storagePath: string;
  try {
    storagePath = normalizePublicContentMediaReference(rawPath);
  } catch {
    return null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("content_media")
    .select("storage_path, attraction_id, restaurant_id, accommodation_id, story_id, route_id")
    .eq("storage_path", storagePath)
    .eq("is_active", true)
    .eq("lifecycle_status", "active")
    .maybeSingle();

  if (error || !data || typeof data !== "object") {
    return null;
  }

  if (!(await hasVisibleOwner(supabase, data as DbRecord))) {
    return null;
  }

  return {
    bucket: "visit-photos",
    storagePath,
  };
}

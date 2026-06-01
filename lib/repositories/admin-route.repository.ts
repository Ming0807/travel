import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminRouteFilters, AdminRouteMutationInput, AdminRouteStopMutationInput } from "@/lib/validation/route";

export type AdminRouteRow = {
  route_id: number;
  slug: string;
  name_th: string;
  name_en: string | null;
  description_th: string | null;
  description_en: string | null;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  stop_count: number;
};

export type AdminRouteStopRow = {
  stop_id: number;
  route_id: number;
  attraction_id: number;
  day_number: number;
  display_order: number;
  stop_note_th: string | null;
  stop_note_en: string | null;
  attraction_name_th: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRoute(row: any, stopCounts = new Map<number, number>()): AdminRouteRow {
  return {
    route_id: Number(row.route_id),
    slug: row.slug,
    name_th: row.name_th,
    name_en: row.name_en,
    description_th: row.description_th,
    description_en: row.description_en,
    is_published: row.is_published,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    stop_count: stopCounts.get(Number(row.route_id)) ?? 0
  };
}

function toPayload(input: AdminRouteMutationInput) {
  return {
    name_th: input.nameTh,
    slug: input.slug,
    name_en: input.nameEn,
    description_th: input.descriptionTh,
    description_en: input.descriptionEn,
    is_published: input.isPublished,
    is_active: input.isActive
  };
}

export async function findRouteBySlug(slug: string, excludeRouteId?: number) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("suggested_routes").select("route_id").eq("slug", slug).limit(1);
  if (excludeRouteId) query = query.neq("route_id", excludeRouteId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("ADMIN_ROUTE_READ_FAILED");
  }

  return data ? Number(data.route_id) : null;
}

function countByRoute(rows: { route_id: number }[]) {
  const counts = new Map<number, number>();
  rows.forEach((row) => counts.set(Number(row.route_id), (counts.get(Number(row.route_id)) ?? 0) + 1));
  return counts;
}

export async function listAdminRoutes(filters: AdminRouteFilters): Promise<PaginatedResult<AdminRouteRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("suggested_routes")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(`name_th.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_ROUTE_LIST_FAILED");
  }

  const routeIds = (data ?? []).map((row) => Number(row.route_id));
  const stopCounts = new Map<number, number>();
  
  if (routeIds.length > 0) {
    const stops = await supabase.from("suggested_route_stops").select("route_id").in("route_id", routeIds);
    if (!stops.error && stops.data) {
        const counts = countByRoute(stops.data);
        counts.forEach((val, key) => stopCounts.set(key, val));
    }
  }

  return {
    items: (data ?? []).map((row) => mapRoute(row, stopCounts)),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminRouteById(routeId: number): Promise<AdminRouteRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("suggested_routes")
    .select("*")
    .eq("route_id", routeId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_ROUTE_READ_FAILED");
  }

  if (!data) return null;

  return mapRoute(data);
}

export async function createAdminRoute(input: AdminRouteMutationInput): Promise<AdminRouteRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("suggested_routes")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_ROUTE_CREATE_FAILED");
  }

  return mapRoute(data);
}

export async function updateAdminRoute(routeId: number, input: AdminRouteMutationInput): Promise<AdminRouteRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("suggested_routes")
    .update(toPayload(input))
    .eq("route_id", routeId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_ROUTE_UPDATE_FAILED");
  }

  return mapRoute(data);
}

export async function updateAdminRouteStatus(
  routeId: number,
  patch: { is_published?: boolean; is_active?: boolean }
): Promise<AdminRouteRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("suggested_routes")
    .update(patch)
    .eq("route_id", routeId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_ROUTE_UPDATE_FAILED");
  }

  return mapRoute(data);
}

export async function getRouteStops(routeId: number): Promise<AdminRouteStopRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("suggested_route_stops")
    .select("*, attractions(name_th)")
    .eq("route_id", routeId)
    .order("day_number", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error("ADMIN_ROUTE_STOPS_READ_FAILED");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    stop_id: Number(row.stop_id),
    route_id: Number(row.route_id),
    attraction_id: Number(row.attraction_id),
    day_number: Number(row.day_number),
    display_order: Number(row.display_order),
    stop_note_th: row.stop_note_th,
    stop_note_en: row.stop_note_en,
    attraction_name_th: row.attractions?.name_th ?? null
  }));
}

export async function updateRouteStopsBatch(routeId: number, stops: AdminRouteStopMutationInput[]): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();

  // Use the RPC function that wraps delete+insert in a single Postgres transaction.
  // If the insert fails, the delete is also rolled back — no data loss.
  const stopsJson = stops.map(stop => ({
    attractionId: stop.attractionId,
    dayNumber: stop.dayNumber,
    displayOrder: stop.displayOrder,
    stopNoteTh: stop.stopNoteTh,
    stopNoteEn: stop.stopNoteEn
  }));

  const { data, error } = await supabase.rpc("update_route_stops", {
    p_route_id: routeId,
    p_stops_json: stopsJson
  });

  if (error) {
    console.error("updateRouteStopsBatch RPC error:", { code: error.code, message: error.message, details: error.details, hint: error.hint });
    throw new Error(`ADMIN_ROUTE_STOPS_UPDATE_FAILED: ${error.message}`);
  }

  // Parse the JSON result from the RPC
  const result = data as { success: boolean; error?: string; error_code?: string } | null;
  if (!result?.success) {
    console.error("updateRouteStopsBatch RPC returned failure:", result);
    throw new Error(`ADMIN_ROUTE_STOPS_UPDATE_FAILED: ${result?.error ?? "Unknown error"}`);
  }
}

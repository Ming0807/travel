import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { getServerEnv } from "@/lib/config/server-env";
import { logAuditAction } from "@/lib/services/audit-log.service";

export async function GET(request: NextRequest) {
  try {
    const db = createSupabaseServiceRoleClient();
    const guard = await requirePermission("export.restaurants");

    const { searchParams } = new URL(request.url);
    const format = parseExportFormat(searchParams.get("format"));
    const nameSearch = searchParams.get("search") ?? undefined;
    const isPublishedRaw = searchParams.get("isPublished");
    const isPublished =
      isPublishedRaw === "true" ? true : isPublishedRaw === "false" ? false : undefined;
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const filters = { search: nameSearch, isPublished };

    let query = db
      .from("restaurants")
      .select(
        `
          restaurant_id,
          slug,
          name_th,
          name_en,
          description_th,
          description_en,
          food_type,
          latitude,
          longitude,
          address_text,
          opening_hours,
          contact_info,
          is_published,
          is_active,
          created_at,
          updated_at,
          provinces (province_name_th)
        `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (nameSearch) {
      const escaped = nameSearch.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(
        `name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`,
      );
    }
    if (isPublished !== undefined) query = query.eq("is_published", isPublished);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EXPORT_FAILED", message: "Failed to fetch restaurants" },
        },
        { status: 500 },
      );
    }

    if ((data ?? []).length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.restaurants.too_large",
        entityType: "restaurant_export",
        result: "failed",
        metadata: { maxRows, format, filters },
      });
      return NextResponse.json(
        { error: "Export is too large. Please apply more filters." },
        { status: 413 },
      );
    }

    const rows = (data ?? []).map((row) => {
      const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;
      return {
        ID: String(row.restaurant_id),
        Slug: row.slug ?? "",
        "Name (TH)": row.name_th ?? "",
        "Name (EN)": row.name_en ?? "",
        "Description (TH)": row.description_th ?? "",
        "Description (EN)": row.description_en ?? "",
        "Food Type": row.food_type ?? "",
        Province: province?.province_name_th ?? "",
        Latitude: row.latitude !== null ? String(row.latitude) : "",
        Longitude: row.longitude !== null ? String(row.longitude) : "",
        Address: row.address_text ?? "",
        "Opening Hours": row.opening_hours ?? "",
        Contact: row.contact_info ?? "",
        Status: row.is_published ? "Published" : "Draft",
        Active: row.is_active ? "Yes" : "No",
        "Created At": row.created_at ?? "",
        "Updated At": row.updated_at ?? "",
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.restaurants.${format}`,
      entityType: "restaurant_export",
      result: "success",
      metadata: { rowCount: rows.length, format, filters },
    });

    const date = new Date().toISOString().slice(0, 10);
    return await createExportResponse(rows, `restaurants_export_${date}`, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 },
      );
    }
    console.error("Export Restaurants Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}

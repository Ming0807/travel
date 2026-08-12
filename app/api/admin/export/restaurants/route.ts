import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { getServerEnv } from "@/lib/config/server-env";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminRestaurantFiltersSchema } from "@/lib/validation/admin-restaurant";

export async function GET(request: NextRequest) {
  try {
    const db = createSupabaseServiceRoleClient();
    const guard = await requirePermission("export.restaurants");

    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const parsed = adminRestaurantFiltersSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }
    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    let categoryRestaurantIds: number[] | null = null;
    if (filters.categorySlug) {
      const { data: category, error: categoryError } = await db
        .from("restaurant_categories")
        .select("category_id")
        .eq("slug", filters.categorySlug)
        .maybeSingle();
      if (categoryError) {
        return NextResponse.json({ error: "Failed to resolve restaurant category." }, { status: 500 });
      }
      if (!category) {
        categoryRestaurantIds = [];
      } else {
        const { data: assignments, error: assignmentError } = await db
          .from("restaurant_category_assignments")
          .select("restaurant_id")
          .eq("category_id", category.category_id);
        if (assignmentError) {
          return NextResponse.json({ error: "Failed to resolve category assignments." }, { status: 500 });
        }
        categoryRestaurantIds = Array.from(new Set((assignments ?? []).map((row) => Number(row.restaurant_id))));
      }
    }

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
          provinces (province_name_th),
          restaurant_category_assignments (
            display_order,
            restaurant_categories (name_th, name_en, slug)
          )
        `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (filters.search) {
      const escaped = filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(
        `name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`,
      );
    }
    if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
    if (categoryRestaurantIds) {
      query = query.in("restaurant_id", categoryRestaurantIds.length > 0 ? categoryRestaurantIds : [-1]);
    }
    if (filters.foodType) query = query.ilike("food_type", `%${filters.foodType.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`);
    if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

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
      const categories = (row.restaurant_category_assignments ?? [])
        .slice()
        .sort((left, right) => Number(left.display_order) - Number(right.display_order))
        .flatMap((assignment) => {
          const category = Array.isArray(assignment.restaurant_categories)
            ? assignment.restaurant_categories[0]
            : assignment.restaurant_categories;
          return category ? [category.name_th ?? category.name_en ?? category.slug ?? ""] : [];
        })
        .filter(Boolean);
      return {
        ID: String(row.restaurant_id),
        Slug: row.slug ?? "",
        "Name (TH)": row.name_th ?? "",
        "Name (EN)": row.name_en ?? "",
        "Description (TH)": row.description_th ?? "",
        "Description (EN)": row.description_en ?? "",
        Categories: categories.join(" | "),
        "Legacy Food Type": row.food_type ?? "",
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

import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requirePermission } from "@/lib/auth/guards";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { getServerEnv } from "@/lib/config/server-env";

export async function GET(request: NextRequest) {
  const db = createSupabaseServiceRoleClient();
  const actor = await requirePermission("restaurant.read");

  const { searchParams } = new URL(request.url);
  const format = parseExportFormat(searchParams.get("format"));
  const nameSearch = searchParams.get("search") ?? undefined;
  const isPublishedRaw = searchParams.get("isPublished");
  const isPublished = isPublishedRaw === "true" ? true : isPublishedRaw === "false" ? false : undefined;

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
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(getServerEnv().EXPORT_MAX_ROWS);

  if (nameSearch) {
    query = query.or(`name_th.ilike.%${nameSearch}%,name_en.ilike.%${nameSearch}%,slug.ilike.%${nameSearch}%`);
  }
  if (isPublished !== undefined) query = query.eq("is_published", isPublished);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: { code: "EXPORT_FAILED", message: "Failed to fetch restaurants" } }, { status: 500 });
  }

  const rows = (data ?? []).map((row) => {
    const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;
    return {
      ID: String(row.restaurant_id),
      Slug: row.slug ?? "",
      "ชื่อภาษาไทย": row.name_th ?? "",
      "ชื่อภาษาอังกฤษ": row.name_en ?? "",
      "คำอธิบายภาษาไทย": row.description_th ?? "",
      "คำอธิบายภาษาอังกฤษ": row.description_en ?? "",
      "ประเภทอาหาร": row.food_type ?? "",
      "จังหวัด": province?.province_name_th ?? "",
      "ละติจูด": row.latitude !== null ? String(row.latitude) : "",
      "ลองจิจูด": row.longitude !== null ? String(row.longitude) : "",
      "ที่อยู่": row.address_text ?? "",
      "เวลาเปิด": row.opening_hours ?? "",
      "ช่องทางติดต่อ": row.contact_info ?? "",
      สถานะ: row.is_published ? "Published" : "Draft",
      Active: row.is_active ? "Yes" : "No",
      "สร้างเมื่อ": row.created_at ?? "",
      "อัปเดตล่าสุด": row.updated_at ?? "",
    };
  });

  await db.from("audit_logs").insert({
    actor_id: String(actor.actorId),
    action: "export.restaurants",
    entity_type: "restaurant_export",
    metadata: { rowCount: rows.length, format },
  });

  const date = new Date().toISOString().slice(0, 10);
  return await createExportResponse(rows, `restaurants_export_${date}`, format);
}

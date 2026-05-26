"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminRouteMutationSchema, adminRouteStopsBatchSchema } from "@/lib/validation/route";
import {
  createAdminRoute,
  updateAdminRoute,
  updateAdminRouteStatus,
  getAdminRouteById,
  updateRouteStopsBatch,
  findRouteBySlug,
} from "@/lib/repositories/admin-route.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export async function createRouteAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.create");
    const parsed = adminRouteMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลเส้นทางอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRouteBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const created = await createAdminRoute(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "route.create",
      entityType: "suggested_route",
      entityId: created.route_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/routes");
    return { success: true, data: { id: created.route_id, slug: created.slug } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังสร้างเส้นทางไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateRouteAction(routeId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.update");
    const parsed = adminRouteMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลเส้นทางอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRouteBySlug(parsed.data.slug, routeId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminRouteById(routeId);
    if (!old) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminRoute(routeId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "route.update",
      entityType: "suggested_route",
      entityId: updated.route_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขเส้นทางไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleRoutePublishAction(routeId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRouteById(routeId);
    if (!current) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };

    const guard = await requirePermission(current.is_published ? "route.unpublish" : "route.publish");

    const updated = await updateAdminRouteStatus(routeId, { is_published: !current.is_published });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_published ? "route.unpublish" : "route.publish",
      entityType: "suggested_route",
      entityId: routeId,
      oldValues: { is_published: current.is_published },
      newValues: { is_published: updated.is_published },
    });

    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะเผยแพร่ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleRouteActiveAction(routeId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRouteById(routeId);
    if (!current) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };

    const guard = await requirePermission(current.is_active ? "route.deactivate" : "route.activate");

    const updated = await updateAdminRouteStatus(routeId, { is_active: !current.is_active });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "route.deactivate" : "route.activate",
      entityType: "suggested_route",
      entityId: routeId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะใช้งานไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateRouteStopsAction(routeId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.update");
    const stopsJson = formData.get("stops") as string;
    if (!stopsJson) return { success: false, error: "ยังไม่มีข้อมูลจุดแวะ กรุณาเพิ่มจุดแวะอย่างน้อย 1 จุด" };

    const parsedStops = JSON.parse(stopsJson);
    const parsed = adminRouteStopsBatchSchema.safeParse({ routeId, stops: parsedStops });
    
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจจุดแวะของเส้นทางอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    await updateRouteStopsBatch(routeId, parsed.data.stops);
    
    await logAdminMutation({
      actor: guard.actor,
      action: "route.update_stops",
      entityType: "suggested_route",
      entityId: routeId,
      newValues: { stops: parsed.data.stops },
    });

    revalidatePath(`/admin/routes/${routeId}/stops`);
    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกจุดแวะของเส้นทางไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

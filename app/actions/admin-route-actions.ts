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
} from "@/lib/repositories/admin-route.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createRouteAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.create");
    const parsed = adminRouteMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
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
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create route." };
  }
}

export async function updateRouteAction(routeId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.update");
    const parsed = adminRouteMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const old = await getAdminRouteById(routeId);
    if (!old) return { success: false, error: "Route not found." };

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
    return { success: false, error: "Failed to update route." };
  }
}

export async function toggleRoutePublishAction(routeId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRouteById(routeId);
    if (!current) return { success: false, error: "Route not found." };

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
    return { success: false, error: "Failed to toggle publish status." };
  }
}

export async function toggleRouteActiveAction(routeId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRouteById(routeId);
    if (!current) return { success: false, error: "Route not found." };

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
    return { success: false, error: "Failed to toggle active status." };
  }
}

export async function updateRouteStopsAction(routeId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.update");
    const stopsJson = formData.get("stops") as string;
    if (!stopsJson) return { success: false, error: "Invalid stops data." };

    const parsedStops = JSON.parse(stopsJson);
    const parsed = adminRouteStopsBatchSchema.safeParse({ routeId, stops: parsedStops });
    
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
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
    return { success: false, error: "Failed to update route stops." };
  }
}

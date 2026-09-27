"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { evaluateRouteReadiness, type RouteReadinessIssue, type RouteStopForReadiness } from "@/lib/routes/route-readiness";
import { adminRouteCoverSchema, adminRouteMutationSchema, adminRouteStopsBatchSchema } from "@/lib/validation/route";
import { clearCoverMediaForEntity, setRouteCoverFromLibraryAsset } from "@/lib/repositories/admin-media.repository";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import {
  createAdminRoute,
  updateAdminRoute,
  updateAdminRouteStatus,
  getAdminRouteById,
  getRouteStops,
  listEligibleRouteAttractionIds,
  updateRouteStopsBatch,
  findRouteBySlug,
} from "@/lib/repositories/admin-route.repository";

type ActionResult<TData = unknown> = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: TData;
};

const readinessMessages: Record<RouteReadinessIssue, string> = {
  too_few_stops: "เพิ่มจุดแวะอย่างน้อย 2 แห่งก่อนเผยแพร่เส้นทาง",
  duplicate_attraction: "สถานที่ในเส้นทางซ้ำกัน กรุณาเลือกแต่ละแห่งเพียงครั้งเดียว",
  ineligible_attraction: "จุดแวะบางแห่งยังไม่เปิดเผยแพร่หรืออยู่นอกพื้นที่นำร่อง",
  day_gap: "หมายเลขวันต้องเรียงต่อกันโดยเริ่มจากวันที่ 1",
  order_gap: "ลำดับจุดแวะในแต่ละวันต้องเริ่มจาก 1 และเรียงต่อกัน",
};

async function routeReadinessIssues(stops: RouteStopForReadiness[]) {
  const eligibleIds = await listEligibleRouteAttractionIds(stops.map((stop) => stop.attractionId));
  return evaluateRouteReadiness(stops, eligibleIds);
}

async function savedRouteReadinessIssues(routeId: number) {
  const stops = await getRouteStops(routeId);
  return routeReadinessIssues(stops.map((stop) => ({
    attractionId: stop.attraction_id,
    dayNumber: stop.day_number,
    displayOrder: stop.display_order,
  })));
}

function readinessError(issues: RouteReadinessIssue[]): ActionResult | null {
  const firstIssue = issues[0];
  return firstIssue ? { success: false, error: readinessMessages[firstIssue] } : null;
}

function hasCoverMutation(formData: FormData) {
  return ["coverMediaId", "coverStoragePath"].some((key) => String(formData.get(key) ?? "").trim() !== "")
    || ["set", "clear"].includes(String(formData.get("coverMediaAction")));
}

export async function saveRouteCoverAction(routeId: number, input: unknown): Promise<ActionResult<{ mediaId: number | null; imageUrl: string | null }>> {
  try {
    const guard = await requirePermission("route.update");
    const parsed = adminRouteCoverSchema.safeParse(input);
    if (!Number.isSafeInteger(routeId) || routeId <= 0 || !parsed.success) {
      return { success: false, error: "กรุณาเลือกรูปภาพปกจากคลังสื่ออีกครั้ง" };
    }
    const route = await getAdminRouteById(routeId);
    if (!route) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };

    const cover = parsed.data.assetId
      ? await setRouteCoverFromLibraryAsset(routeId, parsed.data.assetId, route.name_th)
      : null;
    if (!cover) await clearCoverMediaForEntity("route", routeId);

    await logAdminMutation({
      actor: guard.actor,
      action: "route.cover.save",
      entityType: "suggested_route",
      entityId: routeId,
      newValues: { coverMediaId: cover?.mediaId ?? null },
    });
    revalidatePath(`/admin/routes/${routeId}/edit`);
    revalidatePath("/admin/routes");
    if (route.is_active && route.is_published) {
      revalidatePath("/routes", "layout");
      revalidatePath(`/routes/${route.slug}`);
      revalidatePath("/");
    }
    return { success: true, data: {
      mediaId: cover?.mediaId ?? null,
      imageUrl: cover ? siteMediaImageUrl(cover.storagePath) : null,
    } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    if (error instanceof Error && error.message === "INVALID_ROUTE_COVER_ASSET") {
      return { success: false, error: "รูปนี้ไม่พร้อมใช้งาน กรุณาเลือกจากคลังสื่ออีกครั้ง" };
    }
    return { success: false, error: "ยังบันทึกรูปภาพปกไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function createRouteAction(_prevState: ActionResult<{ id: number; slug: string }>, formData: FormData): Promise<ActionResult<{ id: number; slug: string }>> {
  try {
    const guard = await requirePermission("route.create");
    const parsed = adminRouteMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลเส้นทางอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    if (hasCoverMutation(formData)) return { success: false, error: "เลือกรูปภาพปกในตัวแก้ไขเส้นทางหลังสร้างฉบับร่าง" };

    const existingSlug = await findRouteBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const draftInput = { ...parsed.data, isPublished: false, isActive: true };
    const created = await createAdminRoute(draftInput);

    await logAdminMutation({
      actor: guard.actor,
      action: "route.create",
      entityType: "suggested_route",
      entityId: created.route_id,
      newValues: { ...draftInput, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/routes");
    return { success: true, data: { id: created.route_id, slug: created.slug } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังสร้างเส้นทางไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateRouteAction(routeId: number, _prevState: ActionResult<{ id: number; slug: string }>, formData: FormData): Promise<ActionResult<{ id: number; slug: string }>> {
  try {
    const guard = await requirePermission("route.update");
    const parsed = adminRouteMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลเส้นทางอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    if (hasCoverMutation(formData)) return { success: false, error: "กรุณาบันทึกรูปภาพผ่านส่วนรูปปกของตัวแก้ไขเส้นทาง" };

    const existingSlug = await findRouteBySlug(parsed.data.slug, routeId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminRouteById(routeId);
    if (!old) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };

    if (parsed.data.isPublished !== old.is_published || parsed.data.isActive !== old.is_active) {
      return { success: false, error: "กรุณาเปลี่ยนสถานะเส้นทางผ่านปุ่มเผยแพร่หรือปุ่มเปิดใช้งาน" };
    }

    const updated = await updateAdminRoute(routeId, parsed.data);

    await logAdminMutation({
      actor: guard.actor,
      action: "route.update",
      entityType: "suggested_route",
      entityId: updated.route_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/routes");
    revalidatePath(`/admin/routes/${routeId}/edit`);
    if (old.is_published && old.is_active) {
      revalidatePath("/routes", "layout");
      revalidatePath(`/routes/${old.slug}`);
      revalidatePath(`/routes/${updated.slug}`);
      revalidatePath("/");
    }
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

    if (!current.is_published) {
      if (!current.is_active) return { success: false, error: "เปิดใช้งานเส้นทางก่อนเผยแพร่" };
      const issue = readinessError(await savedRouteReadinessIssues(routeId));
      if (issue) return issue;
    }

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
    revalidatePath("/routes", "layout");
    revalidatePath(`/routes/${current.slug}`);
    revalidatePath("/");
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

    if (!current.is_active && current.is_published) {
      const issue = readinessError(await savedRouteReadinessIssues(routeId));
      if (issue) return issue;
    }

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
    revalidatePath("/routes", "layout");
    revalidatePath(`/routes/${current.slug}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะใช้งานไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function archiveRouteAction(routeId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.delete");
    const current = await getAdminRouteById(routeId);
    if (!current) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };

    await updateAdminRouteStatus(routeId, {
      is_active: false,
      is_published: false,
    });
    await logAdminMutation({
      actor: guard.actor,
      action: "suggested_route.archive",
      entityType: "suggested_route",
      entityId: routeId,
      oldValues: {
        is_active: current.is_active,
        is_published: current.is_published,
      },
      newValues: { is_active: false, is_published: false },
    });

    revalidatePath("/admin/routes");
    revalidatePath("/routes", "layout");
    revalidatePath(`/routes/${current.slug}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังลบเส้นทางออกจากระบบไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateRouteStopsAction(routeId: number, _prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("route.update");
    const stopsJson = formData.get("stops") as string;
    if (!stopsJson) return { success: false, error: "ยังไม่มีข้อมูลจุดแวะ กรุณาเพิ่มจุดแวะอย่างน้อย 1 จุด" };

    const parsedStops = JSON.parse(stopsJson);
    const parsed = adminRouteStopsBatchSchema.safeParse({ routeId, stops: parsedStops });
    
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจจุดแวะของเส้นทางอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const current = await getAdminRouteById(routeId);
    if (!current) return { success: false, error: "ไม่พบเส้นทางนี้ อาจถูกลบหรือย้ายแล้ว" };
    const issues = await routeReadinessIssues(parsed.data.stops);
    const blockingIssues = current.is_published
      ? issues
      : issues.filter((issue) => issue === "duplicate_attraction" || issue === "ineligible_attraction");
    const issue = readinessError(blockingIssues);
    if (issue) return issue;

    await updateRouteStopsBatch(routeId, parsed.data.stops);
    
    await logAdminMutation({
      actor: guard.actor,
      action: "route.update_stops",
      entityType: "suggested_route",
      entityId: routeId,
      newValues: { stops: parsed.data.stops },
    });

    revalidatePath(`/admin/routes/${routeId}/stops`);
    revalidatePath(`/admin/routes/${routeId}/edit`);
    revalidatePath("/admin/routes");
    if (current.is_published && current.is_active) {
      revalidatePath("/routes", "layout");
      revalidatePath(`/routes/${current.slug}`);
      revalidatePath("/");
    }
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    console.error("updateRouteStopsAction failed:", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
      routeId,
    });
    return { success: false, error: "ยังบันทึกจุดแวะของเส้นทางไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

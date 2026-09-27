import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  current: { route_id: 5, slug: "na-tham", name_th: "หน้าถ้ำ", is_published: false, is_active: true },
  stops: [
    { attraction_id: 1, day_number: 1, display_order: 1 },
    { attraction_id: 2, day_number: 1, display_order: 2 },
  ] as Array<{ attraction_id: number; day_number: number; display_order: number }>,
  eligible: new Set([1, 2]),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  updateStops: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: vi.fn().mockResolvedValue({ actor: { id: "admin" } }),
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  clearCoverMediaForEntity: vi.fn(),
  linkMediaToEntity: vi.fn(),
  linkMediaToEntityByStoragePath: vi.fn(),
}));
vi.mock("@/lib/repositories/admin-route.repository", () => ({
  createAdminRoute: mocks.create,
  updateAdminRoute: mocks.update,
  updateAdminRouteStatus: mocks.updateStatus,
  getAdminRouteById: vi.fn(async () => mocks.current),
  getRouteStops: vi.fn(async () => mocks.stops),
  listEligibleRouteAttractionIds: vi.fn(async () => mocks.eligible),
  updateRouteStopsBatch: mocks.updateStops,
  findRouteBySlug: vi.fn().mockResolvedValue(null),
}));

import {
  archiveRouteAction,
  createRouteAction,
  toggleRoutePublishAction,
  toggleRouteActiveAction,
  updateRouteAction,
  updateRouteStopsAction,
} from "@/app/actions/admin-route-actions";
import { revalidatePath } from "next/cache";

function metadataForm(isPublished: boolean) {
  const form = new FormData();
  form.set("nameTh", "หน้าถ้ำ");
  form.set("slug", "na-tham");
  form.set("isPublished", String(isPublished));
  form.set("isActive", "true");
  return form;
}

describe("route publication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.current.is_published = false;
    mocks.current.is_active = true;
    mocks.stops = [
      { attraction_id: 1, day_number: 1, display_order: 1 },
      { attraction_id: 2, day_number: 1, display_order: 2 },
    ];
    mocks.eligible = new Set([1, 2]);
    mocks.create.mockResolvedValue({ route_id: 5, slug: "na-tham" });
    mocks.update.mockResolvedValue({ route_id: 5 });
    mocks.updateStatus.mockResolvedValue({ is_published: true });
    mocks.updateStops.mockResolvedValue(undefined);
  });

  it("always creates a draft even if the form requests publication", async () => {
    const form = metadataForm(true);
    form.set("isActive", "false");
    const result = await createRouteAction({ success: false }, form);
    expect(result.success).toBe(true);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ isPublished: false, isActive: true }));
  });

  it("blocks publishing an incomplete route", async () => {
    mocks.stops = [{ attraction_id: 1, day_number: 1, display_order: 1 }];
    const result = await toggleRoutePublishAction(5);
    expect(result.success).toBe(false);
    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });

  it("blocks publication through metadata update too", async () => {
    mocks.eligible = new Set([1]);
    const result = await updateRouteAction(5, { success: false }, metadataForm(true));
    expect(result.success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("publishes valid routes", async () => {
    const result = await toggleRoutePublishAction(5);
    expect(result.success).toBe(true);
    expect(mocks.updateStatus).toHaveBeenCalledWith(5, { is_published: true });
  });

  it("invalidates the homepage and detail page when archiving a route", async () => {
    mocks.current.is_published = true;
    const result = await archiveRouteAction(5);
    expect(result.success).toBe(true);
    expect(mocks.updateStatus).toHaveBeenCalledWith(5, { is_active: false, is_published: false });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/routes/na-tham");
  });

  it("blocks reactivating a published route whose stops are no longer eligible", async () => {
    mocks.current.is_published = true;
    mocks.current.is_active = false;
    mocks.eligible = new Set([1]);
    const result = await toggleRouteActiveAction(5);
    expect(result.success).toBe(false);
    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });

  it("prevents a published route from losing its usable itinerary", async () => {
    mocks.current.is_published = true;
    const form = new FormData();
    form.set("stops", JSON.stringify([{ attractionId: 1, dayNumber: 1, displayOrder: 1 }]));
    const result = await updateRouteStopsAction(5, { success: false }, form);
    expect(result.success).toBe(false);
    expect(mocks.updateStops).not.toHaveBeenCalled();
  });

  it("rejects duplicate stops while allowing incomplete drafts", async () => {
    const form = new FormData();
    form.set("stops", JSON.stringify([
      { attractionId: 1, dayNumber: 1, displayOrder: 1 },
      { attractionId: 1, dayNumber: 1, displayOrder: 2 },
    ]));
    const duplicateResult = await updateRouteStopsAction(5, { success: false }, form);
    expect(duplicateResult.success).toBe(false);
    expect(mocks.updateStops).not.toHaveBeenCalled();

    form.set("stops", JSON.stringify([{ attractionId: 1, dayNumber: 1, displayOrder: 1 }]));
    const draftResult = await updateRouteStopsAction(5, { success: false }, form);
    expect(draftResult.success).toBe(true);
    expect(mocks.updateStops).toHaveBeenCalledOnce();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ guard: vi.fn(), read: vi.fn(), set: vi.fn(), clear: vi.fn(), update: vi.fn(), audit: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.guard, AdminAuthError: class AdminAuthError extends Error {
  constructor(_code: string, message: string) { super(message); }
} }));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation: mocks.audit }));
vi.mock("@/lib/repositories/admin-route.repository", () => ({ getAdminRouteById: mocks.read, updateAdminRoute: mocks.update, findRouteBySlug: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  setRouteCoverFromLibraryAsset: mocks.set, clearCoverMediaForEntity: mocks.clear,
  linkMediaToEntity: vi.fn(), linkMediaToEntityByStoragePath: vi.fn(),
}));
vi.mock("@/lib/media/storage-paths", () => ({ siteMediaImageUrl: (path: string) => `/site-media/${path}` }));

import { saveRouteCoverAction, updateRouteAction } from "@/app/actions/admin-route-actions";
import { AdminAuthError } from "@/lib/auth/guards";

const assetId = "f04a9a4e-4e2a-4f7f-9fb5-000000000042";
describe("route cover actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.guard.mockResolvedValue({ actor: { id: "admin" } });
    mocks.read.mockResolvedValue({ route_id: 5, slug: "na-tham", name_th: "หน้าถ้ำ", is_active: true, is_published: true });
    mocks.set.mockResolvedValue({ mediaId: 92, storagePath: "cover.webp" });
  });

  it("saves a library image without changing route metadata or status", async () => {
    expect(await saveRouteCoverAction(5, { assetId })).toEqual({ success: true, data: { mediaId: 92, imageUrl: "/site-media/cover.webp" } });
    expect(mocks.guard).toHaveBeenCalledWith("route.update");
    expect(mocks.set).toHaveBeenCalledWith(5, assetId, "หน้าถ้ำ");
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revalidate).toHaveBeenCalledWith("/admin/routes/5/edit");
    expect(mocks.revalidate).toHaveBeenCalledWith("/routes/na-tham");
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "route.cover.save", newValues: { coverMediaId: 92 } }));
  });

  it("removes only this route cover", async () => {
    expect(await saveRouteCoverAction(5, { assetId: null })).toEqual({ success: true, data: { mediaId: null, imageUrl: null } });
    expect(mocks.clear).toHaveBeenCalledWith("route", 5);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it.each([{ assetId: "91" }, { assetId, storagePath: "private.webp" }, { assetId, nameTh: "overwrite" }, {}])("rejects forged or incomplete payloads: %j", async (input) => {
    expect(await saveRouteCoverAction(5, input)).toMatchObject({ success: false });
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.clear).not.toHaveBeenCalled();
  });

  it("denies mutation without permission before reading records", async () => {
    mocks.guard.mockRejectedValue(new AdminAuthError("FORBIDDEN", "Denied"));
    expect(await saveRouteCoverAction(5, { assetId })).toMatchObject({ success: false });
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("contains provider errors and does not acknowledge an unsuccessful cover save", async () => {
    mocks.set.mockRejectedValue(new Error("secret/provider detail"));
    const result = await saveRouteCoverAction(5, { assetId });
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("secret");
    expect(mocks.audit).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("prevents the metadata endpoint from accepting an unchecked storage path", async () => {
    const form = new FormData();
    form.set("nameTh", "หน้าถ้ำ"); form.set("slug", "na-tham");
    form.set("isActive", "true"); form.set("isPublished", "true");
    form.set("coverMediaAction", "set"); form.set("coverStoragePath", "unchecked.webp");
    expect(await updateRouteAction(5, { success: false }, form)).toMatchObject({ success: false });
    expect(mocks.update).not.toHaveBeenCalled();
  });
});

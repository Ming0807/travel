import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn().mockResolvedValue({ actor: { adminId: "admin-1" } }),
  logAdminMutation: vi.fn().mockResolvedValue(undefined),
  revalidatePath: vi.fn(),
  findAccommodationBySlug: vi.fn().mockResolvedValue(null),
  getAdminAccommodationById: vi.fn().mockResolvedValue({ accommodation_id: 41 }),
  updateAdminAccommodation: vi.fn().mockResolvedValue({ accommodation_id: 41 }),
  linkMediaToEntity: vi.fn().mockResolvedValue(undefined),
  getAdminMediaById: vi.fn().mockResolvedValue({ media_id: 73, media_type: "image", is_active: true, lifecycle_status: "active" }),
  linkMediaToEntityByStoragePath: vi.fn().mockResolvedValue(undefined),
  clearCoverMediaForEntity: vi.fn().mockResolvedValue(undefined),
  assertLiveDestinationProvinceId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  assertLiveDestinationProvinceId: mocks.assertLiveDestinationProvinceId,
}));
vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: mocks.requirePermission,
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation: mocks.logAdminMutation }));
vi.mock("@/lib/repositories/admin-accommodation.repository", () => ({
  createAdminAccommodation: vi.fn(),
  updateAdminAccommodation: mocks.updateAdminAccommodation,
  updateAdminAccommodationStatus: vi.fn(),
  findAccommodationBySlug: mocks.findAccommodationBySlug,
  getAdminAccommodationById: mocks.getAdminAccommodationById,
}));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  linkMediaToEntity: mocks.linkMediaToEntity,
  getAdminMediaById: mocks.getAdminMediaById,
  linkMediaToEntityByStoragePath: mocks.linkMediaToEntityByStoragePath,
  clearCoverMediaForEntity: mocks.clearCoverMediaForEntity,
}));

import { updateAccommodationAction } from "@/app/actions/admin-accommodation-actions";

function validForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries({
    provinceId: "1",
    slug: "sample-stay",
    nameTh: "ที่พักตัวอย่าง",
    latitude: "",
    longitude: "",
    isPublished: "false",
    isActive: "true",
    coverMediaId: "",
    coverMediaUrl: "",
    ...overrides,
  }).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("updateAccommodationAction cover media", () => {
  beforeEach(() => vi.clearAllMocks());

  it("clears the persisted cover when the editor explicitly removes it", async () => {
    const result = await updateAccommodationAction(41, { success: false }, validForm());

    expect(result.success).toBe(true);
    expect(mocks.clearCoverMediaForEntity).toHaveBeenCalledWith("accommodation", 41);
    expect(mocks.linkMediaToEntity).not.toHaveBeenCalled();
  });

  it("links the selected media record as cover", async () => {
    const result = await updateAccommodationAction(
      41,
      { success: false },
      validForm({ coverMediaId: "73", coverMediaUrl: "https://cdn.example.test/site-media/accommodations/cover.webp" }),
    );

    expect(result.success).toBe(true);
    expect(mocks.linkMediaToEntity).toHaveBeenCalledWith(73, "accommodation", 41);
    expect(mocks.linkMediaToEntityByStoragePath).not.toHaveBeenCalled();
    expect(mocks.clearCoverMediaForEntity).not.toHaveBeenCalled();
  });

  it("rejects an unavailable cover before changing the accommodation", async () => {
    mocks.getAdminMediaById.mockResolvedValueOnce(null);
    const result = await updateAccommodationAction(41, { success: false }, validForm({ coverMediaId: "73" }));

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.coverMediaId).toBeDefined();
    expect(mocks.updateAdminAccommodation).not.toHaveBeenCalled();
  });

  it("checks destination scope when changing an accommodation province", async () => {
    const result = await updateAccommodationAction(
      41,
      { success: false },
      validForm({ provinceId: "2" }),
    );

    expect(result.success).toBe(true);
    expect(mocks.assertLiveDestinationProvinceId).toHaveBeenCalledWith(2);
  });

  it("returns a field error when a province change is outside the live destination scope", async () => {
    mocks.assertLiveDestinationProvinceId.mockRejectedValueOnce(new Error("DESTINATION_PROVINCE_NOT_AVAILABLE"));
    const result = await updateAccommodationAction(
      41,
      { success: false },
      validForm({ provinceId: "2" }),
    );

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.provinceId).toBeDefined();
    expect(mocks.updateAdminAccommodation).not.toHaveBeenCalled();
  });

  it("does not block an unchanged legacy province outside the live scope", async () => {
    mocks.getAdminAccommodationById.mockResolvedValueOnce({ accommodation_id: 41, province_id: 9 });
    const result = await updateAccommodationAction(41, { success: false }, validForm({ provinceId: "9" }));

    expect(result.success).toBe(true);
    expect(mocks.assertLiveDestinationProvinceId).not.toHaveBeenCalled();
  });
});

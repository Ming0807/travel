import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  createAdminPhotoSpot: vi.fn(),
  updateAdminPhotoSpot: vi.fn(),
  getAdminPhotoSpotById: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/repositories/photo-spot.repository", () => ({
  createAdminPhotoSpot: mocks.createAdminPhotoSpot,
  updateAdminPhotoSpot: mocks.updateAdminPhotoSpot,
  updateAdminPhotoSpotStatus: vi.fn(),
  getAdminPhotoSpotById: mocks.getAdminPhotoSpotById,
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAdminMutation: mocks.logAdminMutation,
}));

import {
  createPhotoSpotAction,
  updatePhotoSpotAction,
} from "@/app/actions/admin-photo-spot-actions";

function validFormData() {
  const formData = new FormData();
  formData.set("attractionId", "7");
  formData.set("spotNameTh", "จุดชมวิวทดสอบ");
  formData.set("isActive", "true");
  return formData;
}

const actor = {
  adminId: "admin-test",
  authUserId: "auth-test",
  email: "admin@example.test",
  displayName: "Test Admin",
  roleNames: ["admin"],
  permissions: [],
};

describe("admin photo spot actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor });
  });

  it("returns the created row and records an audit log", async () => {
    const created = {
      photo_spot_id: 15,
      attraction_id: 7,
      spot_name_th: "จุดชมวิวทดสอบ",
      is_active: true,
    };
    mocks.createAdminPhotoSpot.mockResolvedValue(created);

    const result = await createPhotoSpotAction({ success: false }, validFormData());

    expect(result).toMatchObject({ success: true, data: created });
    expect(mocks.logAdminMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "photo_spot.create",
        entityId: 15,
      })
    );
  });

  it("returns the updated row and records old and new values", async () => {
    const old = {
      photo_spot_id: 15,
      attraction_id: 7,
      spot_name_th: "ชื่อเดิม",
      is_active: true,
    };
    const updated = {
      ...old,
      spot_name_th: "จุดชมวิวทดสอบ",
    };
    mocks.getAdminPhotoSpotById.mockResolvedValue(old);
    mocks.updateAdminPhotoSpot.mockResolvedValue(updated);

    const result = await updatePhotoSpotAction(15, { success: false }, validFormData());

    expect(result).toMatchObject({ success: true, data: updated });
    expect(mocks.logAdminMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "photo_spot.update",
        entityId: 15,
        oldValues: old,
      })
    );
  });
});

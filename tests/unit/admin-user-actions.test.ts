import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const authMocks = vi.hoisted(() => ({ requirePermission: vi.fn() }));
const repositoryMocks = vi.hoisted(() => ({
  inviteAdminUser: vi.fn(),
  toggleAdminUserStatus: vi.fn(),
  updateAdminUser: vi.fn(),
}));
const auditMocks = vi.hoisted(() => ({ logAdminAction: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: cacheMocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: authMocks.requirePermission }));
vi.mock("@/lib/repositories/admin-user.repository", () => repositoryMocks);
vi.mock("@/lib/repositories/admin-audit.repository", () => ({
  logAdminAction: auditMocks.logAdminAction,
}));

import { saveAdminUserAction } from "@/app/actions/admin-users";

describe("admin user actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requirePermission.mockResolvedValue({ adminId: "actor-admin-id" });
    repositoryMocks.inviteAdminUser.mockResolvedValue("new-admin-id");
  });

  it("does not copy invited email or display name into audit metadata", async () => {
    const formData = new FormData();
    formData.set("email", "invited@example.com");
    formData.set("displayName", "ผู้ดูแลข้อมูลส่วนบุคคล");
    formData.append("roleIds", "3");
    formData.set("isActive", "true");

    await expect(saveAdminUserAction(formData)).resolves.toEqual({
      success: true,
      id: "new-admin-id",
    });

    expect(auditMocks.logAdminAction).toHaveBeenCalledWith({
      adminId: "actor-admin-id",
      action: "user.create",
      entityType: "admin_user",
      entityId: "new-admin-id",
      details: { roleIds: [3], isActive: true, invitationSent: true },
    });
    const auditPayload = JSON.stringify(auditMocks.logAdminAction.mock.calls);
    expect(auditPayload).not.toContain("invited@example.com");
    expect(auditPayload).not.toContain("ผู้ดูแลข้อมูลส่วนบุคคล");
  });
});

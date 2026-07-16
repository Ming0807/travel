import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  logAdminAction: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.requirePermission }));
vi.mock("@/lib/repositories/role.repository", () => ({
  createRole: mocks.createRole,
  updateRole: mocks.updateRole,
  deleteRole: mocks.deleteRole,
}));
vi.mock("@/lib/repositories/admin-audit.repository", () => ({
  logAdminAction: mocks.logAdminAction,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { deleteRoleAction, saveRoleAction } from "@/app/actions/admin-roles";

function roleForm(id?: string) {
  const form = new FormData();
  if (id) form.set("id", id);
  form.set("roleName", "content_editor");
  form.set("description", "ดูแลเนื้อหาเว็บไซต์");
  form.set("isActive", "true");
  form.append("permissionIds", "10");
  return form;
}

describe("admin role actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ adminId: "admin-1", actor: { adminId: "admin-1" } });
    mocks.createRole.mockResolvedValue(8);
    mocks.updateRole.mockResolvedValue(true);
    mocks.deleteRole.mockResolvedValue(true);
  });

  it("requires role.create for a new role", async () => {
    await expect(saveRoleAction(roleForm())).resolves.toMatchObject({ success: true, id: 8 });
    expect(mocks.requirePermission).toHaveBeenCalledWith("role.create");
    expect(mocks.createRole).toHaveBeenCalled();
  });

  it("requires role.update for an existing role", async () => {
    await expect(saveRoleAction(roleForm("8"))).resolves.toMatchObject({ success: true, id: 8 });
    expect(mocks.requirePermission).toHaveBeenCalledWith("role.update");
    expect(mocks.updateRole).toHaveBeenCalledWith(8, expect.any(Object));
  });

  it("requires role.delete before deleting", async () => {
    const form = new FormData();
    form.set("id", "8");

    await expect(deleteRoleAction(form)).resolves.toEqual({ success: true });
    expect(mocks.requirePermission).toHaveBeenCalledWith("role.delete");
    expect(mocks.deleteRole).toHaveBeenCalledWith(8);
  });
});

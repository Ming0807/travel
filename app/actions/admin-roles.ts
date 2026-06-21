"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { createRole, updateRole, deleteRole } from "@/lib/repositories/role.repository";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  id: z.string().optional(),
  roleName: z.string().min(2, "Role Name must be at least 2 characters").regex(/^[a-z_]+$/, "Role Name can only contain lowercase letters and underscores"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  isActive: z.boolean(),
  permissionIds: z.array(z.number()),
});

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function saveRoleAction(formData: FormData) {
  try {
    const guard = await requireAdmin();
    if (!guard.adminId) throw new Error("Unauthorized");
    
    // Check permission - must have role.manage
    const { requirePermission } = await import("@/lib/auth/guards");
    await requirePermission("role.manage");

    const id = formData.get("id") as string;
    const roleName = formData.get("roleName") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";
    
    const permissionIds = formData.getAll("permissionIds").map(id => parseInt(id as string, 10)).filter(id => !isNaN(id));

    const validated = roleSchema.safeParse({
      id: id || undefined,
      roleName,
      description,
      isActive,
      permissionIds,
    });

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message || "กรุณาตรวจสอบข้อมูลให้ถูกต้อง" };
    }

    let newId;

    if (id) {
      const numId = parseInt(id, 10);
      await updateRole(numId, {
        roleName: validated.data.roleName,
        description: validated.data.description,
        isActive: validated.data.isActive,
        permissionIds: validated.data.permissionIds,
      });
      newId = numId;

      await logAdminAction({
        adminId: guard.adminId,
        action: "role.update",
        entityType: "roles",
        entityId: id,
        details: { roleName: validated.data.roleName, isActive: validated.data.isActive, permissions: validated.data.permissionIds }
      });
    } else {
      newId = await createRole({
        roleName: validated.data.roleName,
        description: validated.data.description,
        isActive: validated.data.isActive,
        permissionIds: validated.data.permissionIds,
      });

      await logAdminAction({
        adminId: guard.adminId,
        action: "role.create",
        entityType: "roles",
        entityId: newId.toString(),
        details: { roleName: validated.data.roleName, permissions: validated.data.permissionIds }
      });
    }

    revalidatePath("/admin/roles");
    return { success: true, id: newId };
  } catch (error) {
    console.error("saveRoleAction error:", error);
    return { error: getErrorMessage(error, "ไม่สามารถบันทึกบทบาทได้ กรุณาลองอีกครั้ง") };
  }
}

export async function deleteRoleAction(formData: FormData) {
  try {
    const guard = await requireAdmin();
    if (!guard.adminId) throw new Error("Unauthorized");
    
    // Check permission - must have role.manage
    const { requirePermission } = await import("@/lib/auth/guards");
    await requirePermission("role.manage");

    const id = formData.get("id") as string;
    if (!id) throw new Error("กรุณาระบุ ID บทบาท");
    
    const numId = parseInt(id, 10);

    await deleteRole(numId);

    await logAdminAction({
      adminId: guard.adminId,
      action: "role.delete",
      entityType: "roles",
      entityId: id,
    });

    revalidatePath("/admin/roles");
    return { success: true };
  } catch (error) {
    console.error("deleteRoleAction error:", error);
    return { error: getErrorMessage(error, "ไม่สามารถลบบทบาทได้ กรุณาลองอีกครั้ง") };
  }
}

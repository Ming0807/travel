"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { toggleAdminUserStatus, inviteAdminUser, updateAdminUser } from "@/lib/repositories/admin-user.repository";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import { z } from "zod";

const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  roleIds: z.array(z.number()),
  isActive: z.boolean().default(true),
});

export async function toggleAdminUserAction(adminId: string, isActive: boolean) {
  try {
    const guard = await requirePermission("user.manage");
    
    await toggleAdminUserStatus(adminId, isActive);
    
    await logAdminAction({
      adminId: guard.adminId,
      action: "user.toggle_status",
      entityType: "admin_user",
      entityId: adminId,
      details: { is_active: isActive }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("toggleAdminUserAction error:", error);
    return { error: error instanceof Error ? error.message : "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function saveAdminUserAction(formData: FormData) {
  try {
    const guard = await requirePermission("user.manage");
    
    // Check role manage permission if they are attempting to change roles
    const roleIdsStr = formData.getAll("roleIds");
    const roleIds = roleIdsStr.map(id => parseInt(id.toString(), 10)).filter(id => !isNaN(id));
    
    if (roleIds.length > 0) {
      await requirePermission("user.manage_roles");
    }

    const id = formData.get("id") as string | null;
    const email = formData.get("email") as string | null;
    const displayName = formData.get("displayName") as string;
    const isActive = formData.get("isActive") === "true";

    const validated = userSchema.safeParse({
      id: id || undefined,
      email: email || undefined,
      displayName,
      roleIds,
      isActive,
    });

    if (!validated.success) {
      return { error: validated.error.issues[0]?.message || "กรุณาตรวจสอบข้อมูลให้ถูกต้อง" };
    }

    let newId = id;

    if (id) {
      // Update existing user
      await updateAdminUser(id, {
        displayName: validated.data.displayName,
        roleIds: validated.data.roleIds,
        isActive: validated.data.isActive,
      });

      await logAdminAction({
        adminId: guard.adminId,
        action: "user.update",
        entityType: "admin_user",
        entityId: id,
        details: { displayName: validated.data.displayName, roles: validated.data.roleIds, isActive: validated.data.isActive }
      });
    } else {
      // Create new user
      if (!validated.data.email) throw new Error("กรุณากรอกอีเมลสำหรับผู้ใช้ใหม่");
      
      newId = await inviteAdminUser({
        email: validated.data.email,
        displayName: validated.data.displayName,
        roleIds: validated.data.roleIds,
      });

      await logAdminAction({
        adminId: guard.adminId,
        action: "user.create",
        entityType: "admin_user",
        entityId: newId as string,
        details: {
          roleIds: validated.data.roleIds,
          isActive: true,
          invitationSent: true,
        }
      });
    }

    revalidatePath("/admin/users");
    if (id) {
      revalidatePath(`/admin/users/${id}/edit`);
    }

    return { success: true, id: newId };
  } catch (error) {
    console.error("saveAdminUserAction error:", error);
    return { error: error instanceof Error ? error.message : "ไม่สามารถบันทึกผู้ใช้ได้ กรุณาลองอีกครั้ง" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { toggleAdminUserStatus } from "@/lib/repositories/admin-user.repository";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";

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
  } catch (error: any) {
    console.error("toggleAdminUserAction error:", error);
    return { error: error.message || "Failed to toggle user status" };
  }
}

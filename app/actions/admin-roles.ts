"use server";

import { requirePermission } from "@/lib/auth/guards";
import { createRole, updateRole, deleteRole } from "@/lib/repositories/role.repository";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  roleName: z.string().min(2, "ชื่อบทบาทต้องมีอย่างน้อย 2 ตัวอักษร").regex(/^[a-z_]+$/, "ชื่อบทบาทใช้ได้เฉพาะตัวอักษรอังกฤษพิมพ์เล็กและขีดล่าง"),
  description: z.string().min(2, "คำอธิบายต้องมีอย่างน้อย 2 ตัวอักษร"),
  isActive: z.boolean(),
  permissionIds: z.array(z.number()),
});

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function saveRoleAction(formData: FormData) {
  try {
    const id = String(formData.get("id") || "").trim();
    const guard = await requirePermission(id ? "role.update" : "role.create");
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

    if (validated.data.id) {
      await updateRole(validated.data.id, {
        roleName: validated.data.roleName,
        description: validated.data.description,
        isActive: validated.data.isActive,
        permissionIds: validated.data.permissionIds,
      });
      newId = validated.data.id;

      await logAdminAction({
        adminId: guard.adminId,
        action: "role.update",
        entityType: "roles",
        entityId: String(validated.data.id),
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
    const guard = await requirePermission("role.delete");
    const parsedId = z.coerce.number().int().positive().safeParse(formData.get("id"));
    if (!parsedId.success) throw new Error("กรุณาระบุ ID บทบาทที่ถูกต้อง");

    await deleteRole(parsedId.data);

    await logAdminAction({
      adminId: guard.adminId,
      action: "role.delete",
      entityType: "roles",
      entityId: String(parsedId.data),
    });

    revalidatePath("/admin/roles");
    return { success: true };
  } catch (error) {
    console.error("deleteRoleAction error:", error);
    return { error: getErrorMessage(error, "ไม่สามารถลบบทบาทได้ กรุณาลองอีกครั้ง") };
  }
}

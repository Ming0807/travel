"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminCheckinCodeMutationSchema } from "@/lib/validation/checkin-code";
import {
  createAdminCheckinCode,
  updateAdminCheckinCode,
  updateAdminCheckinCodeStatus,
  findCheckinCodeByCode,
  getAdminCheckinCodeById,
} from "@/lib/repositories/admin-checkin-code.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createCheckinCodeAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("checkin_code.create");
    const parsed = adminCheckinCodeMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingCode = await findCheckinCodeByCode(parsed.data.code);
    if (existingCode !== null) {
      return { success: false, error: "Code already exists.", fieldErrors: { code: ["This check-in code is already in use."] } };
    }

    const created = await createAdminCheckinCode(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "checkin_code.create",
      entityType: "checkin_code",
      entityId: created.checkin_code_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/checkin-codes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create check-in code." };
  }
}

export async function updateCheckinCodeAction(checkinCodeId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("checkin_code.update");
    const parsed = adminCheckinCodeMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingCode = await findCheckinCodeByCode(parsed.data.code, checkinCodeId);
    if (existingCode !== null) {
      return { success: false, error: "Code already exists.", fieldErrors: { code: ["This check-in code is already in use."] } };
    }

    const old = await getAdminCheckinCodeById(checkinCodeId);
    const updated = await updateAdminCheckinCode(checkinCodeId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "checkin_code.update",
      entityType: "checkin_code",
      entityId: updated.checkin_code_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/checkin-codes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to update check-in code." };
  }
}

export async function toggleCheckinCodeActiveAction(checkinCodeId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("checkin_code.deactivate");
    const current = await getAdminCheckinCodeById(checkinCodeId);
    if (!current) return { success: false, error: "Check-in code not found." };

    const updated = await updateAdminCheckinCodeStatus(checkinCodeId, !current.is_active);
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "checkin_code.deactivate" : "checkin_code.activate",
      entityType: "checkin_code",
      entityId: checkinCodeId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidatePath("/admin/checkin-codes");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to toggle active status." };
  }
}

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
  photoSpotBelongsToAttraction,
} from "@/lib/repositories/admin-checkin-code.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: {
    id?: number;
    code?: string;
    attractionId?: number;
  };
};

export async function createCheckinCodeAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("checkin_code.create");
    const parsed = adminCheckinCodeMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลรหัส Check-in อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingCode = await findCheckinCodeByCode(parsed.data.code);
    if (existingCode !== null) {
      return { success: false, error: "รหัสนี้ถูกใช้งานแล้ว", fieldErrors: { code: ["กรุณาใช้รหัสอื่นที่ยังไม่ซ้ำ"] } };
    }

    const spotMatchesAttraction = await photoSpotBelongsToAttraction(parsed.data.photoSpotId, parsed.data.attractionId);
    if (!spotMatchesAttraction) {
      return {
        success: false,
        error: "จุดถ่ายภาพนี้ไม่ได้อยู่ในสถานที่ที่เลือก",
        fieldErrors: { photoSpotId: ["เลือกจุดถ่ายภาพที่อยู่ภายใต้สถานที่เดียวกัน"] },
      };
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
    return {
      success: true,
      data: { id: created.checkin_code_id, code: created.code, attractionId: created.attraction_id },
    };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    console.error("createCheckinCodeAction error:", error);
    return { success: false, error: "ยังสร้างรหัส Check-in ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateCheckinCodeAction(checkinCodeId: number, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("checkin_code.update");
    const parsed = adminCheckinCodeMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลรหัส Check-in อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingCode = await findCheckinCodeByCode(parsed.data.code, checkinCodeId);
    if (existingCode !== null) {
      return { success: false, error: "รหัสนี้ถูกใช้งานแล้ว", fieldErrors: { code: ["กรุณาใช้รหัสอื่นที่ยังไม่ซ้ำ"] } };
    }

    const spotMatchesAttraction = await photoSpotBelongsToAttraction(parsed.data.photoSpotId, parsed.data.attractionId);
    if (!spotMatchesAttraction) {
      return {
        success: false,
        error: "จุดถ่ายภาพนี้ไม่ได้อยู่ในสถานที่ที่เลือก",
        fieldErrors: { photoSpotId: ["เลือกจุดถ่ายภาพที่อยู่ภายใต้สถานที่เดียวกัน"] },
      };
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
    return {
      success: true,
      data: { id: updated.checkin_code_id, code: updated.code, attractionId: updated.attraction_id },
    };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขรหัส Check-in ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleCheckinCodeActiveAction(checkinCodeId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("checkin_code.deactivate");
    const current = await getAdminCheckinCodeById(checkinCodeId);
    if (!current) return { success: false, error: "ไม่พบรหัส Check-in นี้ อาจถูกลบหรือย้ายแล้ว" };

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
    return { success: false, error: "ยังเปลี่ยนสถานะรหัส Check-in ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

"use server";

import { requirePermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { 
  createAdminPhotoSpot, 
  updateAdminPhotoSpot 
} from "@/lib/repositories/photo-spot.repository";
import { 
  adminPhotoSpotMutationSchema 
} from "@/lib/validation/photo-spot";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: any;
};

export async function createPhotoSpotAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("photo_spot.create");
    
    const parsed = adminPhotoSpotMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "กรุณาตรวจข้อมูลจุดถ่ายภาพอีกครั้ง",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const created = await createAdminPhotoSpot(parsed.data);
    revalidatePath("/admin/photo-spots");
    return { success: true, data: created };
  } catch (error: any) {
    console.error("Create photo spot action error:", error);
    return { success: false, error: "ยังสร้างจุดถ่ายภาพไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updatePhotoSpotAction(photoSpotId: number, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requirePermission("photo_spot.update");
    
    const parsed = adminPhotoSpotMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "กรุณาตรวจข้อมูลจุดถ่ายภาพอีกครั้ง",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const updated = await updateAdminPhotoSpot(photoSpotId, parsed.data);
    revalidatePath("/admin/photo-spots");
    revalidatePath(`/admin/photo-spots/${photoSpotId}/edit`);
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Update photo spot action error:", error);
    return { success: false, error: "ยังบันทึกการแก้ไขจุดถ่ายภาพไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

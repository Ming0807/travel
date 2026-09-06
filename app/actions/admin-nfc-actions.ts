"use server";
import { revalidatePath } from "next/cache";
import { changeNfcTag, createNfcTag, getNfcHistory } from "@/lib/services/admin-nfc.service";

export async function getAdminNfcHistoryAction(input: unknown) {
  try { return { success: true as const, ...await getNfcHistory(input) }; }
  catch { return { success: false as const, message: "ยังอ่านประวัติไม่ได้ กรุณาลองใหม่" }; }
}

const errors: Record<string, string> = {
  NFC_VERSION_CONFLICT: "รายการนี้มีการแก้ไขแล้ว กรุณารีเฟรชก่อนลองใหม่",
  NFC_READBACK_MISMATCH: "URL ที่อ่านจากแท็กไม่ตรงกับ URL ของระบบ",
  NFC_VERIFICATION_REQUIRED: "กรุณาตรวจสอบ URL จากแท็กก่อนเปิดใช้งาน",
  NFC_REVOKED_IMMUTABLE: "แท็กนี้ยกเลิกถาวรแล้ว ต้องสร้างแท็กทดแทน",
};
export async function saveAdminNfcAction(operation: "create" | "change", input: unknown) {
  try {
    const tag = operation === "create" ? await createNfcTag(input) : await changeNfcTag(input);
    revalidatePath(`/admin/checkin-codes/${tag.checkin_code_id}/nfc`);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, message: error instanceof Error && errors[error.message] ? errors[error.message] : "ยังบันทึกแท็กไม่ได้ กรุณาตรวจข้อมูลและสิทธิ์ แล้วลองใหม่" };
  }
}

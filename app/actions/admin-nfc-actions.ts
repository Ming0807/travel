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
  NFC_REPLACEMENT_REQUIRES_REVOCATION: "ต้องยกเลิกแท็กเดิมถาวรก่อนสร้างแท็กทดแทน",
  NFC_REPLACEMENT_CODE_MISMATCH: "แท็กทดแทนต้องอยู่ในจุดเช็กอินเดียวกับแท็กเดิม กรุณาตรวจรายการ",
};
export async function saveAdminNfcAction(operation: unknown, input: unknown) {
  try {
    if (operation !== "create" && operation !== "change") throw new Error("NFC_OPERATION_INVALID");
    const tag = operation === "create" ? await createNfcTag(input) : await changeNfcTag(input);
    revalidatePath(`/admin/checkin-codes/${tag.checkin_code_id}/nfc`);
    return operation === "create"
      ? { success: true as const, tagHref: `/admin/checkin-codes/${tag.checkin_code_id}/nfc?tagId=${tag.nfc_tag_id}` }
      : { success: true as const };
  } catch (error) {
    return { success: false as const, message: error instanceof Error && errors[error.message] ? errors[error.message] : "ยังบันทึกแท็กไม่ได้ กรุณาตรวจข้อมูลและสิทธิ์ แล้วลองใหม่" };
  }
}

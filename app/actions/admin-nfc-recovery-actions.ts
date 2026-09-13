"use server";
import { getNfcRecoveryReview, getNfcRecoveryReviewHistory } from "@/lib/services/nfc-recovery-review.service";

export async function getAdminNfcRecoveryAction(input: unknown) {
  try { return { success: true as const, ...await getNfcRecoveryReview(input) }; }
  catch { return { success: false as const, message: "ยังอ่านรายการกู้คืนไม่ได้ กรุณาตรวจสิทธิ์และการติดตั้งระบบ แล้วลองใหม่" }; }
}
export async function getAdminNfcRecoveryHistoryAction(input: unknown) {
  try { return { success: true as const, ...await getNfcRecoveryReviewHistory(input) }; }
  catch { return { success: false as const, message: "ยังอ่านประวัติการกู้คืนไม่ได้ กรุณาลองใหม่" }; }
}

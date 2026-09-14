"use server";
import { ZodError } from "zod";
import { AdminAuthError } from "@/lib/auth/guards";
import { requestNfcRecoveryRetry } from "@/lib/services/nfc-recovery-retry.service";

const rejected = new Map([
  ["NFC_RECOVERY_RETRY_STALE", { code: "stale", message: "รายการมีการประมวลผลเพิ่มแล้ว กรุณารีเฟรชสถานะ" }],
  ["NFC_RECOVERY_RETRY_UNAVAILABLE", { code: "unavailable", message: "รายการนี้ยังจัดคิวซ้ำไม่ได้ กรุณารีเฟรชสถานะและกำหนดตรวจ" }],
  ["NFC_RECOVERY_RETRY_FORBIDDEN", { code: "forbidden", message: "ไม่มีสิทธิ์จัดคิวตรวจซ้ำ กรุณาตรวจบัญชีผู้ใช้งาน" }],
  ["NFC_RECOVERY_RETRY_SCOPE_INVALID", { code: "scope_invalid", message: "ไม่พบรายการในแท็กนี้ กรุณารีเฟรชรายการ" }],
  ["NFC_RECOVERY_RETRY_REQUEST_CONFLICT", { code: "request_conflict", message: "เลขคำขอนี้ใช้กับข้อมูลอื่นแล้ว กรุณาตรวจประวัติก่อนดำเนินการต่อ" }],
  ["NFC_VERSION_CONFLICT", { code: "tag_changed", message: "แท็กมีการเปลี่ยนแปลง ต้องให้ผู้ดูแลตรวจสอบก่อน" }],
  ["NFC_UPLOAD_TAG_UNAVAILABLE", { code: "tag_changed", message: "แท็กไม่พร้อมใช้งาน ต้องให้ผู้ดูแลตรวจสอบก่อน" }],
  ["NFC_UPLOAD_ACTOR_UNAVAILABLE", { code: "owner_unavailable", message: "บัญชีผู้บันทึกหลักฐานไม่พร้อมใช้งาน ต้องให้ผู้ดูแลตรวจสอบก่อน" }],
  ["NFC_RECOVERY_RETRY_INPUT_INVALID", { code: "invalid", message: "ข้อมูลคำขอไม่ถูกต้อง กรุณาตรวจรายการและเหตุผล" }],
]);

export async function requestAdminNfcRecoveryRetryAction(input: unknown) {
  try {
    const result = await requestNfcRecoveryRetry(input);
    if (!result.enabled) return { success: false as const, outcome: "rejected" as const, code: "disabled",
      message: "ยังไม่เปิดการจัดคิวตรวจซ้ำโดยผู้ดูแล" };
    return { success: true as const, requestId: result.requestId };
  } catch (error) {
    // The service checks session authority before validation or the scheduling RPC.
    if (error instanceof AdminAuthError) return {
      success: false as const, outcome: "rejected" as const,
      code: error.code === "UNAUTHORIZED" ? "unauthorized" : "forbidden",
      message: error.code === "UNAUTHORIZED"
        ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ แล้วตรวจประวัติคำขอก่อนดำเนินการต่อ"
        : "บัญชีนี้ไม่มีสิทธิ์จัดคิวตรวจซ้ำ กรุณาติดต่อผู้ดูแลระบบ",
    };
    const known = error instanceof ZodError ? rejected.get("NFC_RECOVERY_RETRY_INPUT_INVALID")
      : error instanceof Error ? rejected.get(error.message) : undefined;
    if (known) return { success: false as const, outcome: "rejected" as const, ...known };
    // A missing acknowledgement does not prove rollback. The caller must retain its request UUID.
    return { success: false as const, outcome: "uncertain" as const, code: "unknown",
      message: "ยังยืนยันการจัดคิวไม่ได้ กรุณาตรวจประวัติหรือส่งคำขอเดิมอีกครั้ง" };
  }
}

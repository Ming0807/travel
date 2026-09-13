let failed = false;
export async function requestAdminNfcRecoveryRetryAction(input: { requestId: string }) {
  if (!failed) { failed = true; return { success: false as const, outcome: "uncertain" as const, code: "unknown", message: "ยังยืนยันการจัดคิวไม่ได้ กรุณาส่งคำขอเดิมอีกครั้ง" }; }
  return { success: true as const, requestId: input.requestId };
}

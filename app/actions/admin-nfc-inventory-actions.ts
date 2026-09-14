"use server";
import { getNfcEvidenceInventory } from "@/lib/services/nfc-evidence-inventory.service";

export async function getAdminNfcEvidenceInventoryAction(input: unknown) {
  try { return { success: true as const, ...await getNfcEvidenceInventory(input) }; }
  catch { return { success: false as const, message: "ยังอ่านรายการหลักฐานไม่ได้ กรุณาตรวจสิทธิ์และการติดตั้งระบบ แล้วลองใหม่" }; }
}

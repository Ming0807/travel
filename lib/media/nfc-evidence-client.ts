import { z } from "zod";
import { prepareAdminImageForUpload } from "@/lib/media/admin-image-upload-client";
import { NFC_EVIDENCE_UPLOAD_MAX_BYTES, NFC_EVIDENCE_STORED_MAX_BYTES } from "@/lib/nfc/evidence-upload-policy";

const contextSchema = z.object({ tagId: z.uuid(), version: z.number().int().positive().safe() });
const uploadedSchema = z.object({ assetId: z.uuid(), width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560), sizeBytes: z.number().int().min(1).max(NFC_EVIDENCE_STORED_MAX_BYTES) });
export async function uploadNfcEvidencePhoto(file: File, input: { tagId: string; version: number }, onStage: (stage: "preparing" | "uploading") => void) {
  const context = contextSchema.parse(input);
  onStage("preparing");
  const prepared = await prepareAdminImageForUpload(file);
  if (prepared.file.size > NFC_EVIDENCE_UPLOAD_MAX_BYTES) throw new Error("รูปยังใหญ่เกิน 3 MiB หลังปรับขนาด กรุณาเลือกรูปอื่น");
  onStage("uploading");
  const query = new URLSearchParams({ tagId: context.tagId, version: String(context.version) });
  let response: Response;
  try { response = await fetch(`/api/admin/nfc/evidence?${query}`, { method: "POST", body: prepared.file, headers: { "Content-Type": prepared.file.type }, cache: "no-store" }); }
  catch { throw new Error("ยังยืนยันการอัปโหลดไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่"); }
  if (!response.ok) {
    const messages: Record<number, string> = { 401: "กรุณาเข้าสู่ระบบใหม่", 403: "ไม่มีสิทธิ์อัปโหลดรูปหลักฐาน", 404: "ยังไม่เปิดรับรูปหลักฐาน", 409: "ข้อมูลแท็กเปลี่ยนไป กรุณาโหลดหน้าใหม่", 413: "รูปใหญ่เกินขนาดที่รับได้ กรุณาเลือกรูปอื่น", 429: "ส่งรูปถี่เกินไป กรุณารอสักครู่" };
    throw new Error(messages[response.status] ?? "ยังยืนยันการอัปโหลดไม่ได้ กรุณาลองอีกครั้ง");
  }
  const parsed = z.object({ success: z.literal(true), data: uploadedSchema }).safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error("ยังยืนยันรูปหลักฐานไม่ได้ กรุณาลองอีกครั้ง");
  return { ...parsed.data.data, previewFile: prepared.file };
}

export async function loadNfcEvidencePhoto(assetId: string, tagId: string) {
  z.uuid().parse(assetId); z.uuid().parse(tagId);
  const response = await fetch(`/api/admin/nfc/evidence?${new URLSearchParams({ assetId, tagId })}`, { cache: "no-store" });
  if (!response.ok) throw new Error("ยังเปิดรูปหลักฐานไม่ได้ กรุณาตรวจสิทธิ์แล้วลองใหม่");
  const parsed = z.object({ success: z.literal(true), data: z.object({ url: z.url(), expiresIn: z.literal(60) }) }).safeParse(await response.json());
  if (!parsed.success || new URL(parsed.data.data.url).protocol !== "https:") throw new Error("ลิงก์รูปหลักฐานไม่ถูกต้อง");
  return parsed.data.data.url;
}

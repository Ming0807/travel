import { z } from "zod";
import { NfcEvidenceUploadError } from "@/lib/nfc/evidence-upload-error";
import { prepareAdminImageForUpload } from "@/lib/media/admin-image-upload-client";
import { NFC_EVIDENCE_UPLOAD_MAX_BYTES, NFC_EVIDENCE_STORED_MAX_BYTES } from "@/lib/nfc/evidence-upload-policy";

const contextSchema = z.object({ tagId: z.uuid(), version: z.number().int().positive().safe() });
const uploadedSchema = z.object({ assetId: z.uuid(), width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560), sizeBytes: z.number().int().min(1).max(NFC_EVIDENCE_STORED_MAX_BYTES) });
const pendingFiles = new WeakMap<File, Map<string, Promise<{ file: File; requestId: string }>>>();
export async function uploadNfcEvidencePhoto(file: File, input: { tagId: string; version: number }, onStage: (stage: "preparing" | "uploading") => void) {
  const context = contextSchema.parse(input);
  onStage("preparing");
  const key = `${context.tagId}:${context.version}`;
  let entries = pendingFiles.get(file);
  if (!entries) { entries = new Map(); pendingFiles.set(file, entries); }
  let pending = entries.get(key);
  if (!pending) {
    pending = prepareAdminImageForUpload(file).then(prepared => {
      if (prepared.file.size > NFC_EVIDENCE_UPLOAD_MAX_BYTES) throw new Error("รูปยังใหญ่เกิน 3 MiB หลังปรับขนาด กรุณาเลือกรูปอื่น");
      return { file: prepared.file, requestId: crypto.randomUUID() };
    });
    entries.set(key, pending);
  }
  let prepared: { file: File; requestId: string };
  try { prepared = await pending; } catch (error) { entries.delete(key); throw error; }
  onStage("uploading");
  const query = new URLSearchParams({ tagId: context.tagId, version: String(context.version) });
  let response: Response;
  try { response = await fetch(`/api/admin/nfc/evidence?${query}`, { method: "POST", body: prepared.file, headers: { "Content-Type": prepared.file.type, "X-NFC-Upload-Request-ID": prepared.requestId }, cache: "no-store" }); }
  catch { throw new Error("ยังยืนยันการอัปโหลดไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่"); }
  if (!response.ok) {
    if (response.status === 409) throw new NfcEvidenceUploadError("ข้อมูลแท็กหรือรูปหลักฐานเปลี่ยนไป กรุณายกเลิกรูปนี้และโหลดหน้าใหม่", false);
    if (response.status === 410) throw new NfcEvidenceUploadError("คำขออัปโหลดนี้สิ้นสุดแล้ว กรุณายกเลิกรูปนี้และโหลดหน้าใหม่", false);
    const messages: Record<number, string> = { 401: "กรุณาเข้าสู่ระบบใหม่", 403: "ไม่มีสิทธิ์อัปโหลดรูปหลักฐาน", 404: "ยังไม่เปิดรับรูปหลักฐาน", 409: "ข้อมูลแท็กเปลี่ยนไป กรุณาโหลดหน้าใหม่", 413: "รูปใหญ่เกินขนาดที่รับได้ กรุณาเลือกรูปอื่น", 429: "ส่งรูปถี่เกินไป กรุณารอสักครู่" };
    throw new Error(messages[response.status] ?? "ยังยืนยันการอัปโหลดไม่ได้ กรุณาลองอีกครั้ง");
  }
  const parsed = z.object({ success: z.literal(true), data: uploadedSchema }).safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error("ยังยืนยันรูปหลักฐานไม่ได้ กรุณาลองอีกครั้ง");
  entries.delete(key);
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

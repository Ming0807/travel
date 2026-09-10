import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { nfcEvidenceUploadEnabled, nfcEvidenceRecoveryEnabled } from "@/lib/config/nfc-evidence";
import { readBoundedRequestBody, RequestBodyLimitError } from "@/lib/http/bounded-request-body";
import { NFC_EVIDENCE_UPLOAD_MAX_BYTES } from "@/lib/nfc/evidence-upload-policy";
import { AdminImageUploadError, ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES } from "@/lib/services/admin-image-processing.service";
import { uploadNfcEvidence, getNfcEvidencePreview } from "@/lib/services/nfc-evidence.service";
import { uploadNfcEvidenceRecoverably } from "@/lib/services/nfc-recoverable-source.service";
import { rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
function failure(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status, headers });
}
function handleError(error: unknown) {
  if (error instanceof Error && ["NFC_UPLOAD_EXPIRED", "NFC_UPLOAD_ABANDONED"].includes(error.message)) {
    return failure("NFC_UPLOAD_RETIRED", "คำขออัปโหลดนี้สิ้นสุดแล้ว กรุณายกเลิกรูปนี้และโหลดหน้าใหม่", 410);
  }
  if (error instanceof AdminAuthError) return failure(error.code, "ไม่มีสิทธิ์เข้าถึงรูปหลักฐาน", error.code === "UNAUTHORIZED" ? 401 : 403);
  if (error instanceof RequestBodyLimitError) return failure("IMAGE_SIZE_INVALID", "กรุณาใช้รูปภาพขนาดไม่เกิน 3 MiB", 413);
  if (error instanceof z.ZodError || error instanceof AdminImageUploadError) return failure("IMAGE_INPUT_INVALID", "กรุณาตรวจรูปภาพและข้อมูลแท็กอีกครั้ง", 400);
  if (error instanceof Error && ["NFC_VERSION_CONFLICT", "NFC_EVIDENCE_NOT_AVAILABLE", "NFC_NOT_FOUND",
    "NFC_UPLOAD_NOT_AVAILABLE", "NFC_UPLOAD_TAG_UNAVAILABLE", "NFC_UPLOAD_REQUEST_CONFLICT", "NFC_UPLOAD_FINALIZE_CONFLICT"].includes(error.message)) {
    return failure("NFC_EVIDENCE_UNAVAILABLE", "ข้อมูลแท็กหรือรูปหลักฐานเปลี่ยนไป กรุณาโหลดหน้าใหม่", 409);
  }
  if (error instanceof Error && error.message === "NFC_EVIDENCE_SIZE_INVALID") return failure("IMAGE_SIZE_INVALID", "รูปภาพยังมีขนาดใหญ่เกินไป กรุณาลดขนาดแล้วลองใหม่", 413);
  return failure("NFC_EVIDENCE_FAILED", "ยังดำเนินการกับรูปหลักฐานไม่ได้ กรุณาลองอีกครั้ง", 503);
}
function params(request: Request, keys: string[]) {
  const search = new URL(request.url).searchParams;
  if (Array.from(search.keys()).length !== keys.length || keys.some(key => search.getAll(key).length !== 1)) throw new z.ZodError([]);
  return Object.fromEntries(search);
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure("ORIGIN_DENIED", "ไม่สามารถส่งคำขอจากแหล่งนี้", 403);
  try {
    if (!nfcEvidenceUploadEnabled()) return failure("FEATURE_DISABLED", "ยังไม่เปิดรับรูปหลักฐาน", 404);
    const { adminId } = await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
    if (!rateLimit(`nfc-evidence:${adminId}`, 10, 60_000).success) return failure("RATE_LIMITED", "กรุณารอสักครู่แล้วลองอีกครั้ง", 429);
    const context = z.object({ tagId: z.uuid(), version: z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().positive().safe()) }).parse(params(request, ["tagId", "version"]));
    const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    if (!(ADMIN_IMAGE_UPLOAD_ALLOWED_TYPES as readonly string[]).includes(type) || ![null, "identity"].includes(request.headers.get("content-encoding"))) {
      return failure("IMAGE_TYPE_INVALID", "รองรับไฟล์ JPG, PNG และ WebP เท่านั้น", 415);
    }
    const recovery = nfcEvidenceRecoveryEnabled();
    const requestId = recovery ? z.uuid().parse(request.headers.get("X-NFC-Upload-Request-ID")) : null;
    const buffer = await readBoundedRequestBody(request, NFC_EVIDENCE_UPLOAD_MAX_BYTES);
    const file = { type, size: buffer.byteLength, arrayBuffer: async () => buffer };
    const result = requestId
      ? await uploadNfcEvidenceRecoverably({ ...context, requestId }, file)
      : await uploadNfcEvidence(context, file);
    return NextResponse.json({ success: true, data: result }, { headers });
  } catch (error) { return handleError(error); }
}

export async function GET(request: Request) {
  try {
    if (!nfcEvidenceUploadEnabled()) return failure("FEATURE_DISABLED", "ยังไม่เปิดอ่านรูปหลักฐาน", 404);
    const input = z.object({ assetId: z.uuid(), tagId: z.uuid() }).parse(params(request, ["assetId", "tagId"]));
    const url = await getNfcEvidencePreview(input);
    return NextResponse.json({ success: true, data: { url, expiresIn: 60 } }, { headers });
  } catch (error) { return handleError(error); }
}

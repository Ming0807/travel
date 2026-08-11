import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTouristVisitAccess, TouristAccessError } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";
import { processCertificateGeneration } from "@/lib/services/certificate.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { deletePrivateFile, uploadPrivateFile } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";
import {
  CertificateTemplateResolutionError,
  resolveCertificateTemplate,
} from "@/lib/services/certificate-template.service";

export const runtime = "nodejs";

const MAX_CERTIFICATE_IMAGE_BYTES = 8 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const templateIdSchema = z.number().int().positive();

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

function certificateUrl(path: string) {
  return `/api/media/image?bucket=certificate-files&path=${encodeURIComponent(path)}`;
}

function generateCertificatePath(visitId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `certificates/${year}/${month}/${visitId}/${crypto.randomUUID()}.png`;
}

function parseCertificateImage(raw: unknown) {
  if (typeof raw !== "string" || !raw.startsWith("data:image/png;base64,")) {
    return null;
  }

  const base64Data = raw.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  if (
    buffer.byteLength <= PNG_SIGNATURE.byteLength ||
    buffer.byteLength > MAX_CERTIFICATE_IMAGE_BYTES ||
    !buffer.subarray(0, PNG_SIGNATURE.byteLength).equals(PNG_SIGNATURE)
  ) {
    return null;
  }

  return buffer;
}

export async function POST(request: NextRequest) {
  let certificatePath: string | null = null;
  let ownedVisitId: string | null = null;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const visitIdResult = uuidSchema.safeParse(body.visitId);

    if (!visitIdResult.success) {
      return errorResponse("VISIT_NOT_FOUND", "ไม่พบข้อมูลการเข้าชมนี้", 404);
    }

    const visitId = visitIdResult.data;
    const access = await requireTouristVisitAccess(visitId);
    ownedVisitId = visitId;

    const existingCertificate = await getCertificateByVisitId(visitId);
    if (existingCertificate) {
      const stampResult = await assignStampForVisit(visitId);
      return NextResponse.json({
        success: true,
        certificateId: existingCertificate.certificate_id,
        stamp: stampResult.success ? { status: stampResult.status } : { status: "failed" as const },
        certificateUrl: certificateUrl(existingCertificate.certificate_path),
      });
    }

    const visit = access.visit as { attraction_id?: number | null };
    if (!Number.isInteger(visit.attraction_id) || Number(visit.attraction_id) <= 0) {
      return errorResponse(
        "CERTIFICATE_TEMPLATE_NOT_FOUND",
        "ไม่พบเทมเพลตใบประกาศสำหรับสถานที่นี้",
        409
      );
    }

    const rawTemplateId = body.templateId;
    const requestedTemplateId =
      rawTemplateId === undefined ? undefined : templateIdSchema.safeParse(rawTemplateId);
    if (requestedTemplateId && !requestedTemplateId.success) {
      return errorResponse(
        "CERTIFICATE_TEMPLATE_INVALID",
        "เทมเพลตใบประกาศไม่ถูกต้อง กรุณารีเฟรชแล้วลองอีกครั้ง",
        400
      );
    }

    const language = body.language === "en" ? "en" : "th";
    const template = await resolveCertificateTemplate({
      attractionId: Number(visit.attraction_id),
      language,
      requestedTemplateId: requestedTemplateId?.data,
    });

    const rawPhotoId = typeof body.photoId === "string" && body.photoId.trim() ? body.photoId : null;
    if (rawPhotoId) {
      const photoIdResult = uuidSchema.safeParse(rawPhotoId);
      if (!photoIdResult.success) {
        return errorResponse("PHOTO_NOT_FOUND_FOR_VISIT", "ไม่พบรูปภาพสำหรับการเข้าชมนี้", 400);
      }

      const photo = await getPhotoById(photoIdResult.data);
      if (!photo || photo.visit_id !== visitId) {
        return errorResponse("PHOTO_NOT_FOUND_FOR_VISIT", "ไม่พบรูปภาพสำหรับการเข้าชมนี้", 400);
      }
    }

    const buffer = parseCertificateImage(body.base64Image);
    if (!buffer) {
      return errorResponse("CERTIFICATE_IMAGE_INVALID", "ไม่สามารถสร้างภาพใบประกาศได้ กรุณาลองอีกครั้ง", 400);
    }

    const logicalPath = generateCertificatePath(visitId);
    const uploaded = await uploadPrivateFile({
      bucket: "certificate-files",
      path: logicalPath,
      data: buffer,
      contentType: "image/png",
    });
    certificatePath = uploaded.storagePath;

    const certificateId = await processCertificateGeneration({
      visitId,
      templateId: template.templateId,
      ...(rawPhotoId ? { photoId: rawPhotoId } : {}),
      certificatePath,
    });

    const stampResult = await assignStampForVisit(visitId);

    return NextResponse.json({
      success: true,
      certificateId,
      stamp: stampResult.success ? { status: stampResult.status } : { status: "failed" as const },
      certificateUrl: certificateUrl(certificatePath),
    });
  } catch (error) {
    if (certificatePath && ownedVisitId) {
      try {
        const winningCertificate = await getCertificateByVisitId(ownedVisitId);
        if (winningCertificate) {
          if (winningCertificate.certificate_path !== certificatePath) {
            await deletePrivateFile({ bucket: "certificate-files", path: certificatePath });
          }
          const stampResult = await assignStampForVisit(ownedVisitId);
          return NextResponse.json({
            success: true,
            certificateId: winningCertificate.certificate_id,
            stamp: stampResult.success ? { status: stampResult.status } : { status: "failed" as const },
            certificateUrl: certificateUrl(winningCertificate.certificate_path),
          });
        }
      } catch (recoveryError) {
        console.warn(
          "Certificate generation recovery failed:",
          recoveryError instanceof Error ? recoveryError.message : "unknown error",
        );
      }
    }

    if (certificatePath) {
      try {
        await deletePrivateFile({ bucket: "certificate-files", path: certificatePath });
      } catch (cleanupError) {
        console.error(
          "Certificate storage cleanup failed:",
          cleanupError instanceof Error ? cleanupError.message : "unknown error",
        );
      }
    }

    if (error instanceof TouristAccessError) {
      return errorResponse(error.code, error.message, error.code === "VISIT_ACCESS_DENIED" ? 403 : 404);
    }

    if (
      error instanceof CertificateTemplateResolutionError ||
      (error instanceof Error && error.message === "CERTIFICATE_TEMPLATE_NOT_FOUND")
    ) {
      return errorResponse(
        "CERTIFICATE_TEMPLATE_NOT_FOUND",
        "เทมเพลตใบประกาศนี้ไม่พร้อมใช้งาน กรุณารีเฟรชแล้วลองอีกครั้ง",
        409
      );
    }

    console.error("Certificate generation failed:", error instanceof Error ? error.message : "unknown error");
    return errorResponse("CERTIFICATE_GENERATION_FAILED", "สร้างใบประกาศไม่สำเร็จ กรุณาลองอีกครั้ง", 500);
  }
}

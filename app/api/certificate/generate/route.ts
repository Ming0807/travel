import { NextRequest, NextResponse } from "next/server";
import { processCertificateGeneration } from "@/lib/services/certificate.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";
import { deletePrivateFile, uploadPrivateFile } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";
import { rateLimit } from "@/lib/utils/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const certificateGenerateSchema = z.object({
  visitId: uuidSchema,
  photoId: uuidSchema.optional().nullable(),
  base64Image: z.string().startsWith("data:image/png;base64,")
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip, 5, 60 * 1000);

    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const parsed = certificateGenerateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" }, { status: 400 });
    }

    const { visitId, photoId, base64Image } = parsed.data;
    await requireTouristVisitAccess(visitId);

    if (photoId) {
      const photo = await getPhotoById(photoId);
      if (!photo || photo.visit_id !== visitId) {
        return NextResponse.json({ error: "ไม่พบรูปภาพของการเข้าชมนี้" }, { status: 404 });
      }
    }

    const existingCertificate = await getCertificateByVisitId(visitId);
    if (existingCertificate) {
      const stampResult = await assignStampForVisit(visitId);
      return NextResponse.json({
        success: true,
        certificateId: existingCertificate.certificate_id,
        stamp: stampResult
      });
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "รูปใบประกาศมีขนาดใหญ่เกินไป" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const logicalPath = `certificates/${year}/${month}/${visitId}/${uuid}.png`;

    let storagePath: string;
    try {
      const uploaded = await uploadPrivateFile({
        bucket: "certificate-files",
        path: logicalPath,
        data: buffer,
        contentType: "image/png"
      });
      storagePath = uploaded.storagePath;
    } catch (error) {
      console.error("Certificate storage upload error:", error);
      return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
    }

    let certId: string;
    try {
      certId = await processCertificateGeneration({
        visitId,
        templateId: 1,
        photoId: photoId || undefined,
        certificatePath: storagePath
      });
    } catch (error) {
      try {
        await deletePrivateFile({ bucket: "certificate-files", path: storagePath });
      } catch (cleanupError) {
        console.error("Certificate storage cleanup failed:", cleanupError);
      }
      throw error;
    }

    const stampResult = await assignStampForVisit(visitId);

    return NextResponse.json({
      success: true,
      certificateId: certId,
      stamp: stampResult
    });
  } catch (error: unknown) {
    console.error("Certificate Generation API error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}

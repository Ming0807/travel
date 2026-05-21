import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { processCertificateGeneration } from "@/lib/services/certificate.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";
import { uuidSchema } from "@/lib/validation/common";
import { rateLimit } from "@/lib/utils/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const certificateGenerateSchema = z.object({
  visitId: uuidSchema,
  photoId: uuidSchema.optional().nullable(),
  base64Image: z.string().startsWith("data:image/png;base64,")
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limit = rateLimit(ip, 5, 60 * 1000); // 5 generations per minute per IP
    
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

    // Convert base64 to buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "ข้อมูลรูปใบประกาศมีขนาดใหญ่เกินไป" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const storagePath = `certificates/${year}/${month}/${visitId}/${uuid}.png`;

    const supabase = createSupabaseServiceRoleClient();

    // Upload certificate to Supabase
    const { error: uploadError } = await supabase.storage
      .from("certificate-files")
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: false
      });

    if (uploadError) {
      console.error("Certificate storage upload error:", uploadError);
      return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
    }

    // In MVP, we might mock templateId as 1.
    const certId = await processCertificateGeneration({
      visitId,
      templateId: 1, 
      photoId: photoId || undefined,
      certificatePath: storagePath
    });

    // Assign stamp
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

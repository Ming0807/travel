import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTouristVisitAccess, TouristAccessError } from "@/lib/auth/guards";
import { resolveSafeImageContentType } from "@/lib/media/storage-paths";
import {
  CertificateTemplateResolutionError,
  resolveCertificateTemplate,
} from "@/lib/services/certificate-template.service";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const templateIdSchema = z.coerce.number().int().positive();

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const visitId = uuidSchema.safeParse(request.nextUrl.searchParams.get("visitId"));
    const templateId = templateIdSchema.safeParse(
      request.nextUrl.searchParams.get("templateId")
    );
    if (!visitId.success || !templateId.success) {
      return errorResponse("ข้อมูลใบประกาศไม่ถูกต้อง", 400);
    }

    const access = await requireTouristVisitAccess(visitId.data);
    const visit = access.visit as { attraction_id?: number | null };
    if (!Number.isInteger(visit.attraction_id) || Number(visit.attraction_id) <= 0) {
      return errorResponse("ไม่พบเทมเพลตใบประกาศ", 404);
    }

    const template = await resolveCertificateTemplate({
      attractionId: Number(visit.attraction_id),
      language: "th",
      requestedTemplateId: templateId.data,
    });
    if (!template.backgroundPath) {
      return errorResponse("เทมเพลตนี้ไม่มีภาพพื้นหลัง", 404);
    }

    const signedUrl = await createPrivateFileSignedUrl(
      "southern-border-tourism",
      template.backgroundPath,
      10 * 60
    );
    const upstream = await fetch(signedUrl, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) return errorResponse("ไม่สามารถโหลดภาพเทมเพลตได้", 502);

    const contentType = resolveSafeImageContentType(
      upstream.headers.get("content-type"),
      template.backgroundPath
    );
    if (!contentType) return errorResponse("ไฟล์เทมเพลตไม่ใช่รูปภาพที่รองรับ", 415);

    return new NextResponse(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof TouristAccessError) {
      return errorResponse(
        error.message,
        error.code === "VISIT_ACCESS_DENIED" ? 403 : 404
      );
    }
    if (error instanceof CertificateTemplateResolutionError) {
      return errorResponse("ไม่พบเทมเพลตใบประกาศ", 404);
    }
    console.error(
      "Certificate template image failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return errorResponse("ไม่สามารถโหลดภาพเทมเพลตได้", 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireTouristVisitAccess, TouristAccessError } from "@/lib/auth/guards";
import { resolveSafeImageContentType } from "@/lib/media/storage-paths";
import {
  getCertificateByVisitId,
  incrementCertificateDownload,
} from "@/lib/repositories/certificate.repository";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const visitIdResult = uuidSchema.safeParse(request.nextUrl.searchParams.get("visitId"));
  if (!visitIdResult.success) {
    return errorResponse("INVALID_VISIT_ID", "ข้อมูลการเข้าชมไม่ถูกต้อง", 400);
  }

  const visitId = visitIdResult.data;

  try {
    await requireTouristVisitAccess(visitId);
    const certificate = await getCertificateByVisitId(visitId);
    if (!certificate?.certificate_path) {
      return errorResponse("CERTIFICATE_NOT_FOUND", "ยังไม่พบใบประกาศของการเข้าชมนี้", 404);
    }

    const signedUrl = await createPrivateFileSignedUrl(
      "certificate-files",
      certificate.certificate_path,
      300,
    );
    const upstream = await fetch(signedUrl, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) {
      return errorResponse(
        "CERTIFICATE_FILE_UNAVAILABLE",
        "ไม่สามารถดาวน์โหลดใบประกาศได้ในขณะนี้ กรุณาลองใหม่",
        502,
      );
    }

    const contentType = resolveSafeImageContentType(
      upstream.headers.get("content-type"),
      certificate.certificate_path,
    );
    if (!contentType?.startsWith("image/")) {
      return errorResponse(
        "CERTIFICATE_FILE_INVALID",
        "ไฟล์ใบประกาศไม่ถูกต้อง กรุณาลองสร้างใหม่",
        502,
      );
    }

    const bytes = await upstream.arrayBuffer();
    try {
      await incrementCertificateDownload(certificate.certificate_id);
    } catch (error) {
      console.warn(
        "Certificate download count update failed:",
        error instanceof Error ? error.message : "unknown error",
      );
    }

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="travel-memory-${visitId}.png"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof TouristAccessError) {
      return errorResponse(
        error.code,
        error.message,
        error.code === "VISIT_ACCESS_DENIED" ? 403 : 404,
      );
    }

    console.error(
      "Certificate download failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return errorResponse(
      "CERTIFICATE_DOWNLOAD_FAILED",
      "ไม่สามารถดาวน์โหลดใบประกาศได้ในขณะนี้ กรุณาลองใหม่",
      500,
    );
  }
}

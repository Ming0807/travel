import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTouristVisitAccess, TouristAccessError } from "@/lib/auth/guards";
import {
  encodeStoragePathSegments,
  normalizeSiteMediaStoragePath,
  resolveSafeImageContentType,
} from "@/lib/media/storage-paths";
import {
  CertificateTemplateResolutionError,
  resolveCertificateTemplate,
} from "@/lib/services/certificate-template.service";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const templateIdSchema = z.coerce.number().int().positive();
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==",
  "base64"
);

type TemplateImage = {
  bytes: ArrayBuffer;
  contentType: string;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function fetchSupportedImage(url: string, storagePath: string): Promise<TemplateImage | null> {
  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) return null;

    const contentType = resolveSafeImageContentType(
      upstream.headers.get("content-type"),
      storagePath
    );
    if (!contentType) return null;

    return {
      bytes: await upstream.arrayBuffer(),
      contentType,
    };
  } catch {
    return null;
  }
}

async function loadTemplateImage(storagePath: string): Promise<TemplateImage | null> {
  try {
    const signedUrl = await createPrivateFileSignedUrl(
      "southern-border-tourism",
      storagePath,
      10 * 60
    );
    const privateImage = await fetchSupportedImage(signedUrl, storagePath);
    if (privateImage) return privateImage;
  } catch {
    // Legacy templates may live in the public site-media bucket.
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!supabaseUrl) return null;

  try {
    const legacyPath = normalizeSiteMediaStoragePath(storagePath);
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/site-media/${encodeStoragePathSegments(
      legacyPath
    )}`;
    return await fetchSupportedImage(publicUrl, legacyPath);
  } catch {
    return null;
  }
}

function imageResponse(image: TemplateImage) {
  return new NextResponse(image.bytes, {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function fallbackImageResponse() {
  return new NextResponse(TRANSPARENT_PNG, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Certificate-Template-Fallback": "1",
    },
  });
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

    const image = await loadTemplateImage(template.backgroundPath);
    if (image) return imageResponse(image);

    console.warn("Certificate template background unavailable; using fallback", {
      templateId: template.templateId,
    });
    return fallbackImageResponse();
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

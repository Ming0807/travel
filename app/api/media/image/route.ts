import { NextRequest, NextResponse } from "next/server";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByPath } from "@/lib/repositories/certificate.repository";
import { getPhotoByStoragePath } from "@/lib/repositories/visit-photo.repository";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==";
const PLACEHOLDER_PNG = Buffer.from(PLACEHOLDER_PNG_BASE64, "base64");

type PrivateMediaBucket = "visit-photos" | "certificate-files";

function placeholderResponse() {
  return new NextResponse(PLACEHOLDER_PNG, {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "no-cache" },
  });
}

function resolvePrivateBucket(rawBucket: string | null, path: string): PrivateMediaBucket | null {
  if (rawBucket === "visit-photos" || rawBucket === "certificate-files") {
    return rawBucket;
  }

  if (path.startsWith("certificates/")) {
    return "certificate-files";
  }

  if (path.startsWith("visit-photos/") || path.startsWith("visits/")) {
    return "visit-photos";
  }

  return null;
}

async function requirePrivateMediaAccess(bucket: PrivateMediaBucket | null, path: string) {
  if (!bucket) {
    return;
  }

  if (bucket === "visit-photos") {
    const photo = await getPhotoByStoragePath(path);
    if (!photo) throw new Error("PRIVATE_MEDIA_NOT_FOUND");
    await requireTouristVisitAccess(photo.visit_id);
    return;
  }

  const certificate = await getCertificateByPath(path);
  if (!certificate) throw new Error("PRIVATE_MEDIA_NOT_FOUND");
  await requireTouristVisitAccess(certificate.visit_id);
}

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path");
    if (!path) {
      return placeholderResponse();
    }

    const bucket = resolvePrivateBucket(req.nextUrl.searchParams.get("bucket"), path);
    await requirePrivateMediaAccess(bucket, path);

    if (!bucket && !path.startsWith("cloudinary:")) {
      return placeholderResponse();
    }

    const signedUrl = await createPrivateFileSignedUrl(bucket ?? "visit-photos", path, 3600);
    const upstreamResp = await fetch(signedUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!upstreamResp.ok) {
      return placeholderResponse();
    }

    const contentType = upstreamResp.headers.get("content-type") || "image/jpeg";
    const bytes = Buffer.from(await upstreamResp.arrayBuffer());

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": bucket ? "private, max-age=300" : "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message !== "SIGNED_URL_CREATE_FAILED") {
      console.error("[Media Image] Unexpected error:", error.message);
    }
    return placeholderResponse();
  }
}

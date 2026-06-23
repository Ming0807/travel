import { NextRequest, NextResponse } from "next/server";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { resolveSafeImageContentType } from "@/lib/media/storage-paths";
import { getCertificateByPath } from "@/lib/repositories/certificate.repository";
import { getPublicContentMediaSource } from "@/lib/repositories/public-media.repository";
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

    const privateBucket = resolvePrivateBucket(req.nextUrl.searchParams.get("bucket"), path);
    let bucket: PrivateMediaBucket | null = privateBucket;
    let storagePath = path;
    let cacheControl = "private, max-age=300";

    if (privateBucket) {
      await requirePrivateMediaAccess(privateBucket, path);
    } else {
      const publicContentMedia = await getPublicContentMediaSource(path);
      if (!publicContentMedia) {
        return placeholderResponse();
      }

      bucket = publicContentMedia.bucket;
      storagePath = publicContentMedia.storagePath;
      cacheControl = "public, max-age=31536000, immutable";
    }

    if (!bucket) {
      return placeholderResponse();
    }

    const signedUrl = await createPrivateFileSignedUrl(bucket, storagePath, 3600);
    const upstreamResp = await fetch(signedUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!upstreamResp.ok) {
      return placeholderResponse();
    }

    const contentType = resolveSafeImageContentType(upstreamResp.headers.get("content-type"), storagePath);
    if (!contentType) {
      return placeholderResponse();
    }

    const bytes = Buffer.from(await upstreamResp.arrayBuffer());

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message !== "SIGNED_URL_CREATE_FAILED") {
      console.error("[Media Image] Unexpected error:", error.message);
    }
    return placeholderResponse();
  }
}

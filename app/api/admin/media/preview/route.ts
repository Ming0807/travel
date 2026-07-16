import { NextRequest, NextResponse } from "next/server";
import { createPrivateFileSignedUrl, type PrivateBucketName } from "@/lib/storage/private-files";
import { requireAdmin } from "@/lib/auth/guards";
import {
  isPublicContentMediaReference,
  normalizePublicContentMediaReference,
  normalizeSiteMediaStoragePath,
  resolveSafeImageContentType,
  siteMediaImageUrl,
} from "@/lib/media/storage-paths";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(); // Any admin can preview media
    
    const searchParams = req.nextUrl.searchParams;
    const bucket = searchParams.get("bucket") as PrivateBucketName;
    const path = searchParams.get("path");

    if (!bucket || !path) {
      return new NextResponse("Missing bucket or path", { status: 400 });
    }

    if (isPublicContentMediaReference(path)) {
      const storagePath = normalizePublicContentMediaReference(path);
      const signedUrl = await createPrivateFileSignedUrl("visit-photos", storagePath, 60 * 60);
      return NextResponse.redirect(signedUrl);
    }

    try {
      const mediaUrl = siteMediaImageUrl(normalizeSiteMediaStoragePath(path));
      if (mediaUrl) {
        const resolvedMediaUrl = new URL(mediaUrl, req.url);
        const upstream = await fetch(resolvedMediaUrl, {
          signal: AbortSignal.timeout(8000),
        });
        if (!upstream.ok) throw new Error("MEDIA_PREVIEW_UPSTREAM_FAILED");
        const contentType = resolveSafeImageContentType(
          upstream.headers.get("content-type"),
          path
        );
        if (!contentType) throw new Error("MEDIA_PREVIEW_INVALID_CONTENT_TYPE");
        return new NextResponse(await upstream.arrayBuffer(), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "private, max-age=300",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    } catch {
      // Not a public site-media path; try private storage below.
    }

    try {
      const signedUrl = await createPrivateFileSignedUrl(bucket, path, 60 * 60); // 1 hour TTL
      return NextResponse.redirect(signedUrl);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "SIGNED_URL_CREATE_FAILED") {
        // Fallback for public buckets or old non-private files
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
        return NextResponse.redirect(publicUrl);
      }
      throw e;
    }
  } catch (error) {
    console.error("Media preview error:", error);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}

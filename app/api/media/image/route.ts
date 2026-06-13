import { NextRequest, NextResponse } from "next/server";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal valid 1×1 pixel PNG — safe for Next.js image optimizer
const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==";
const PLACEHOLDER_PNG = Buffer.from(PLACEHOLDER_PNG_BASE64, "base64");

function placeholderResponse() {
  return new NextResponse(PLACEHOLDER_PNG, {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "no-cache" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path");
    if (!path) {
      return placeholderResponse();
    }

    const bucket = path.startsWith("certificates/") ? "certificate-files" : "visit-photos";
    const signedUrl = await createPrivateFileSignedUrl(bucket, path, 3600);

    // Proxy the image bytes so Next.js image optimizer receives a real image,
    // not a redirect (which it can't follow for signed URLs with query strings)
    const upstreamResp = await fetch(signedUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!upstreamResp.ok) {
      return placeholderResponse();
    }

    const contentType = upstreamResp.headers.get("content-type") || "image/jpeg";
    const blob = await upstreamResp.blob();

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message !== "SIGNED_URL_CREATE_FAILED") {
      console.error("[Media Image] Unexpected error:", error.message);
    }
    return placeholderResponse();
  }
}

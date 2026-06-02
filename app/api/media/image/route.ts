import { NextRequest, NextResponse } from "next/server";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#f0ebe1" width="400" height="300"/>
  <text fill="#99938a" font-family="system-ui" font-size="14" text-anchor="middle" x="200" y="140">Image not available</text>
  <text fill="#bfb9ae" font-family="system-ui" font-size="11" text-anchor="middle" x="200" y="165">This media has not been uploaded yet.</text>
</svg>`;

function placeholderResponse() {
  return new NextResponse(PLACEHOLDER_SVG, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache" },
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
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    // File not found is expected (seed data paths, not-yet-uploaded files)
    // Log other unexpected errors so operators can investigate
    if (error instanceof Error && error.message !== "SIGNED_URL_CREATE_FAILED") {
      console.error("[Media Image] Unexpected error:", error.message);
    }
    // Always return a placeholder SVG so the frontend UI is never broken by a missing image
    return placeholderResponse();
  }
}

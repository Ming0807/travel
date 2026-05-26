import { NextRequest, NextResponse } from "next/server";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path");
    if (!path) {
      return new NextResponse("Missing path parameter", { status: 400 });
    }

    // Determine the bucket based on the path if possible, or default to visit-photos
    // Most attraction media is in visit-photos
    const signedUrl = await createPrivateFileSignedUrl("visit-photos", path, 3600);
    
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Media Image API Error:", error);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}

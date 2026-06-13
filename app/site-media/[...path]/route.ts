import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zaahkhmnqcczswxrcuhw.supabase.co";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#f0ebe1" width="400" height="300"/>
  <text fill="#99938a" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle" x="200" y="145">Image not available</text>
  <text fill="#99938a" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" x="200" y="165">รูปภาพไม่พร้อมใช้งาน</text>
</svg>`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const storagePath = path.join("/");

  try {
    const supabaseResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/site-media/${storagePath}`,
      { signal: AbortSignal.timeout(8000) },
    );

    if (!supabaseResp.ok) {
      return new NextResponse(PLACEHOLDER_SVG, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    const blob = await supabaseResp.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": supabaseResp.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(PLACEHOLDER_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    });
  }
}

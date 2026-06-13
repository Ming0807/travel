import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zaahkhmnqcczswxrcuhw.supabase.co";

// Minimal valid 1×1 pixel PNG (transparent) — always accepted by Next.js image optimizer
const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==";
const PLACEHOLDER_PNG = Buffer.from(PLACEHOLDER_PNG_BASE64, "base64");

function assertSafeStoragePath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("..")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("\\")) throw new Error("INVALID_STORAGE_PATH");
  if (/^https?:\/\//i.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.startsWith("/")) throw new Error("INVALID_STORAGE_PATH");
  // Block control characters and percent-encoded traversal
  if (/[\x00-\x1f\x7f]/.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  if (/%2[ef]/i.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  return trimmed;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  let storagePath: string;
  try {
    storagePath = assertSafeStoragePath(path.join("/"));
  } catch {
    return new NextResponse(PLACEHOLDER_PNG, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  }

  try {
    const supabaseResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/site-media/${storagePath}`,
      { signal: AbortSignal.timeout(8000) },
    );

    if (!supabaseResp.ok) {
      return new NextResponse(PLACEHOLDER_PNG, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
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
    return new NextResponse(PLACEHOLDER_PNG, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  }
}

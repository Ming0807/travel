import { NextRequest, NextResponse } from "next/server";
import {
  encodeStoragePathSegments,
  normalizeSiteMediaStoragePath,
  resolveSafeImageContentType,
} from "@/lib/media/storage-paths";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zaahkhmnqcczswxrcuhw.supabase.co";

// Minimal valid 1×1 pixel PNG (transparent) — always accepted by Next.js image optimizer
const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==";
const PLACEHOLDER_PNG = Buffer.from(PLACEHOLDER_PNG_BASE64, "base64");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  let storagePath: string;
  try {
    storagePath = normalizeSiteMediaStoragePath(path.join("/"));
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
      `${SUPABASE_URL}/storage/v1/object/public/site-media/${encodeStoragePathSegments(storagePath)}`,
      { signal: AbortSignal.timeout(5000) },
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

    const contentType = resolveSafeImageContentType(supabaseResp.headers.get("content-type"), storagePath);
    if (!contentType) {
      return new NextResponse(PLACEHOLDER_PNG, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    const bytes = Buffer.from(await supabaseResp.arrayBuffer());
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
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

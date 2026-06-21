import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { findAdminMediaReferences } from "@/lib/repositories/admin-media-references.repository";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("media.read");

    const { searchParams } = new URL(req.url);
    const storagePath = searchParams.get("storagePath");

    if (!storagePath) {
      return NextResponse.json({ error: "storagePath is required" }, { status: 400 });
    }

    const references = await findAdminMediaReferences(storagePath);
    return NextResponse.json({ references });
  } catch (error) {
    console.error("Media references fetch error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    return NextResponse.json({ error: "Could not load media references." }, { status: 500 });
  }
}

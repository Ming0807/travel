import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { findAdminMediaReferences } from "@/lib/repositories/admin-media-references.repository";

export const runtime = "nodejs";

// GET — fetch used-in references for a media asset (no mutation)
// Supports both:
//   /api/admin/media/[id]          — lookup by media_assets.id (MediaLibrary)
//   /api/admin/media/[id]?storagePath=... — lookup by storage_path (MediaManager from content_media)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("media.read");
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const storagePathFromQuery = searchParams.get("storagePath");

    const adminSupabase = createSupabaseServiceRoleClient();

    let storagePath = storagePathFromQuery;

    // If no storagePath query param, look up by media_assets.id
    if (!storagePath) {
      const { data: asset, error: fetchError } = await adminSupabase
        .from("media_assets")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (fetchError || !asset) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
      }
      storagePath = asset.storage_path;
    }

    if (!storagePath) {
      return NextResponse.json({ error: "Storage path not found" }, { status: 404 });
    }

    const references = await findAdminMediaReferences(storagePath);
    return NextResponse.json({ references });
  } catch (error) {
    console.error("Media references fetch error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load media references." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guard = await requirePermission("media.deactivate");

    const adminSupabase = createSupabaseServiceRoleClient();

    // Fetch the asset first to get the storage path
    const { data: asset, error: fetchError } = await adminSupabase
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check used-in references before archiving
    const references = await findAdminMediaReferences(asset.storage_path);

    // Archive instead of hard delete — set lifecycle_status to 'archived'
    const { error: updateError } = await adminSupabase
      .from("media_assets")
      .update({
        lifecycle_status: "archived",
        archived_at: new Date().toISOString(),
        archived_by: guard.authUserId,
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, references });

  } catch (error) {
    console.error("Media archive error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    return NextResponse.json(
      { error: "Archive failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirePermission("media.activate");

    const adminSupabase = createSupabaseServiceRoleClient();

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "unarchive") {
      const { error: updateError } = await adminSupabase
        .from("media_assets")
        .update({
          lifecycle_status: "active",
          archived_at: null,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Media update error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    return NextResponse.json(
      { error: "Action failed. Please try again." },
      { status: 500 }
    );
  }
}

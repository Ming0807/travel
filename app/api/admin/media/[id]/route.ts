import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requirePermission("media.delete");

    const adminSupabase = createSupabaseServiceRoleClient();

    // Fetch the asset first to get the storage path
    const { data: asset, error: fetchError } = await adminSupabase
      .from("media_assets" as any)
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from Storage
    const { error: storageError } = await adminSupabase.storage
      .from("site-media")
      .remove([asset.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // We continue to delete from DB even if storage fails (e.g. file already missing)
    }

    // Delete from Database
    const { error: dbError } = await adminSupabase
      .from("media_assets" as any)
      .delete()
      .eq("id", id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Media delete error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    return NextResponse.json(
      { error: "Delete failed. Please try again." },
      { status: 500 }
    );
  }
}

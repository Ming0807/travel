import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const MAX_SIZE_MB = 10;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Minimal check, ideally should check admin roles
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = supabase
      .from("media_assets" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Construct public URLs
    const assets = data.map((asset: any) => {
      const { data: urlData } = supabase.storage
        .from("site-media")
        .getPublicUrl(asset.storage_path);
      
      return {
        ...asset,
        url: urlData.publicUrl
      };
    });

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error("Error fetching media assets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string || "General";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_SIZE_MB}MB limit.` },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/svg+xml": "svg",
    };
    const ext = extensionMap[file.type] || "jpg";
    
    const originalName = file.name || "upload";
    const uuid = crypto.randomUUID();
    const safeCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const storagePath = `${safeCategory}/${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use Service Role to upload and bypass RLS if needed, though Admin should have access
    const adminSupabase = createSupabaseServiceRoleClient();
    
    // Upload to Storage
    const { error: uploadError } = await adminSupabase.storage
      .from("site-media")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Insert to Database
    const { data: asset, error: dbError } = await adminSupabase
      .from("media_assets" as any)
      .insert({
        file_name: originalName,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        category: category,
        uploaded_by: session.user.id
      })
      .select()
      .single();

    if (dbError) {
      // Rollback storage if DB fails
      await adminSupabase.storage.from("site-media").remove([storagePath]);
      throw dbError;
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from("site-media")
      .getPublicUrl(asset.storage_path);

    return NextResponse.json({
      success: true,
      asset: {
        ...asset,
        url: urlData.publicUrl
      }
    });

  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

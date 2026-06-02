import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with Sharp
    // Resize to max width 1200, format to webp, 80% quality
    const processedBuffer = await sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `tourist-stories/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

    const supabase = createSupabaseServiceRoleClient();
    
    // Upload to Supabase Storage (site-media bucket)
    const { data, error } = await supabase.storage
      .from("site-media")
      .upload(fileName, processedBuffer, {
        contentType: "image/webp",
        upsert: false
      });

    if (error) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // Return the public URL
    const { data: publicUrlData } = supabase.storage
      .from("site-media")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

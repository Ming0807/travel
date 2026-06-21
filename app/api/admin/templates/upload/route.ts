import { NextRequest, NextResponse } from "next/server";
import { uploadPrivateFile } from "@/lib/storage/private-files";
import { requirePermission } from "@/lib/auth/guards";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const guard = await requirePermission("certificate.template_manage");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const templateName = formData.get("template_name") as string;
    const language = formData.get("language") as string;
    const theme = formData.get("theme") as string;

    if (!file || !templateName || !language || !theme) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} is not allowed. Use JPEG or PNG.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_SIZE_MB}MB limit.` },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
    };
    const ext = extensionMap[file.type] || "jpg";

    const uuid = crypto.randomUUID();
    const logicalPath = `certificate-templates/${uuid}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadPrivateFile({
      bucket: "southern-border-tourism", // use standard bucket for templates
      path: logicalPath,
      data: buffer,
      contentType: file.type,
    });

    const supabase = createSupabaseServiceRoleClient();
    
    const layoutConfig = {
      theme,
      photo: "center",
      language,
    };

    const { data, error } = await supabase
      .from("certificate_templates")
      .insert({
        template_name: templateName,
        background_path: uploaded.storagePath,
        layout_config_json: layoutConfig,
        language,
        is_default: false,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw new Error("Failed to save template record");
    }

    await logAdminAction({
      adminId: guard.adminId,
      action: "certificate.template_created",
      entityType: "certificate_template",
      entityId: String(data.template_id),
      details: { name: templateName, path: uploaded.storagePath }
    });

    return NextResponse.json({
      success: true,
      templateId: data.template_id
    });
  } catch (error: any) {
    console.error("Admin template upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

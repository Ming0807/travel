import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import {
  AdminImageUploadError,
  ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
  CERTIFICATE_TEMPLATE_ALLOWED_TYPES,
  processAdminImageToWebp,
} from "@/lib/services/admin-image-processing.service";
import { deletePrivateFile, uploadPrivateFile } from "@/lib/storage/private-files";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { certificateTemplateUploadFieldsSchema } from "@/lib/validation/admin-certificate-template";

export const runtime = "nodejs";

const TEMPLATE_MAX_WIDTH = 2400;
const TEMPLATE_QUALITY = 90;

function templateUploadMessage(error: AdminImageUploadError) {
  switch (error.code) {
    case "IMAGE_EMPTY":
      return "กรุณาเลือกไฟล์ภาพเทมเพลตที่ไม่ว่างเปล่า";
    case "IMAGE_INVALID_TYPE":
      return "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP";
    case "IMAGE_TOO_LARGE":
      return `ไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน ${ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB}MB`;
    case "IMAGE_TOO_MANY_PIXELS":
      return "ภาพเทมเพลตละเอียดเกินไป กรุณาลดขนาดรูปก่อนอัปโหลด";
    default:
      return "ไม่สามารถประมวลผลภาพเทมเพลตได้ กรุณาใช้ไฟล์ JPG, PNG หรือ WebP อื่น";
  }
}

export async function POST(req: NextRequest) {
  let uploadedPath: string | null = null;

  try {
    const guard = await requirePermission("certificate.template_manage");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const metadata = certificateTemplateUploadFieldsSchema.safeParse({
      templateName: formData.get("template_name"),
      language: formData.get("language"),
      theme: formData.get("theme"),
    });

    if (!file || !metadata.success) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลเทมเพลตและเลือกไฟล์ภาพให้ครบ" },
        { status: 400 },
      );
    }
    const { templateName, language, theme } = metadata.data;

    const processed = await processAdminImageToWebp(file, {
      allowedMimeTypes: CERTIFICATE_TEMPLATE_ALLOWED_TYPES,
      maxSizeMb: ADMIN_IMAGE_UPLOAD_MAX_SIZE_MB,
      maxWidth: TEMPLATE_MAX_WIDTH,
      quality: TEMPLATE_QUALITY,
    });

    const logicalPath = `certificate-templates/${crypto.randomUUID()}.webp`;
    const uploaded = await uploadPrivateFile({
      bucket: "southern-border-tourism",
      path: logicalPath,
      data: processed.buffer,
      contentType: processed.contentType,
    });
    uploadedPath = uploaded.storagePath;

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
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      await deletePrivateFile({ bucket: "southern-border-tourism", path: uploaded.storagePath });
      uploadedPath = null;
      throw new Error("Failed to save template record");
    }

    await logAdminAction({
      adminId: guard.adminId,
      action: "certificate.template_created",
      entityType: "certificate_template",
      entityId: String(data.template_id),
      details: {
        name: templateName,
        contentType: processed.contentType,
        sizeBytes: uploaded.sizeBytes,
        width: processed.width,
        height: processed.height,
        language,
        theme,
      },
    });

    return NextResponse.json({
      success: true,
      templateId: data.template_id,
    });
  } catch (error) {
    console.error("Admin template upload error:", error);

    if (uploadedPath) {
      try {
        await deletePrivateFile({ bucket: "southern-border-tourism", path: uploadedPath });
      } catch (cleanupError) {
        console.error("Template upload cleanup failed:", cleanupError);
      }
    }

    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 },
      );
    }
    if (error instanceof AdminImageUploadError) {
      return NextResponse.json(
        { success: false, error: templateUploadMessage(error) },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "ไม่สามารถอัปโหลดเทมเพลตได้ กรุณาลองใหม่" },
      { status: 500 },
    );
  }
}

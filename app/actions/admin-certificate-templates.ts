"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requirePermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/repositories/admin-audit.repository";
import { deletePrivateFile } from "@/lib/storage/private-files";
import {
  certificateTemplateLayoutInputSchema,
  getCertificateLayoutWarnings,
} from "@/lib/certificate/certificate-template-layout";

const templateIdSchema = z.number().int().positive();
const attractionSearchSchema = z.string().trim().min(2).max(100);

function parseTemplateId(templateId: number): number {
  const parsed = templateIdSchema.safeParse(templateId);
  if (!parsed.success) throw new Error("รหัสเทมเพลตไม่ถูกต้อง");
  return parsed.data;
}

export async function searchCertificateTemplateAttractions(query: string) {
  await requirePermission("certificate.template_manage");
  const parsed = attractionSearchSchema.safeParse(query);
  if (!parsed.success) {
    return { success: false as const, error: "กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร" };
  }

  const escaped = parsed.data.replace(/[\\%_]/g, "\\$&").replace(/,/g, " ");
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attractions")
    .select("attraction_id, name_th, name_en, slug")
    .eq("is_active", true)
    .or(`name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
    .order("name_th", { ascending: true })
    .limit(20);

  if (error) {
    return { success: false as const, error: "ไม่สามารถค้นหาสถานที่ได้ กรุณาลองอีกครั้ง" };
  }

  return { success: true as const, data: data ?? [] };
}

export async function updateCertificateTemplateLayout(
  templateId: number,
  layout: unknown
) {
  const guard = await requirePermission("certificate.template_manage");
  const validTemplateId = parseTemplateId(templateId);
  const parsedLayout = certificateTemplateLayoutInputSchema.safeParse(layout);
  if (!parsedLayout.success) throw new Error("รูปแบบเทมเพลตไม่ถูกต้อง");
  if (getCertificateLayoutWarnings(parsedLayout.data).length > 0) {
    throw new Error("องค์ประกอบอยู่นอกขอบเขตปลอดภัยหรือทับกัน");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .update({ layout_config_json: parsedLayout.data, updated_at: new Date().toISOString() })
    .eq("template_id", validTemplateId)
    .select("template_id")
    .maybeSingle();

  if (error || !data) throw new Error("ไม่สามารถบันทึกรูปแบบเทมเพลตได้");
  await logAdminAction({
    adminId: guard.adminId,
    action: "certificate.template_layout_updated",
    entityType: "certificate_template",
    entityId: String(validTemplateId),
    details: {
      orientation: parsedLayout.data.orientation,
      theme: parsedLayout.data.theme,
      photoShape: parsedLayout.data.photoShape,
    },
  });

  revalidatePath("/admin/certificate-templates");
  revalidatePath(`/admin/certificate-templates/${validTemplateId}/edit`);
  return { success: true as const };
}

export async function toggleTemplateStatus(templateId: number, isActive: boolean) {
  const guard = await requirePermission("certificate.template_manage");
  const validTemplateId = parseTemplateId(templateId);
  const supabase = createSupabaseServiceRoleClient();

  if (!isActive) {
    const { data: template, error: fetchError } = await supabase
      .from("certificate_templates")
      .select("is_default")
      .eq("template_id", validTemplateId)
      .single();

    if (fetchError || !template) throw new Error("ไม่พบเทมเพลต");
    if (template.is_default) throw new Error("เทมเพลตเริ่มต้นต้องเปิดใช้งานเสมอ");
  }
  
  const { error } = await supabase
    .from("certificate_templates")
    .update({ is_active: isActive })
    .eq("template_id", validTemplateId);

  if (error) throw new Error("ไม่สามารถเปลี่ยนสถานะเทมเพลตได้");
  await logAdminAction({
    adminId: guard.adminId,
    action: "certificate.template_status_updated",
    entityType: "certificate_template",
    entityId: String(validTemplateId),
    details: { isActive },
  });
  revalidatePath("/admin/certificate-templates");
}

export async function setTemplateAsDefault(templateId: number) {
  const guard = await requirePermission("certificate.template_manage");
  const validTemplateId = parseTemplateId(templateId);
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase.rpc("set_certificate_template_default", {
    p_template_id: validTemplateId,
  });
  const result = data as { success?: boolean; error_code?: string } | null;
  if (error || !result?.success) {
    if (result?.error_code === "TEMPLATE_NOT_FOUND") throw new Error("ไม่พบเทมเพลต");
    if (result?.error_code === "TEMPLATE_INACTIVE") {
      throw new Error("กรุณาเปิดใช้งานเทมเพลตก่อนตั้งเป็นค่าเริ่มต้น");
    }
    throw new Error("ไม่สามารถตั้งเป็นค่าเริ่มต้นได้");
  }

  await logAdminAction({
    adminId: guard.adminId,
    action: "certificate.template_default_updated",
    entityType: "certificate_template",
    entityId: String(validTemplateId),
  });
  revalidatePath("/admin/certificate-templates");
}

export async function deleteTemplate(templateId: number) {
  const guard = await requirePermission("certificate.template_manage");
  const validTemplateId = parseTemplateId(templateId);
  const supabase = createSupabaseServiceRoleClient();

  const { data: template, error: fetchError } = await supabase
    .from("certificate_templates")
    .select("background_path, is_default")
    .eq("template_id", validTemplateId)
    .single();
  if (fetchError || !template) throw new Error("ไม่พบเทมเพลต");
  if (template.is_default) throw new Error("ไม่สามารถลบเทมเพลตเริ่มต้นได้");

  const { error } = await supabase
    .from("certificate_templates")
    .delete()
    .eq("template_id", validTemplateId);

  if (error) {
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error("ไม่สามารถลบเทมเพลตนี้ได้เนื่องจากมีใบประกาศที่ใช้งานอยู่");
    }
    throw new Error("ไม่สามารถลบเทมเพลตได้ กรุณาลองอีกครั้ง");
  }

  if (template.background_path) {
    try {
      await deletePrivateFile({
        bucket: "southern-border-tourism",
        path: template.background_path,
      });
    } catch (cleanupError) {
      console.error(
        "Certificate template storage cleanup failed:",
        cleanupError instanceof Error ? cleanupError.message : "unknown error"
      );
    }
  }

  await logAdminAction({
    adminId: guard.adminId,
    action: "certificate.template_deleted",
    entityType: "certificate_template",
    entityId: String(validTemplateId),
  });
  revalidatePath("/admin/certificate-templates");
}

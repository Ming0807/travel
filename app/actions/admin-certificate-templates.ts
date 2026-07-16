"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requirePermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const templateIdSchema = z.number().int().positive();

function parseTemplateId(templateId: number): number {
  const parsed = templateIdSchema.safeParse(templateId);
  if (!parsed.success) throw new Error("รหัสเทมเพลตไม่ถูกต้อง");
  return parsed.data;
}

export async function toggleTemplateStatus(templateId: number, isActive: boolean) {
  await requirePermission("certificate.template_manage");
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
  revalidatePath("/admin/certificate-templates");
}

export async function setTemplateAsDefault(templateId: number) {
  await requirePermission("certificate.template_manage");
  const validTemplateId = parseTemplateId(templateId);
  const supabase = createSupabaseServiceRoleClient();
  
  // Get the template to find its language
  const { data: template, error: fetchError } = await supabase
    .from("certificate_templates")
    .select("language, attraction_id")
    .eq("template_id", validTemplateId)
    .single();

  if (fetchError || !template) throw new Error("ไม่พบเทมเพลต");

  // First, unset all defaults for the same language (and attraction if applicable)
  let query = supabase
    .from("certificate_templates")
    .update({ is_default: false })
    .eq("language", template.language);

  // If we support attraction-specific templates, we should scope it
  if (template.attraction_id) {
    query = query.eq("attraction_id", template.attraction_id);
  } else {
    query = query.is("attraction_id", null);
  }

  const { error: unsetError } = await query;
  if (unsetError) throw new Error("ไม่สามารถยกเลิกเทมเพลตเริ่มต้นเดิมได้");

  // Then set this one as default
  const { error } = await supabase
    .from("certificate_templates")
    .update({ is_default: true, is_active: true }) // make sure it's active
    .eq("template_id", validTemplateId);

  if (error) throw new Error("ไม่สามารถตั้งเป็นค่าเริ่มต้นได้");
  revalidatePath("/admin/certificate-templates");
}

export async function deleteTemplate(templateId: number) {
  await requirePermission("certificate.template_manage");
  const validTemplateId = parseTemplateId(templateId);
  const supabase = createSupabaseServiceRoleClient();
  
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
  revalidatePath("/admin/certificate-templates");
}

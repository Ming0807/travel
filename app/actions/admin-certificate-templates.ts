"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

export async function listCertificateTemplates() {
  await requirePermission("certificate.template_manage");
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .order("is_active", { ascending: false })
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch templates");
  return data;
}

export async function toggleTemplateStatus(templateId: number, isActive: boolean) {
  await requirePermission("certificate.template_manage");
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("certificate_templates")
    .update({ is_active: isActive })
    .eq("template_id", templateId);

  if (error) throw new Error("Failed to update template status");
  revalidatePath("/admin/certificate-templates");
}

export async function setTemplateAsDefault(templateId: number) {
  await requirePermission("certificate.template_manage");
  const supabase = await createSupabaseServerClient();
  
  // Get the template to find its language
  const { data: template, error: fetchError } = await supabase
    .from("certificate_templates")
    .select("language, attraction_id")
    .eq("template_id", templateId)
    .single();

  if (fetchError || !template) throw new Error("Template not found");

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

  await query;

  // Then set this one as default
  const { error } = await supabase
    .from("certificate_templates")
    .update({ is_default: true, is_active: true }) // make sure it's active
    .eq("template_id", templateId);

  if (error) throw new Error("Failed to set template as default");
  revalidatePath("/admin/certificate-templates");
}

export async function deleteTemplate(templateId: number) {
  await requirePermission("certificate.template_manage");
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("certificate_templates")
    .delete()
    .eq("template_id", templateId);

  if (error) {
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error("Cannot delete this template because it is currently used by issued certificates.");
    }
    throw new Error("Failed to delete template");
  }
  revalidatePath("/admin/certificate-templates");
}

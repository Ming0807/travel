import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminShell } from "@/components/admin/AdminShell";
import { CertificateTemplateStudio } from "@/components/admin/certificate-templates/CertificateTemplateStudio";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminCertificateTemplateForStudio } from "@/lib/repositories/admin-certificate-template.repository";

export const metadata: Metadata = {
  title: "ออกแบบเทมเพลตเกียรติบัตร | Admin",
};

const templateIdSchema = z.coerce.number().int().positive();

export default async function EditCertificateTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const guard = await requirePermission("certificate.template_manage");
  const parsedId = templateIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();

  const template = await getAdminCertificateTemplateForStudio(parsedId.data);
  if (!template) notFound();

  const backgroundUrl = template.background_path
    ? `/api/admin/media/preview?bucket=southern-border-tourism&path=${encodeURIComponent(
        template.background_path
      )}`
    : "";

  return (
    <AdminShell admin={guard.actor}>
      <CertificateTemplateStudio
        template={{
          templateId: template.template_id,
          templateName: template.template_name,
          backgroundUrl,
          attractionName: template.attraction_name,
          language: template.language,
          layout: template.layoutConfig,
        }}
      />
    </AdminShell>
  );
}

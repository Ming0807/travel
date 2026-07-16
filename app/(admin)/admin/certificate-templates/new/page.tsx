import { requirePermission } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateFormClient } from "@/components/admin/certificate-templates/TemplateFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เพิ่มเทมเพลตเกียรติบัตร | Admin",
};

export default async function NewTemplatePage() {
  const guard = await requirePermission("certificate.template_manage");

  return (
    <AdminShell admin={guard.actor}>
      <TemplateFormClient />
    </AdminShell>
  );
}

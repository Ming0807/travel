import { requirePermission } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateFormClient } from "@/components/admin/certificate-templates/TemplateFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Certificate Template | Admin",
};

export default async function NewTemplatePage() {
  await requirePermission("certificate.template_manage");

  return (
    <AdminShell>
      <TemplateFormClient />
    </AdminShell>
  );
}

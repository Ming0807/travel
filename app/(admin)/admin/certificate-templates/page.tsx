import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { listCertificateTemplates } from "@/app/actions/admin-certificate-templates";
import { TemplateListClient } from "@/components/admin/certificate-templates/TemplateListClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function CertificateTemplatesPage() {
  const templates = await listCertificateTemplates();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminPageHeader
            eyebrow="Media & Assets"
            title="Certificate Templates"
            description="จัดการภาพพื้นหลังใบประกาศนียบัตร (Certificate Backgrounds) ที่จะใช้สำหรับสร้างภาพให้แก่นักท่องเที่ยว"
          />
          <Link
            href="/admin/certificate-templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#075049]"
          >
            <Plus size={16} weight="bold" /> เพิ่มเทมเพลตใหม่
          </Link>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-muted animate-pulse">กำลังโหลดเทมเพลต...</div>}>
          <TemplateListClient initialTemplates={templates} />
        </Suspense>
      </div>
    </AdminShell>
  );
}

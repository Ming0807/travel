import { listCertificateTemplates } from "@/app/actions/admin-certificate-templates";
import { TemplateListClient } from "@/components/admin/certificate-templates/TemplateListClient";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { ExportButton } from "@/components/admin/ExportButton";

export const dynamic = "force-dynamic";

export default async function CertificateTemplatesPage() {
  const templates = await listCertificateTemplates();
  const total = templates.length;

  return (
    <ListPageShell
      eyebrow="Media & Assets"
      title="Certificate Templates"
      description="จัดการภาพพื้นหลังใบประกาศนียบัตร (Certificate Backgrounds) ที่จะใช้สำหรับสร้างภาพให้แก่นักท่องเที่ยว"
      createHref="/admin/certificate-templates/new"
      createLabel="เพิ่มเทมเพลตใหม่"
      hideCreateButton={false}
      headerActions={<ExportButton endpoint="/api/admin/export/certificate-templates" label="Export CSV" />}
      total={total}
      page={1}
      pageSize={total || 1}
      emptyTitle="ยังไม่มีเทมเพลตใบประกาศ"
      emptyDescription="คุณสามารถเพิ่มภาพพื้นหลังและตั้งค่าตำแหน่งต่างๆ บนใบประกาศนียบัตรได้ โดยคลิกที่ปุ่มเพิ่มเทมเพลตใหม่"
    >
      <TemplateListClient initialTemplates={templates} />
    </ListPageShell>
  );
}

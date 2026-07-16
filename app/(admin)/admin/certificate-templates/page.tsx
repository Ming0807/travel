import { ExportButton } from "@/components/admin/ExportButton";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { SearchInput } from "@/components/admin/SearchInput";
import { TemplateListClient } from "@/components/admin/certificate-templates/TemplateListClient";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { listAdminCertificateTemplates } from "@/lib/repositories/admin-certificate-template.repository";
import { adminCertificateTemplateFiltersSchema } from "@/lib/validation/admin-certificate-template";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "active", label: "ใช้งานอยู่" },
  { value: "inactive", label: "ปิดใช้งาน" },
];

const languageOptions = [
  { value: "th", label: "ภาษาไทย" },
  { value: "en", label: "ภาษาอังกฤษ" },
];

const scopeOptions = [
  { value: "global", label: "ส่วนกลาง" },
  { value: "attraction", label: "เฉพาะสถานที่" },
];

const sortOptions = [
  { value: "newest", label: "สร้างล่าสุด" },
  { value: "oldest", label: "สร้างเก่าสุด" },
  { value: "name_asc", label: "ชื่อ ก-ฮ" },
  { value: "name_desc", label: "ชื่อ ฮ-ก" },
];

export default async function CertificateTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("certificate.template_manage");
  const parsed = adminCertificateTemplateFiltersSchema.safeParse(await searchParams);
  const filters = parsed.success
    ? parsed.data
    : adminCertificateTemplateFiltersSchema.parse({});
  const result = await listAdminCertificateTemplates(filters);
  const canExport = hasPermission(guard.actor, "export.certificate_templates");
  const hasFilters = Boolean(
    filters.search || filters.status || filters.language || filters.scope
  );

  return (
    <ListPageShell
      eyebrow="เกียรติบัตรดิจิทัล"
      title="เทมเพลตเกียรติบัตร"
      description="จัดการภาพพื้นหลัง ภาษา และขอบเขตการใช้งานของเกียรติบัตรส่วนกลางหรือรายสถานที่"
      createHref="/admin/certificate-templates/new"
      createLabel="เพิ่มเทมเพลต"
      headerActions={
        canExport ? (
          <ExportButton
            endpoint="/api/admin/export/certificate-templates"
            label="ส่งออกข้อมูลเทมเพลต"
          />
        ) : null
      }
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      admin={guard.actor}
      emptyTitle={hasFilters ? "ไม่พบเทมเพลตตามตัวกรอง" : "ยังไม่มีเทมเพลตเกียรติบัตร"}
      emptyDescription={
        hasFilters
          ? "ลองล้างคำค้นหาหรือเปลี่ยนตัวกรอง แล้วค้นหาอีกครั้ง"
          : "เพิ่มภาพพื้นหลังและกำหนดรูปแบบสำหรับเกียรติบัตรของนักท่องเที่ยว"
      }
      filters={
        <FilterBar>
          <div className="min-w-[240px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อเทมเพลต" />
          </div>
          <FilterSelect label="สถานะ" paramKey="status" options={statusOptions} allLabel="ทุกสถานะ" />
          <FilterSelect label="ภาษา" paramKey="language" options={languageOptions} allLabel="ทุกภาษา" />
          <FilterSelect label="ขอบเขต" paramKey="scope" options={scopeOptions} allLabel="ทุกขอบเขต" />
          <FilterSelect label="เรียงตาม" paramKey="sort" options={sortOptions} allLabel="สร้างล่าสุด" />
        </FilterBar>
      }
    >
      <TemplateListClient templates={result.items} />
    </ListPageShell>
  );
}

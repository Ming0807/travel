import type { Metadata } from "next";
import { ExportButton } from "@/components/admin/ExportButton";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { SearchInput } from "@/components/admin/SearchInput";
import { RoleListClient } from "@/components/admin/roles/RoleListClient";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { listAdminRoles } from "@/lib/repositories/role.repository";
import { adminRoleFiltersSchema } from "@/lib/validation/admin-role";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "บทบาทและสิทธิ์ | Southern Border Tourism",
};

const statusOptions = [
  { value: "active", label: "ใช้งานอยู่" },
  { value: "inactive", label: "ปิดใช้งาน" },
];

const sortOptions = [
  { value: "newest", label: "สร้างล่าสุด" },
  { value: "oldest", label: "สร้างเก่าสุด" },
  { value: "name_asc", label: "ชื่อ ก-ฮ" },
  { value: "name_desc", label: "ชื่อ ฮ-ก" },
];

export default async function AdminRolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("role.read");
  const parsed = adminRoleFiltersSchema.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : adminRoleFiltersSchema.parse({});
  const result = await listAdminRoles(filters);
  const canCreate = hasPermission(guard.actor, "role.create");
  const canUpdate = hasPermission(guard.actor, "role.update");
  const canDelete = hasPermission(guard.actor, "role.delete");
  const canExport = hasPermission(guard.actor, "export.roles");
  const hasFilters = Boolean(filters.search || filters.status);

  return (
    <ListPageShell
      eyebrow="การเข้าถึงระบบ"
      title="บทบาทและสิทธิ์"
      description="กำหนดขอบเขตการทำงานตามหลักสิทธิ์เท่าที่จำเป็น และตรวจสอบทุกคำสั่งที่เซิร์ฟเวอร์"
      createHref="/admin/roles/new"
      createLabel="สร้างบทบาท"
      headerActions={
        canExport ? <ExportButton endpoint="/api/admin/export/roles" label="ส่งออกข้อมูลบทบาท" /> : null
      }
      hideCreateButton={!canCreate}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      admin={guard.actor}
      emptyTitle={hasFilters ? "ไม่พบบทบาทตามตัวกรอง" : "ยังไม่มีบทบาทในระบบ"}
      emptyDescription={
        hasFilters
          ? "ลองล้างคำค้นหาหรือเปลี่ยนสถานะ แล้วค้นหาอีกครั้ง"
          : "สร้างบทบาทและกำหนดเฉพาะสิทธิ์ที่จำเป็นต่อการทำงาน"
      }
      filters={
        <FilterBar>
          <div className="min-w-[240px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อหรือคำอธิบายบทบาท" />
          </div>
          <FilterSelect label="สถานะ" paramKey="status" options={statusOptions} allLabel="ทุกสถานะ" />
          <FilterSelect label="เรียงตาม" paramKey="sort" options={sortOptions} allLabel="สร้างล่าสุด" />
        </FilterBar>
      }
    >
      <RoleListClient roles={result.items} canUpdate={canUpdate} canDelete={canDelete} />
    </ListPageShell>
  );
}

import type { Metadata } from "next";
import { ExportButton } from "@/components/admin/ExportButton";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { SearchInput } from "@/components/admin/SearchInput";
import { UserListClient } from "@/components/admin/users/UserListClient";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import {
  getAdminUserRoleOptions,
  listAdminUsers,
} from "@/lib/repositories/admin-user.repository";
import { adminUserFiltersSchema } from "@/lib/validation/admin-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ผู้ดูแลระบบ | Southern Border Tourism",
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("user.read");
  const parsed = adminUserFiltersSchema.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : adminUserFiltersSchema.parse({});
  const [{ items, total, page, pageSize }, roles] = await Promise.all([
    listAdminUsers(filters),
    getAdminUserRoleOptions(),
  ]);

  const canManage = hasPermission(guard.actor, "user.manage");
  const canExportPersonalData =
    canManage &&
    hasPermission(guard.actor, "export.users") &&
    hasPermission(guard.actor, "export.personal_data");
  const hasFilters = Boolean(filters.search || filters.status || filters.roleId);
  const roleOptions = roles.map((role) => ({
    value: String(role.role_id),
    label: role.role_name,
  }));

  return (
    <ListPageShell
      eyebrow="การเข้าถึงระบบ"
      title="ผู้ดูแลระบบ"
      description="จัดการบัญชี สถานะการใช้งาน และบทบาท โดยทุกการเปลี่ยนแปลงจะตรวจสอบสิทธิ์ที่เซิร์ฟเวอร์"
      createHref="/admin/users/new"
      createLabel="เพิ่มผู้ดูแลระบบ"
      headerActions={
        canExportPersonalData ? (
          <ExportButton endpoint="/api/admin/export/users" label="ส่งออกข้อมูลผู้ดูแล" />
        ) : null
      }
      hideCreateButton={!canManage}
      total={total}
      page={page}
      pageSize={pageSize}
      admin={guard.actor}
      emptyTitle={hasFilters ? "ไม่พบบัญชีตามตัวกรอง" : "ยังไม่มีบัญชีผู้ดูแลระบบ"}
      emptyDescription={
        hasFilters
          ? "ลองล้างคำค้นหาหรือเปลี่ยนตัวกรอง แล้วค้นหาอีกครั้ง"
          : "บัญชีผู้ดูแลระบบจะแสดงที่นี่เมื่อได้รับเชิญเข้าระบบ"
      }
      filters={
        <FilterBar>
          <div className="min-w-[240px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อหรืออีเมลผู้ดูแล" />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="status"
            options={statusOptions}
            allLabel="ทุกสถานะ"
          />
          <FilterSelect
            label="บทบาท"
            paramKey="roleId"
            options={roleOptions}
            allLabel="ทุกบทบาท"
          />
          <FilterSelect
            label="เรียงตาม"
            paramKey="sort"
            options={sortOptions}
            allLabel="สร้างล่าสุด"
          />
        </FilterBar>
      }
    >
      <UserListClient users={items} canManage={canManage} />
    </ListPageShell>
  );
}

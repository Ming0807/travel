import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAllRolesWithPermissions } from "@/lib/repositories/role.repository";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { RoleListClient } from "@/components/admin/roles/RoleListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "บทบาทและสิทธิ์ | Southern Border Tourism",
};

export default async function AdminRolesPage() {
  const guard = await requirePermission("role.manage");
  
  const roles = await getAllRolesWithPermissions();

  return (
    <ListPageShell
      eyebrow="การเข้าถึงระบบ"
      title="บทบาทและสิทธิ์"
      description="กำหนดขอบเขตการทำงานของผู้ดูแลแต่ละกลุ่ม โดยไม่ลดทอนการตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์"
      createHref="/admin/roles/new"
      createLabel="สร้างบทบาท"
      headerActions={<ExportButton endpoint="/api/admin/export/roles" label="ส่งออก CSV" />}
      hideCreateButton={!hasPermission(guard.actor, "role.manage")}
      total={roles.length}
      page={1}
      pageSize={roles.length || 100}
      admin={guard.actor}
    >
      <div className="mt-8">
        <RoleListClient initialRoles={roles} />
      </div>
    </ListPageShell>
  );
}

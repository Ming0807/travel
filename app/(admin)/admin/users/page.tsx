import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAdminUsers } from "@/lib/repositories/admin-user.repository";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { UserListClient } from "@/components/admin/users/UserListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผู้ดูแลระบบ | Southern Border Tourism",
};

export default async function AdminUsersPage() {
  const guard = await requirePermission("user.manage");
  
  const users = await getAdminUsers();

  return (
    <ListPageShell
      eyebrow="การเข้าถึงระบบ"
      title="ผู้ดูแลระบบ"
      description="จัดการบัญชีผู้ดูแล สถานะการใช้งาน และบทบาทที่ได้รับ โดยทุกการเปลี่ยนแปลงจะถูกตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์"
      createHref="/admin/users/new"
      createLabel="เพิ่มผู้ดูแลระบบ"
      headerActions={<ExportButton endpoint="/api/admin/export/users" label="ส่งออก CSV" />}
      hideCreateButton={!hasPermission(guard.actor, "user.manage")}
      total={users.length}
      page={1}
      pageSize={users.length || 100}
      admin={guard.actor}
    >
      <div className="mt-8">
        <UserListClient initialUsers={users} />
      </div>
    </ListPageShell>
  );
}

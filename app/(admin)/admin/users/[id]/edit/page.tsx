import { requirePermission } from "@/lib/auth/guards";
import { getAdminUserById } from "@/lib/repositories/admin-user.repository";
import { getActiveRoles } from "@/lib/repositories/role.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserFormClient } from "@/components/admin/users/UserFormClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แก้ไขผู้ดูแลระบบ | Southern Border Tourism",
};

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("user.manage");
  
  const { id } = await params;
  
  const [user, roles] = await Promise.all([
    getAdminUserById(id),
    getActiveRoles()
  ]);

  if (!user) {
    notFound();
  }

  return (
    <AdminShell admin={guard.actor}>
      <div className="mx-auto max-w-2xl">
        <AdminPageHeader
          eyebrow="ผู้ดูแลระบบ"
          title="แก้ไขผู้ดูแลระบบ"
          description={`ปรับข้อมูล สถานะ และบทบาทของ ${user.display_name || user.email}`}
        />

        <div className="mt-8">
          <UserFormClient roles={roles} initialData={user} />
        </div>
      </div>
    </AdminShell>
  );
}

import { requirePermission } from "@/lib/auth/guards";
import { getRoleById } from "@/lib/repositories/role.repository";
import { getAllPermissions } from "@/lib/repositories/permission.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleFormClient } from "@/components/admin/roles/RoleFormClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แก้ไขบทบาท | Southern Border Tourism",
};

export default async function EditAdminRolePage({ params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("role.manage");
  
  const { id } = await params;
  const numId = parseInt(id, 10);
  
  if (isNaN(numId)) {
    notFound();
  }

  const [role, permissions] = await Promise.all([
    getRoleById(numId),
    getAllPermissions()
  ]);

  if (!role) {
    notFound();
  }

  return (
    <AdminShell admin={guard.actor}>
      <div className="mx-auto max-w-4xl">
        <AdminPageHeader
          eyebrow="บทบาทและสิทธิ์"
          title="แก้ไขบทบาท"
          description={`ปรับรายละเอียดและสิทธิ์ของบทบาท ${role.role_name}`}
        />

        <div className="mt-8">
          <RoleFormClient permissions={permissions} initialData={role} />
        </div>
      </div>
    </AdminShell>
  );
}

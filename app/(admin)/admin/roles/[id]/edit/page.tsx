import { requirePermission } from "@/lib/auth/guards";
import { getRoleById } from "@/lib/repositories/role.repository";
import { getAllPermissions } from "@/lib/repositories/permission.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleFormClient } from "@/components/admin/roles/RoleFormClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Role | Admin | Southern Border Tourism",
};

export default async function EditAdminRolePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("role.manage");
  
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
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        <AdminPageHeader
          eyebrow="Admin Roles"
          title="Edit Role"
          description={`Update details and permissions for the ${role.role_name} role.`}
        />

        <div className="mt-8">
          <RoleFormClient permissions={permissions} initialData={role} />
        </div>
      </div>
    </AdminShell>
  );
}

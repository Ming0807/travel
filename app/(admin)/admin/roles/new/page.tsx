import { requirePermission } from "@/lib/auth/guards";
import { getAllPermissions } from "@/lib/repositories/permission.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleFormClient } from "@/components/admin/roles/RoleFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Role | Admin | Southern Border Tourism",
};

export default async function NewAdminRolePage() {
  await requirePermission("role.manage");
  
  const permissions = await getAllPermissions();

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        <AdminPageHeader
          eyebrow="Admin Roles"
          title="Create New Role"
          description="Define a new custom role and assign specific permissions."
        />

        <div className="mt-8">
          <RoleFormClient permissions={permissions} />
        </div>
      </div>
    </AdminShell>
  );
}

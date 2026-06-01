import { requirePermission } from "@/lib/auth/guards";
import { getAllRolesWithPermissions } from "@/lib/repositories/role.repository";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { RoleListClient } from "@/components/admin/roles/RoleListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Roles | Southern Border Tourism",
};

export default async function AdminRolesPage() {
  await requirePermission("role.manage");
  
  const roles = await getAllRolesWithPermissions();

  return (
    <ListPageShell
      eyebrow="Access Control"
      title="Roles & Permissions"
      description="Manage system roles and assign fine-grained permissions to control access."
      createHref="/admin/roles/new"
      createLabel="Create Role"
      headerActions={<ExportButton endpoint="/api/admin/export/roles" label="Export CSV" />}
      hideCreateButton
      total={roles.length}
      page={1}
      pageSize={roles.length || 100}
    >
      <div className="mt-8">
        <RoleListClient initialRoles={roles} />
      </div>
    </ListPageShell>
  );
}

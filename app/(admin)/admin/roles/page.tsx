import { requirePermission } from "@/lib/auth/guards";
import { getAllRolesWithPermissions } from "@/lib/repositories/role.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleListClient } from "@/components/admin/roles/RoleListClient";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Roles | Southern Border Tourism",
};

export default async function AdminRolesPage() {
  await requirePermission("role.manage");
  
  const roles = await getAllRolesWithPermissions();

  return (
    <AdminShell>
      <AdminPageHeader
        title="Roles & Permissions"
        description="Manage system roles and assign fine-grained permissions to control access."
        actions={
          <Link
            href="/admin/roles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#F3704C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] transition-colors"
          >
            <Plus size={20} weight="bold" />
            Create Role
          </Link>
        }
      />

      <div className="mt-8">
        <RoleListClient initialRoles={roles} />
      </div>
    </AdminShell>
  );
}

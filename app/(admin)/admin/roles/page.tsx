import { requirePermission } from "@/lib/auth/guards";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Roles | Southern Border Tourism",
};

async function getRoles() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("roles")
    .select(`
      *,
      role_permissions (
        permissions (
          permission_name
        )
      )
    `)
    .order("role_name");
  if (error) throw error;
  return data;
}

export default async function AdminRolesPage() {
  await requirePermission("user.manage");
  const roles = await getRoles();

  return (
    <AdminShell>
      <AdminPageHeader
        title="Roles & Permissions"
        description="View system roles and their assigned permissions."
      />

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {roles.map((role) => (
              <tr key={role.role_id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{role.role_name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{role.description}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {role.role_permissions.map((rp: any) => (
                      <span key={rp.permissions.permission_name} className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-600">
                        {rp.permissions.permission_name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

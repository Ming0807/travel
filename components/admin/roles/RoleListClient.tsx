"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, PencilSimple, Trash } from "@phosphor-icons/react";
import { deleteRoleAction } from "@/app/actions/admin-roles";

type RoleWithPermissions = {
  role_id: number;
  role_name: string;
  description: string;
  is_active: boolean;
  permissions: string[];
};

export function RoleListClient({ initialRoles }: { initialRoles: RoleWithPermissions[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (roleId: number, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", roleId.toString());
      const res = await deleteRoleAction(formData);
      
      if (res.error) {
        alert(res.error);
      } else {
        setRoles(roles.filter(r => r.role_id !== roleId));
      }
    });
  };

  const isProtectedRole = (roleName: string) => {
    return ["super_admin", "admin", "province_admin", "attraction_manager", "viewer"].includes(roleName);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Role</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {roles.map((role) => (
              <tr key={role.role_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{role.role_name}</span>
                    {isProtectedRole(role.role_name) && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">System</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                  {role.description}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {role.permissions.map((perm) => (
                      <span key={perm} className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-600 border border-slate-200">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length === 0 && (
                      <span className="text-sm text-slate-400 italic">No permissions assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {role.is_active ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle size={14} weight="fill" />
                      Active
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      <XCircle size={14} weight="fill" />
                      Inactive
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/roles/${role.role_id}/edit`}
                      className="text-slate-400 hover:text-[#F3704C] transition-colors flex items-center gap-1"
                      title="Edit role"
                    >
                      <PencilSimple size={20} />
                      <span className="sr-only">Edit</span>
                    </Link>
                    {!isProtectedRole(role.role_name) && (
                      <button
                        onClick={() => handleDelete(role.role_id, role.role_name)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete role"
                      >
                        <Trash size={20} />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    <div className="space-y-4">
      {roles.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">No roles found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible only on small screens) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {roles.map((role) => (
              <div key={role.role_id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{role.role_name}</h3>
                      {isProtectedRole(role.role_name) && (
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 uppercase tracking-wider">
                          System
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{role.description}</p>
                  </div>
                  <div>
                    {role.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        <CheckCircle size={14} weight="fill" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
                        <XCircle size={14} weight="fill" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Permissions ({role.permissions.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 4).map((perm) => (
                      <span key={perm} className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-600 border border-slate-200">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-xs font-mono font-medium text-slate-500 border border-slate-200">
                        +{role.permissions.length - 4} more
                      </span>
                    )}
                    {role.permissions.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No permissions</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <Link
                    href={`/admin/roles/${role.role_id}/edit`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    <PencilSimple size={16} />
                    Edit
                  </Link>
                  {!isProtectedRole(role.role_name) && (
                    <button
                      onClick={() => handleDelete(role.role_id, role.role_name)}
                      disabled={isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-300 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <Trash size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden on small screens) */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{role.role_name}</span>
                            {isProtectedRole(role.role_name) && (
                              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 uppercase tracking-wider">
                                System
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[250px] truncate">
                        {role.description}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {role.permissions.slice(0, 5).map((perm) => (
                            <span key={perm} className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-600 border border-slate-200">
                              {perm}
                            </span>
                          ))}
                          {role.permissions.length > 5 && (
                            <span className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-xs font-mono font-medium text-slate-500 border border-slate-200">
                              +{role.permissions.length - 5} more
                            </span>
                          )}
                          {role.permissions.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {role.is_active ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full ring-1 ring-inset ring-green-600/20">
                            <CheckCircle size={14} weight="fill" />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full ring-1 ring-inset ring-slate-500/20">
                            <XCircle size={14} weight="fill" />
                            Inactive
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/roles/${role.role_id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#F3704C] transition-colors"
                            title="Edit role"
                          >
                            <PencilSimple size={20} />
                            <span className="sr-only">Edit</span>
                          </Link>
                          {!isProtectedRole(role.role_name) ? (
                            <button
                              onClick={() => handleDelete(role.role_id, role.role_name)}
                              disabled={isPending}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete role"
                            >
                              <Trash size={20} />
                              <span className="sr-only">Delete</span>
                            </button>
                          ) : (
                            <div className="w-9"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

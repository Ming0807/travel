"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Shield, PencilSimple } from "@phosphor-icons/react";
import { toggleAdminUserAction } from "@/app/actions/admin-users";
import Link from "next/link";

export function UserListClient({ initialUsers }: { initialUsers: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (adminId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleAdminUserAction(adminId, !currentStatus);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {initialUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              initialUsers.map((user) => (
                <tr key={user.admin_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{user.display_name || "Unknown"}</span>
                      <span className="text-sm text-slate-500">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((r: string) => (
                          <span key={r} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                            <Shield size={12} />
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {user.is_active ? <CheckCircle weight="fill" /> : <XCircle weight="fill" />}
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.last_login_at ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm") : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/users/${user.admin_id}/edit`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
                      >
                        <PencilSimple size={16} />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggle(user.admin_id, user.is_active)}
                        disabled={isPending}
                        className={`text-sm font-semibold ${
                          user.is_active ? "text-red-600 hover:text-red-900" : "text-emerald-600 hover:text-emerald-900"
                        } disabled:opacity-50`}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

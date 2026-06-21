"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Shield, PencilSimple } from "@phosphor-icons/react";
import { toggleAdminUserAction } from "@/app/actions/admin-users";
import Link from "next/link";
import { useState } from "react";

type AdminUserListItem = {
  admin_id: string;
  display_name: string | null;
  email: string | null;
  is_active: boolean;
  last_login_at: string | null;
  roles: string[];
};

export function UserListClient({ initialUsers }: { initialUsers: AdminUserListItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = initialUsers.filter((user) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (user.display_name && user.display_name.toLowerCase().includes(lowerQuery)) ||
      (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
      (user.roles && user.roles.some((r: string) => r.toLowerCase().includes(lowerQuery)))
    );
  });

  const handleToggle = (adminId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleAdminUserAction(adminId, !currentStatus);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal sm:text-sm sm:leading-6"
          />
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
          Found <span className="font-bold text-slate-900">{filteredUsers.length}</span> user(s)
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">No users match your search.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <div key={user.admin_id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900">{user.display_name || "Unknown"}</span>
                    <span className="text-sm text-slate-500">{user.email}</span>
                  </div>
                  <div>
                    {user.is_active ? (
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
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((r: string) => (
                        <span key={r} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${
                          r.toLowerCase() === 'admin'
                            ? 'bg-coral/10 text-coral ring-coral/20'
                            : 'bg-teal/10 text-teal ring-teal/20'
                        }`}>
                          <Shield size={12} />
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No roles</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 mr-1">Last Login:</span>
                  {user.last_login_at ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm") : "Never"}
                </div>

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <Link
                    href={`/admin/users/${user.admin_id}/edit`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    <PencilSimple size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggle(user.admin_id, user.is_active)}
                    disabled={isPending}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset disabled:opacity-50 transition-colors ${
                      user.is_active
                        ? "text-red-600 ring-red-300 hover:bg-red-50"
                        : "text-emerald-600 ring-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Last Login</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.admin_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{user.display_name || "Unknown"}</span>
                          <span className="text-sm text-slate-500">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r: string) => (
                              <span key={r} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${
                                r.toLowerCase() === 'admin'
                                  ? 'bg-coral/10 text-coral ring-coral/20'
                                  : 'bg-teal/10 text-teal ring-teal/20'
                              }`}>
                                <Shield size={10} />
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.is_active ? (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {user.last_login_at ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm") : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.admin_id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#F3704C] transition-colors"
                            title="Edit user"
                          >
                            <PencilSimple size={20} />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleToggle(user.admin_id, user.is_active)}
                            disabled={isPending}
                            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                              user.is_active
                                ? "text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                            }`}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
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

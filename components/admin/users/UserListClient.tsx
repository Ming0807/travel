"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle, PencilSimple, Shield, XCircle } from "@phosphor-icons/react";
import { toggleAdminUserAction } from "@/app/actions/admin-users";
import type { AdminUserListItem } from "@/lib/repositories/admin-user.repository";

type UserListClientProps = {
  users: AdminUserListItem[];
  canManage: boolean;
};

function RoleBadges({ roles }: { roles: string[] }) {
  if (roles.length === 0) {
    return <span className="text-xs text-slate-400">ยังไม่ได้กำหนดบทบาท</span>;
  }

  return roles.map((role) => (
    <span
      key={role}
      className="inline-flex items-center gap-1 rounded-md bg-teal/10 px-2 py-1 text-xs font-semibold text-teal ring-1 ring-inset ring-teal/20"
    >
      <Shield size={12} aria-hidden="true" />
      {role}
    </span>
  ));
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
      <CheckCircle size={14} weight="fill" aria-hidden="true" />
      ใช้งานอยู่
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
      <XCircle size={14} weight="fill" aria-hidden="true" />
      ปิดใช้งาน
    </span>
  );
}

export function UserListClient({ users, canManage }: UserListClientProps) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const formatLastLogin = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
      : "ยังไม่เคยเข้าสู่ระบบ";

  const handleToggle = (adminId: string, currentStatus: boolean) => {
    setActionError(null);
    startTransition(async () => {
      const result = await toggleAdminUserAction(adminId, !currentStatus);
      if (result.error) setActionError(result.error);
    });
  };

  return (
    <div className="space-y-4" aria-busy={isPending}>
      {actionError ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => (
          <article key={user.admin_id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">{user.display_name || "ไม่ระบุชื่อ"}</h2>
                <p className="break-all text-sm text-slate-500">{user.email}</p>
              </div>
              <StatusBadge isActive={user.is_active} />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">บทบาท</p>
              <div className="flex flex-wrap gap-1.5"><RoleBadges roles={user.roles} /></div>
            </div>

            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">เข้าสู่ระบบล่าสุด: </span>
              {formatLastLogin(user.last_login_at)}
            </p>

            {canManage ? (
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <Link
                  href={`/admin/users/${user.admin_id}/edit`}
                  aria-label="แก้ไข"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-100"
                >
                  <PencilSimple size={16} aria-hidden="true" />
                  แก้ไข
                </Link>
                <button
                  type="button"
                  aria-label={user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  onClick={() => handleToggle(user.admin_id, user.is_active)}
                  disabled={isPending}
                  className="h-10 flex-1 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600">ผู้ดูแล</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600">บทบาท</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600">สถานะ</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600">เข้าสู่ระบบล่าสุด</th>
                {canManage ? <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-600">จัดการ</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.admin_id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{user.display_name || "ไม่ระบุชื่อ"}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex max-w-sm flex-wrap gap-1.5"><RoleBadges roles={user.roles} /></div>
                  </td>
                  <td className="px-6 py-4 text-center"><StatusBadge isActive={user.is_active} /></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{formatLastLogin(user.last_login_at)}</td>
                  {canManage ? (
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.admin_id}/edit`}
                          aria-label="แก้ไข"
                          title="แก้ไขผู้ดูแลระบบ"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#F3704C]"
                        >
                          <PencilSimple size={20} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          aria-label={user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                          onClick={() => handleToggle(user.admin_id, user.is_active)}
                          disabled={isPending}
                          className="h-9 rounded-lg px-3 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                          {user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

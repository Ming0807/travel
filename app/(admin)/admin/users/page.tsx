import { requirePermission } from "@/lib/auth/guards";
import { getAdminUsers } from "@/lib/repositories/admin-user.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserListClient } from "@/components/admin/users/UserListClient";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users | Southern Border Tourism",
};

export default async function AdminUsersPage() {
  await requirePermission("user.manage");
  
  const users = await getAdminUsers();

  return (
    <AdminShell>
      <AdminPageHeader
        title="Admin Users"
        description="Manage admin users, their active status, and view their assigned roles."
        actions={
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} weight="bold" />
            Invite User
          </Link>
        }
      />

      <div className="mt-8">
        <UserListClient initialUsers={users} />
      </div>
    </AdminShell>
  );
}

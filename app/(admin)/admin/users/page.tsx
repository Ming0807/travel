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
            className="inline-flex items-center gap-2 rounded-lg bg-[#F3704C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] transition-colors"
          >
            <Plus size={20} weight="bold" />
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

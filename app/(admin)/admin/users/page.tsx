import { requirePermission } from "@/lib/auth/guards";
import { getAdminUsers } from "@/lib/repositories/admin-user.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserListClient } from "@/components/admin/users/UserListClient";
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
      />

      <div className="mt-8">
        <UserListClient initialUsers={users} />
      </div>
    </AdminShell>
  );
}

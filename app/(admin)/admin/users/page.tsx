import { requirePermission } from "@/lib/auth/guards";
import { getAdminUsers } from "@/lib/repositories/admin-user.repository";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { UserListClient } from "@/components/admin/users/UserListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users | Southern Border Tourism",
};

export default async function AdminUsersPage() {
  await requirePermission("user.manage");
  
  const users = await getAdminUsers();

  return (
    <ListPageShell
      eyebrow="Access Control"
      title="Admin Users"
      description="Manage admin users, their active status, and view their assigned roles."
      createHref="/admin/users/new"
      createLabel="Invite User"
      headerActions={<ExportButton endpoint="/api/admin/export/users" label="Export CSV" />}
      hideCreateButton
      total={users.length}
      page={1}
      pageSize={users.length || 100}
    >
      <div className="mt-8">
        <UserListClient initialUsers={users} />
      </div>
    </ListPageShell>
  );
}

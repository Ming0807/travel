import { requirePermission } from "@/lib/auth/guards";
import { getAdminUserById } from "@/lib/repositories/admin-user.repository";
import { getActiveRoles } from "@/lib/repositories/role.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserFormClient } from "@/components/admin/users/UserFormClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit User | Admin | Southern Border Tourism",
};

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("user.update");
  
  const { id } = await params;
  
  const [user, roles] = await Promise.all([
    getAdminUserById(id),
    getActiveRoles()
  ]);

  if (!user) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-2xl">
        <AdminPageHeader
          eyebrow="Admin Users"
          title="Edit User"
          description={`Update details and roles for ${user.display_name}.`}
        />

        <div className="mt-8">
          <UserFormClient roles={roles} initialData={user} />
        </div>
      </div>
    </AdminShell>
  );
}

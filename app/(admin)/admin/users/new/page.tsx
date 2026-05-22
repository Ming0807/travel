import { requirePermission } from "@/lib/auth/guards";
import { getActiveRoles } from "@/lib/repositories/role.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserFormClient } from "@/components/admin/users/UserFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite User | Admin | Southern Border Tourism",
};

export default async function NewAdminUserPage() {
  await requirePermission("user.create");
  
  const roles = await getActiveRoles();

  return (
    <AdminShell>
      <div className="mx-auto max-w-2xl">
        <AdminPageHeader
          eyebrow="Admin Users"
          title="Invite New User"
          description="Send an invitation link to a new administrator and assign their initial roles."
        />

        <div className="mt-8">
          <UserFormClient roles={roles} />
        </div>
      </div>
    </AdminShell>
  );
}

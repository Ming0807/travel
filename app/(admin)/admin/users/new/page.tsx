import { requirePermission } from "@/lib/auth/guards";
import { getActiveRoles } from "@/lib/repositories/role.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserFormClient } from "@/components/admin/users/UserFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เพิ่มผู้ดูแลระบบ | Southern Border Tourism",
};

export default async function NewAdminUserPage() {
  const guard = await requirePermission("user.manage");
  
  const roles = await getActiveRoles();

  return (
    <AdminShell admin={guard.actor}>
      <div className="mx-auto max-w-2xl">
        <AdminPageHeader
          eyebrow="ผู้ดูแลระบบ"
          title="เพิ่มผู้ดูแลระบบ"
          description="เพิ่มบัญชีผู้ดูแลและกำหนดบทบาทเริ่มต้น โปรดให้สิทธิ์เท่าที่จำเป็นต่อหน้าที่"
        />

        <div className="mt-8">
          <UserFormClient roles={roles} />
        </div>
      </div>
    </AdminShell>
  );
}

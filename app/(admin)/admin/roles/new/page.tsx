import { requirePermission } from "@/lib/auth/guards";
import { getAllPermissions } from "@/lib/repositories/permission.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleFormClient } from "@/components/admin/roles/RoleFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สร้างบทบาท | Southern Border Tourism",
};

export default async function NewAdminRolePage() {
  const guard = await requirePermission("role.create");
  
  const permissions = await getAllPermissions();

  return (
    <AdminShell admin={guard.actor}>
      <div className="mx-auto max-w-4xl">
        <AdminPageHeader
          eyebrow="บทบาทและสิทธิ์"
          title="สร้างบทบาทใหม่"
          description="กำหนดบทบาทและเลือกเฉพาะสิทธิ์ที่จำเป็นต่อการทำงานของผู้ดูแลกลุ่มนี้"
        />

        <div className="mt-8">
          <RoleFormClient permissions={permissions} />
        </div>
      </div>
    </AdminShell>
  );
}

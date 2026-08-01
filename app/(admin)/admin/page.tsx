export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { OperationsCommandCenter } from "@/components/admin/operations/OperationsCommandCenter";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminOperationsViewModel } from "@/lib/services/admin-operations.service";

export const metadata: Metadata = {
  title: "ศูนย์ปฏิบัติการ | แอดมินท่องเที่ยวชายแดนใต้",
};

export default async function AdminPage() {
  const guard = await requireAdmin();
  const data = await getAdminOperationsViewModel(guard.actor);

  return (
    <AdminShell admin={guard.actor}>
      <OperationsCommandCenter
        adminName={guard.displayName ?? "ผู้ดูแลระบบ"}
        data={data}
      />
    </AdminShell>
  );
}

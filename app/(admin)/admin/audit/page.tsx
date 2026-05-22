import { requirePermission } from "@/lib/auth/guards";
import { getAuditLogs } from "@/lib/repositories/admin-audit.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuditListClient } from "@/components/admin/audit/AuditListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs | Southern Border Tourism",
};

export default async function AdminAuditLogsPage() {
  // Only super-admin or specific audit log viewers should see this
  await requirePermission("user.manage"); 
  
  const logs = await getAuditLogs(200);

  return (
    <AdminShell>
      <AdminPageHeader
        title="System Audit Logs"
        description="Review chronological records of administrative actions for security and compliance."
      />

      <div className="mt-8">
        <AuditListClient initialLogs={logs} />
      </div>
    </AdminShell>
  );
}

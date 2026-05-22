import { requirePermission } from "@/lib/auth/guards";
import { getAuditLogsPaginated } from "@/lib/repositories/admin-audit.repository";
import { getAdminUsers } from "@/lib/repositories/admin-user.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuditListClient } from "@/components/admin/audit/AuditListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs | Southern Border Tourism",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Only super-admin or specific audit log viewers should see this
  await requirePermission("audit.read"); 
  
  const params = await searchParams;
  
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const limit = typeof params.limit === "string" ? parseInt(params.limit, 10) : 20;
  
  const filters = {
    adminId: typeof params.adminId === "string" ? params.adminId : undefined,
    action: typeof params.action === "string" ? params.action : undefined,
    entityType: typeof params.entityType === "string" ? params.entityType : undefined,
    startDate: typeof params.startDate === "string" ? params.startDate : undefined,
    endDate: typeof params.endDate === "string" ? params.endDate : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
  };

  const [logsResult, adminUsers] = await Promise.all([
    getAuditLogsPaginated(page, limit, filters),
    getAdminUsers(),
  ]);
  


  return (
    <AdminShell>
      <AdminPageHeader
        title="System Audit Logs"
        description="Review chronological records of administrative actions for security and compliance."
      />

      <div className="mt-8">
        <AuditListClient 
          initialData={logsResult}
          adminUsers={adminUsers}
          initialFilters={filters}
        />
      </div>
    </AdminShell>
  );
}

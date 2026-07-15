import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAuditLogsPaginated } from "@/lib/repositories/admin-audit.repository";
import { getAdminUsers } from "@/lib/repositories/admin-user.repository";
import { adminAuditQuerySchema, auditExportFilters } from "@/lib/validation/admin-audit";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuditListClient } from "@/components/admin/audit/AuditListClient";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Audit Logs | Southern Border Tourism",
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Only super-admin or specific audit log viewers should see this
  const guard = await requirePermission("audit.read");
  
  const params = await searchParams;
  const rawParams = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
  const parsed = adminAuditQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    notFound();
  }

  const { page, pageSize } = parsed.data;
  const filters = auditExportFilters(parsed.data);

  const [logsResult, adminUsers] = await Promise.all([
    getAuditLogsPaginated(page, pageSize, filters),
    getAdminUsers(),
  ]);
  


  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="ความปลอดภัยและการตรวจสอบ"
        title="บันทึกกิจกรรมผู้ดูแลระบบ"
        description="ตรวจสอบลำดับเหตุการณ์ การเปลี่ยนแปลงข้อมูล และผลลัพธ์ของคำสั่งในระบบ"
      />

      <div className="mt-8">
        <AuditListClient 
          initialData={logsResult}
          adminUsers={adminUsers}
          initialFilters={filters}
          canExport={hasPermission(guard.actor, "audit.export")}
        />
      </div>
    </AdminShell>
  );
}

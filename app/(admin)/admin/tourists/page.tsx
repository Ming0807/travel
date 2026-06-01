import { requirePermission } from "@/lib/auth/guards";
import { getAdminTourists } from "@/lib/repositories/admin-tourist.repository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { TouristListClient } from "@/components/admin/tourists/TouristListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tourists | Southern Border Tourism",
};

export default async function AdminTouristsPage() {
  // Can use visit_records read permission for now, or create a new one
  await requirePermission("tourist.read");
  
  const tourists = await getAdminTourists(500);

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Visitor Data"
        title="Tourist Records"
        description="View anonymized tourist profiles and their engagement. Full PII is hidden to comply with privacy policies."
        actions={<ExportButton endpoint="/api/admin/export/tourists" label="Export CSV" />}
      />

      <div className="mt-8">
        <TouristListClient initialTourists={tourists} />
      </div>
    </AdminShell>
  );
}

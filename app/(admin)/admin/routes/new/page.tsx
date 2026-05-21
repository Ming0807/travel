import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RouteForm } from "@/components/admin/routes/RouteForm";
import { requirePermission } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "New Suggested Route | Admin",
};

export default async function NewAdminRoutePage() {
  await requirePermission("route.create");

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="สร้างเส้นทางแนะนำใหม่"
          description="เพิ่มเส้นทางท่องเที่ยวแนะนำสำหรับนักท่องเที่ยว"
        />

        <div className="mt-8">
          <RouteForm />
        </div>
      </div>
    </AdminShell>
  );
}

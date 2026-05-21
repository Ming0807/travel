import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RouteForm } from "@/components/admin/routes/RouteForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRouteById } from "@/lib/repositories/admin-route.repository";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Suggested Route | Admin",
};

export default async function EditAdminRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("route.update");

  const resolvedParams = await params;
  const routeId = parseInt(resolvedParams.id, 10);
  if (isNaN(routeId)) {
    notFound();
  }

  const route = await getAdminRouteById(routeId);
  if (!route) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title={`แก้ไขเส้นทาง: ${route.name_th}`}
          description="แก้ไขรายละเอียดเส้นทางท่องเที่ยวแนะนำ"
        />

        <div className="mt-8">
          <RouteForm initialData={route} />
        </div>
      </div>
    </AdminShell>
  );
}

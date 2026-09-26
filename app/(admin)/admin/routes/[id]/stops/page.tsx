import { requirePermission } from "@/lib/auth/guards";
import { notFound, redirect } from "next/navigation";

export default async function AdminRouteStopsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("route.update");

  const { id } = await params;
  const routeId = Number.parseInt(id, 10);
  if (!Number.isInteger(routeId) || routeId < 1) notFound();

  redirect(`/admin/routes/${routeId}/edit#stops`);
}

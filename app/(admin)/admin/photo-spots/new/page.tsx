import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PhotoSpotForm } from "@/components/admin/photo-spots/PhotoSpotForm";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminAttractions } from "@/lib/repositories/admin-attraction.repository";

export const metadata: Metadata = {
  title: "New Photo Spot | Admin",
};

export default async function NewAdminPhotoSpotPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("photo_spot.create");
  const resolvedSearchParams = await searchParams;
  const rawAttractionId = Array.isArray(resolvedSearchParams?.attraction_id)
    ? resolvedSearchParams?.attraction_id[0]
    : resolvedSearchParams?.attraction_id;
  const defaultAttractionId = rawAttractionId ? Number(rawAttractionId) : null;

  // Fetch attractions for the dropdown
  // For a large database, this might need an autocomplete, but for MVP a list is fine.
  // We fetch up to 1000 attractions.
  const { items: attractions } = await listAdminAttractions({ page: 1, pageSize: 1000 });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="เพิ่มจุดถ่ายภาพใหม่"
          description="เพิ่มจุดถ่ายภาพในแหล่งท่องเที่ยว"
        />

        <div className="mt-8 max-w-6xl">
          <PhotoSpotForm 
            attractions={attractions.map(a => ({ id: a.attraction_id, label: a.name_th }))}
            defaultAttractionId={Number.isFinite(defaultAttractionId) ? defaultAttractionId : null}
            submitLabel="เพิ่มจุดถ่ายภาพ"
          />
        </div>
      </div>
    </AdminShell>
  );
}

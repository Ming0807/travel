import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BadgeForm } from "@/components/admin/badges/BadgeForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminBadgeById } from "@/lib/repositories/admin-badge.repository";

export const metadata: Metadata = {
  title: "Edit Badge | Admin",
};

export default async function EditAdminBadgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("badge.update");

  const { id } = await params;
  const badgeId = Number(id);

  if (!Number.isFinite(badgeId)) {
    notFound();
  }

  const badge = await getAdminBadgeById(badgeId);

  if (!badge) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Gamification"
          title={`แก้ไข: ${badge.nameTh}`}
          description={badge.nameEn ?? "แก้ไขข้อมูลเหรียญตรา"}
        />
        <div className="mt-8 max-w-6xl">
          <BadgeForm badge={badge} submitLabel="บันทึกการเปลี่ยนแปลง" />
        </div>
      </div>
    </AdminShell>
  );
}

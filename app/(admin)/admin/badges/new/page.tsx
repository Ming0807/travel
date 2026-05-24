import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BadgeForm } from "@/components/admin/badges/BadgeForm";
import { requirePermission } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "New Badge | Admin",
};

export default async function NewAdminBadgePage() {
  await requirePermission("badge.create");

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Gamification"
          title="สร้าง Badge ใหม่"
          description="เพิ่มเหรียญตราใหม่สำหรับระบบสะสมคะแนนนักท่องเที่ยว"
        />
        <div className="mt-8 max-w-6xl">
          <BadgeForm />
        </div>
      </div>
    </AdminShell>
  );
}

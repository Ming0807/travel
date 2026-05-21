import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoryForm } from "@/components/admin/stories/StoryForm";
import { requirePermission } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New Travel Story | Admin",
};

export default async function NewAdminStoryPage() {
  await requirePermission("story.create");

  const supabase = await createSupabaseServerClient();
  const { data: provinces } = await supabase
    .from("provinces")
    .select("province_id, province_name_th")
    .order("province_id");

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="สร้างบทความใหม่"
          description="เพิ่มบทความแนะนำสถานที่ท่องเที่ยวหรือเรื่องราวที่น่าสนใจ"
        />

        <div className="mt-8">
          <StoryForm provinces={provinces ?? []} />
        </div>
      </div>
    </AdminShell>
  );
}

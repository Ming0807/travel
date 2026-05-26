import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoryVisualEditor } from "@/components/admin/stories/visual-editor/StoryVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminStoryById } from "@/lib/repositories/admin-story.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Travel Story | Admin",
};

export default async function EditAdminStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("story.update");

  const resolvedParams = await params;
  const storyId = parseInt(resolvedParams.id, 10);
  if (isNaN(storyId)) {
    notFound();
  }

  const story = await getAdminStoryById(storyId);
  if (!story) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: provinces } = await supabase
    .from("provinces")
    .select("province_id, province_name_th")
    .order("province_id");

  return (
    <StoryVisualEditor
      story={story}
      provinces={provinces ?? []}
    />
  );
}

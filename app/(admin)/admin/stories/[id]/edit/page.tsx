import { Metadata } from "next";
import { StoryVisualEditor } from "@/components/admin/stories/visual-editor/StoryVisualEditor";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAdminStoryById } from "@/lib/repositories/admin-story.repository";
import { getCoverMediaForEntity } from "@/lib/repositories/admin-media.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminMediaPreviewUrl } from "@/lib/media/storage-paths";
import { listStoryTopics } from "@/lib/repositories/story-taxonomy.repository";
import { listStoryRevisions } from "@/lib/repositories/story-revision.repository";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Travel Story | Admin",
};

export default async function EditAdminStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const guard = await requirePermission("story.update");

  const resolvedParams = await params;
  const storyId = parseInt(resolvedParams.id, 10);
  if (isNaN(storyId)) {
    notFound();
  }

  const canReadRevisions = hasPermission(guard.actor, "story.revision_read");
  const [story, coverMedia, topics, revisionResult] = await Promise.all([
    getAdminStoryById(storyId),
    getCoverMediaForEntity("story", storyId),
    listStoryTopics(),
    canReadRevisions
      ? listStoryRevisions({ storyId, pageSize: 5 })
      : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 5 }),
  ]);
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
      topics={topics}
      revisions={revisionResult.items.map((revision) => ({
        revisionId: revision.revisionId,
        revisionNumber: revision.revisionNumber,
        sourceAction: revision.sourceAction,
        changeSummary: revision.changeSummary,
        createdAt: revision.createdAt,
      }))}
      coverMediaId={coverMedia?.media_id ?? null}
      coverMediaUrl={adminMediaPreviewUrl(coverMedia?.storage_path)}
    />
  );
}

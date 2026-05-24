import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminStoryById } from "@/lib/repositories/admin-story.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { notFound } from "next/navigation";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Story Media | Admin",
};

export default async function AdminStoryMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("attraction.update");

  const resolvedParams = await params;
  const storyId = parseInt(resolvedParams.id, 10);
  if (isNaN(storyId)) {
    notFound();
  }

  const story = await getAdminStoryById(storyId);
  if (!story) {
    notFound();
  }

  const mediaList = await listAdminMedia({ entityType: 'story', entityId: storyId, page: 1, pageSize: 100 });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link href="/admin/stories" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#0A6B62]">
            <ArrowLeft size={16} /> กลับไปยังหน้ารายการ
          </Link>
          <AdminPageHeader
            eyebrow="Story Media"
            title={`จัดการสื่อ: ${story.title}`}
            description="จัดการรูปภาพและแกลอรี่สำหรับบทความนี้"
          />
        </div>

        <div className="mt-8">
          <MediaManager entityId={storyId} entityType="story" initialMedia={mediaList.items} />
        </div>
      </div>
    </AdminShell>
  );
}

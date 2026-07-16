export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { StoryLibraryPage } from "@/components/admin/stories/library/StoryLibraryPage";
import { requirePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "เรื่องเล่าจากนักเดินทาง | Admin" };

export default async function AdminStorySubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("story.read");
  return <StoryLibraryPage mode="submissions" rawSearchParams={await searchParams} />;
}

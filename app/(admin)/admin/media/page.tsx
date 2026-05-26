import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { requirePermission } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Media Library | Admin",
};

export default async function MediaPage() {
  await requirePermission("media.read");

  return (
    <AdminShell>
      <div className="mx-auto flex h-[calc(100vh-120px)] max-w-7xl flex-col">
        <div className="mb-6 shrink-0">
          <AdminPageHeader
            eyebrow="Content Assets"
            title="Media Library"
            description="Search, upload, pick, and govern official public media assets. Edit public page image roles and alt text from each content editor."
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <MediaLibrary mode="manage" />
        </div>
      </div>
    </AdminShell>
  );
}

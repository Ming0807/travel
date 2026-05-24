"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export default function MediaPage() {
  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div className="mb-6 shrink-0">
          <AdminPageHeader
            title="Media Library"
            description="Manage all images and assets used across the platform."
          />
        </div>
        
        <div className="flex-1 min-h-0 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
          <MediaLibrary mode="manage" />
        </div>
      </div>
    </AdminShell>
  );
}

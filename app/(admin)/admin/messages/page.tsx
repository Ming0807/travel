import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listAdminMessages } from "@/app/actions/admin-messages";
import { MessageListClient } from "@/components/admin/messages/MessageListClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const status = resolvedParams.status || "all";
  const search = resolvedParams.search || "";

  const result = await listAdminMessages({
    page,
    limit: 20,
    status,
    search,
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminPageHeader
            eyebrow="System"
            title="Messages"
            description="จัดการข้อความติดต่อสอบถามและแบบฟอร์มติดต่อจากหน้าเว็บไซต์"
          />
        </div>

        <Suspense fallback={<div className="p-8 text-center text-muted animate-pulse">กำลังโหลดข้อความ...</div>}>
          <MessageListClient
            initialMessages={result.messages}
            totalPages={result.totalPages}
            currentPage={result.page}
          />
        </Suspense>
      </div>
    </AdminShell>
  );
}

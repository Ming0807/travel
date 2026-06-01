import { Suspense } from "react";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { listAdminMessages } from "@/app/actions/admin-messages";
import { MessageListClient } from "@/components/admin/messages/MessageListClient";
import { ExportButton } from "@/components/admin/ExportButton";

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
    <ListPageShell
      eyebrow="System"
      title="Messages"
      description="จัดการข้อความติดต่อสอบถามและแบบฟอร์มติดต่อจากหน้าเว็บไซต์"
      headerActions={<ExportButton endpoint="/api/admin/export/messages" label="Export CSV" />}
      hideCreateButton
      total={result.total ?? 0}
      page={result.page}
      pageSize={result.limit}
    >
      <Suspense fallback={<div className="p-8 text-center text-muted animate-pulse">กำลังโหลดข้อความ...</div>}>
        <MessageListClient
          initialMessages={result.messages}
          totalPages={result.totalPages}
          currentPage={result.page}
          total={result.total}
          pageSize={result.limit}
        />
      </Suspense>
    </ListPageShell>
  );
}

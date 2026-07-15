import { Suspense } from "react";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { listAdminMessages } from "@/app/actions/admin-messages";
import { MessageListClient } from "@/components/admin/messages/MessageListClient";
import { ExportButton } from "@/components/admin/ExportButton";
import { adminMessageQuerySchema } from "@/lib/validation/admin-message";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; status?: string; search?: string; sort?: string }>;
}) {
  const guard = await requirePermission("message.read");
  const resolvedParams = await searchParams;
  const parsed = adminMessageQuerySchema.safeParse(resolvedParams);

  if (!parsed.success) {
    redirect("/admin/messages");
  }

  const filters = parsed.data;
  const result = await listAdminMessages(filters);

  return (
    <ListPageShell
      eyebrow="การติดต่อจากเว็บไซต์"
      title="ข้อความติดต่อ"
      description="จัดการข้อความติดต่อสอบถามและแบบฟอร์มติดต่อจากหน้าเว็บไซต์"
      headerActions={
        hasPermission(guard.actor, "export.messages") &&
        hasPermission(guard.actor, "export.personal_data") ? (
          <ExportButton endpoint="/api/admin/export/messages" label="ส่งออกข้อมูล" />
        ) : null
      }
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
          filters={filters}
          canDelete={hasPermission(guard.actor, "message.delete")}
        />
      </Suspense>
    </ListPageShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminMessage } from "@/app/actions/admin-messages";
import { MessageDetailClient } from "@/components/admin/messages/MessageDetailClient";
import { hasPermission, requirePermission } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminMessageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const guard = await requirePermission("message.read");
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams.returnTo?.startsWith("/admin/messages")
    ? resolvedSearchParams.returnTo
    : "/admin/messages";
  const message = await getAdminMessage(resolvedParams.id);

  if (!message) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link
            href={returnTo}
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0A6B62] transition hover:text-[#075049]"
          >
            <CaretLeft size={16} weight="bold" /> กลับไปหน้ารวมข้อความ
          </Link>
          <AdminPageHeader
            eyebrow="ข้อความติดต่อ"
            title="รายละเอียดข้อความ"
            description="รายละเอียดข้อความจากผู้ติดต่อ"
          />
        </div>

        <MessageDetailClient
          message={message}
          returnTo={returnTo}
          canUpdate={hasPermission(guard.actor, "message.update")}
          canDelete={hasPermission(guard.actor, "message.delete")}
        />
      </div>
    </AdminShell>
  );
}

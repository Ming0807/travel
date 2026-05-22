import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminMessage } from "@/app/actions/admin-messages";
import { MessageDetailClient } from "@/components/admin/messages/MessageDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const message = await getAdminMessage(resolvedParams.id);

  if (!message) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/messages"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0A6B62] transition hover:text-[#075049]"
          >
            <CaretLeft size={16} weight="bold" /> กลับไปหน้ารวมข้อความ
          </Link>
          <AdminPageHeader
            eyebrow="System"
            title="Message Details"
            description="รายละเอียดข้อความจากผู้ติดต่อ"
          />
        </div>

        <MessageDetailClient message={message} />
      </div>
    </AdminShell>
  );
}

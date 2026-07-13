import type { ReactNode } from "react";
import { AdminShell, type AdminShellAdmin } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/admin/Pagination";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";

type ListPageShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  createHref?: string;
  createLabel?: string;
  headerActions?: ReactNode;
  hideCreateButton?: boolean;
  total: number;
  page: number;
  pageSize: number;
  filters?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  admin?: AdminShellAdmin | null;
};

export function ListPageShell({
  children,
  eyebrow,
  title,
  description,
  createHref = "/admin",
  createLabel = "เพิ่มรายการใหม่",
  headerActions,
  hideCreateButton = false,
  total,
  page,
  pageSize,
  filters,
  emptyTitle,
  emptyDescription,
  admin,
}: ListPageShellProps) {
  return (
    <AdminShell admin={admin}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <AdminPageHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            actions={headerActions}
          />
          {!hideCreateButton && (
            <Link
              href={createHref}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
            >
              <Plus size={20} weight="bold" />
              {createLabel}
            </Link>
          )}
        </div>

        {filters ? filters : null}

        {total === 0 ? (
          <EmptyState
            title={emptyTitle ?? "ไม่พบรายการ"}
            description={
              emptyDescription ?? "ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
            }
            action={
              !hideCreateButton ? (
                <Link
                  href={createHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#075049]"
                >
                  <Plus size={16} weight="bold" />
                  {createLabel}
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            {children}
            <Pagination page={page} pageSize={pageSize} total={total} />
          </>
        )}
      </div>
    </AdminShell>
  );
}

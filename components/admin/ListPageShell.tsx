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
  const createAction = !hideCreateButton ? (
    <Link
      href={createHref}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[4px] bg-[#C84F2D] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#A83E23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]"
    >
      <Plus size={20} weight="bold" aria-hidden="true" />
      {createLabel}
    </Link>
  ) : null;

  return (
    <AdminShell admin={admin}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={
            headerActions || createAction ? (
              <>
                {headerActions}
                {createAction}
              </>
            ) : null
          }
        />

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
                  className="inline-flex min-h-11 items-center gap-2 rounded-[4px] bg-[#C84F2D] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#A83E23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]"
                >
                  <Plus size={16} weight="bold" aria-hidden="true" />
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

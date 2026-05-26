export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut, Plus } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar } from "@/components/admin/FilterBar";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminCheckinCodes } from "@/lib/repositories/admin-checkin-code.repository";
import { adminCheckinCodeFiltersSchema } from "@/lib/validation/checkin-code";
import { CheckinCodeStatusAction } from "@/components/admin/checkin-codes/CheckinCodeStatusAction";
import { DownloadQrAction } from "@/components/admin/checkin-codes/DownloadQrAction";

export const metadata: Metadata = {
  title: "QR Check-in Codes | Admin",
};

const columns = [
  { key: "code", label: "Check-in code" },
  { key: "attraction", label: "Attraction", className: "hidden md:table-cell" },
  { key: "spot", label: "Photo spot", className: "hidden lg:table-cell" },
  { key: "label", label: "Label", className: "hidden lg:table-cell" },
  { key: "period", label: "Schedule", className: "hidden xl:table-cell" },
  { key: "status", label: "Status" },
  { key: "actions", label: "", className: "w-32" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AttractionStatusWarnings({
  isActive,
  isPublished,
}: {
  isActive: boolean | null;
  isPublished: boolean | null;
}) {
  if (isActive !== false && isPublished !== false) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {isActive === false ? <StatusBadge label="Attraction inactive" tone="red" /> : null}
      {isPublished === false ? <StatusBadge label="Attraction draft" tone="gold" /> : null}
    </div>
  );
}

function CheckinCodeActions({ code, label }: { code: string; label?: string | null }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/c/${code}`}
        target="_blank"
        aria-label={`Open QR landing for ${code}`}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0A6B62]"
      >
        <ArrowSquareOut size={18} weight="bold" />
      </Link>
      <DownloadQrAction code={code} label={label || code} />
    </div>
  );
}

export default async function AdminCheckinCodesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("checkin_code.read");
  const raw = await searchParams;
  const parsed = adminCheckinCodeFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminCheckinCodes(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <AdminPageHeader
            eyebrow="Content Management"
            title="QR Check-in Codes"
            description="จัดการ QR ที่นักท่องเที่ยวสแกนเพื่อเข้า flow check-in, certificate, และ stamp"
          />
          <Link
            href="/admin/checkin-codes/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#075049]"
          >
            <Plus size={16} weight="bold" />
            สร้างรหัสใหม่
          </Link>
        </div>

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหารหัส, label..." />
          </div>
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบ Check-in Code"
            description="ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองก่อนสร้าง QR ใหม่"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable columns={columns}>
                {items.map((code) => (
                  <tr key={code.checkin_code_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-bold text-[#073F37]">{code.code}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">/c/{code.code}</p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs font-semibold text-slate-600">
                        {code.attraction_name_th ?? "-"}
                      </span>
                      <AttractionStatusWarnings
                        isActive={code.attraction_is_active}
                        isPublished={code.attraction_is_published}
                      />
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs text-slate-500">{code.photo_spot_name_th ?? "-"}</span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs text-slate-500">{code.label ?? "-"}</span>
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      <span className="text-[11px] text-slate-400">
                        {formatDate(code.starts_at)} - {formatDate(code.ends_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          label={code.is_active ? "Active" : "Inactive"}
                          tone={code.is_active ? "green" : "red"}
                        />
                        {code.ends_at && new Date(code.ends_at) < new Date() ? (
                          <StatusBadge label="Expired" tone="gray" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <CheckinCodeActions code={code.code} label={code.label} />
                        <CheckinCodeStatusAction
                          checkinCodeId={code.checkin_code_id}
                          isActive={code.is_active}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="grid gap-4 md:hidden">
              {items.map((code) => (
                <div
                  key={code.checkin_code_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-mono text-sm font-bold text-[#073F37]">{code.code}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">/c/{code.code}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={code.is_active ? "Active" : "Inactive"}
                        tone={code.is_active ? "green" : "red"}
                      />
                      {code.ends_at && new Date(code.ends_at) < new Date() ? (
                        <StatusBadge label="Expired" tone="gray" />
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Attraction</p>
                      <p className="font-semibold text-slate-700">{code.attraction_name_th ?? "-"}</p>
                      <AttractionStatusWarnings
                        isActive={code.attraction_is_active}
                        isPublished={code.attraction_is_published}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Photo spot</p>
                      <p className="font-semibold text-slate-700">{code.photo_spot_name_th ?? "-"}</p>
                    </div>
                    {code.label ? (
                      <div>
                        <p className="text-xs text-slate-400">Label</p>
                        <p className="font-semibold text-slate-700">{code.label}</p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs text-slate-400">Schedule</p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(code.starts_at)} - {formatDate(code.ends_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    <CheckinCodeActions code={code.code} label={code.label} />
                    <CheckinCodeStatusAction
                      checkinCodeId={code.checkin_code_id}
                      isActive={code.is_active}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} pageSize={pageSize} total={total} />
          </>
        )}
      </div>
    </AdminShell>
  );
}

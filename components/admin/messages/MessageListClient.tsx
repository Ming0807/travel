"use client";

import { type FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  EnvelopeSimple, 
  EnvelopeOpen, 
  Trash, 
  Archive, 
  CheckCircle,
  MagnifyingGlass
} from "@phosphor-icons/react/dist/ssr";
import { Pagination } from "@/components/admin/Pagination";
import { removeAdminMessage } from "@/app/actions/admin-messages";
import type { AdminMessageQuery, ContactMessageStatusFilter, ContactMessageSort } from "@/lib/validation/admin-message";

type MessageStatus = "unread" | "read" | "archived";

export type AdminMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  is_replied: boolean;
  created_at: string;
};

const STATUS_OPTIONS: Array<{ value: ContactMessageStatusFilter; label: string }> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "unread", label: "ยังไม่ได้อ่าน" },
  { value: "read", label: "อ่านแล้ว" },
  { value: "archived", label: "เก็บถาวร" },
];

export function MessageListClient({
  initialMessages,
  totalPages,
  currentPage,
  total,
  pageSize,
  filters,
  canDelete,
}: {
  initialMessages: AdminMessageRow[];
  totalPages: number;
  currentPage: number;
  total?: number;
  pageSize?: number;
  filters: AdminMessageQuery;
  canDelete: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(filters.search ?? "");

  const navigateWithFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || (key === "sort" && value === "newest")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateWithFilters({ search: searchTerm.trim() || null });
  };

  const currentListUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const detailHref = (id: string) =>
    `/admin/messages/${id}?returnTo=${encodeURIComponent(currentListUrl)}`;


  const handleDelete = (id: string) => {
    if (!confirm("ยืนยันการลบข้อความนี้หรือไม่")) return;
    startTransition(async () => {
      try {
        await removeAdminMessage(id);
        router.refresh();
      } catch {
        alert("ไม่สามารถลบข้อความได้ กรุณาลองใหม่");
      }
    });
  };


  const emptyState = (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-ink/10 bg-white p-12 text-center">
      <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-400">
        <EnvelopeSimple size={48} weight="light" />
      </div>
      <h3 className="text-lg font-bold text-ink">ไม่มีข้อความ</h3>
      <p className="mt-2 text-sm text-muted max-w-sm">
        ยังไม่มีข้อความที่ตรงกับตัวกรองปัจจุบัน
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form className="w-full max-w-md" onSubmit={handleSearch}>
          <label htmlFor="message-search" className="mb-1 block text-xs font-bold text-slate-600">
            ค้นหาข้อความ
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <MagnifyingGlass size={18} />
            </div>
            <input
              id="message-search"
              type="search"
              className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]/20"
              placeholder="ค้นหาชื่อ อีเมล หัวข้อ หรือข้อความ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="mb-1 block text-xs font-bold text-slate-600">สถานะ</span>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => navigateWithFilters({ status: status.value })}
                aria-pressed={filters.status === status.value}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  filters.status === status.value
                    ? "bg-[#F3704C] text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {status.label}
              </button>
            ))}
            </div>
          </div>

          <div>
            <label htmlFor="message-sort" className="mb-1 block text-xs font-bold text-slate-600">
              เรียงลำดับ
            </label>
            <select
              id="message-sort"
              value={filters.sort}
              onChange={(event) => navigateWithFilters({ sort: event.target.value as ContactMessageSort })}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]/20"
            >
              <option value="newest">ล่าสุดก่อน</option>
              <option value="oldest">เก่าสุดก่อน</option>
            </select>
          </div>
        </div>
      </div>

      {initialMessages.length === 0 ? emptyState : (
        <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">ผู้ส่ง</th>
                <th className="px-6 py-4">หัวข้อ / ข้อความ</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4 text-right">คำสั่ง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {initialMessages.map((msg) => (
                <tr 
                  key={msg.id} 
                  className={`transition-colors hover:bg-slate-50 ${msg.status === "unread" ? "bg-slate-50 font-semibold" : ""}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {msg.status === "unread" ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#FFEBE5] px-2.5 py-1 text-xs font-bold text-[#F3704C]">
                          <EnvelopeSimple size={14} weight="bold" />
                          ยังไม่ได้อ่าน
                        </span>
                      ) : msg.status === "archived" ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          <Archive size={14} weight="fill" />
                          เก็บถาวร
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          <EnvelopeOpen size={14} weight="regular" />
                          อ่านแล้ว
                        </span>
                      )}
                      
                      {msg.is_replied && (
                        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                          <CheckCircle size={14} weight="fill" />
                          ตอบแล้ว
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-ink">{msg.name}</div>
                    <div className="text-xs text-muted">{msg.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={detailHref(msg.id)} className="group block max-w-md">
                      <div className="truncate text-ink group-hover:text-blue-600 transition-colors">
                        {msg.subject || "(ไม่มีหัวข้อ)"}
                      </div>
                      <div className="truncate text-xs text-muted font-normal mt-0.5">
                        {msg.message}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted text-xs">
                    {new Date(msg.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={detailHref(msg.id)}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        ดูรายละเอียด
                      </Link>
                      
                      {canDelete ? <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={isPending}
                        className="p-1.5 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="ลบข้อความ"
                      >
                        <Trash size={18} />
                      </button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {initialMessages.map((msg) => (
          <Link
            key={msg.id}
            href={detailHref(msg.id)}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900 truncate">{msg.name}</span>
                  {msg.status === "unread" && (
                    <span className="h-2 w-2 rounded-full bg-[#F3704C] shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{msg.email}</p>
              </div>
              <div className="flex flex-wrap gap-1 shrink-0">
                {msg.status === "unread" && (
                  <span className="rounded-full bg-[#FFEBE5] px-2 py-0.5 text-xs font-bold text-[#F3704C]">
                    New
                  </span>
                )}
                {msg.is_replied && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                    Replied
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {msg.subject || "(ไม่มีหัวข้อ)"}
              </p>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                {msg.message}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">
                {new Date(msg.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(msg.id);
                  }}
                  disabled={isPending}
                  className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={currentPage} pageSize={pageSize ?? 20} total={total ?? totalPages * (pageSize ?? 20)} />
      )}
        </>
      )}
    </div>
  );
}

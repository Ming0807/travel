"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  EnvelopeSimple, 
  EnvelopeOpen, 
  Trash, 
  Archive, 
  CheckCircle,
  Funnel,
  MagnifyingGlass
} from "@phosphor-icons/react/dist/ssr";
import { Pagination } from "@/components/admin/Pagination";
import { 
  setAdminMessageStatus, 
  removeAdminMessage, 
  toggleAdminMessageReplied 
} from "@/app/actions/admin-messages";

export function MessageListClient({
  initialMessages,
  totalPages,
  currentPage,
  total,
  pageSize,
}: {
  initialMessages: any[];
  totalPages: number;
  currentPage: number;
  total?: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = initialMessages.filter((msg) => {
    const matchesStatus = !statusFilter || msg.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (msg.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.message || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (id: string, status: "unread" | "read" | "archived") => {
    startTransition(async () => {
      try {
        await setAdminMessageStatus(id, status);
        router.refresh();
      } catch (e) {
        alert("Failed to update status");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    startTransition(async () => {
      try {
        await removeAdminMessage(id);
        router.refresh();
      } catch (e) {
        alert("Failed to delete message");
      }
    });
  };

  const handleToggleReplied = (id: string, isReplied: boolean) => {
    startTransition(async () => {
      try {
        await toggleAdminMessageReplied(id, isReplied);
        router.refresh();
      } catch (e) {
        alert("Failed to update replied status");
      }
    });
  };

  if (initialMessages.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-ink/10 bg-white p-12 text-center">
        <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-400">
          <EnvelopeSimple size={48} weight="light" />
        </div>
        <h3 className="text-lg font-bold text-ink">ไม่มีข้อความ</h3>
        <p className="mt-2 text-sm text-muted max-w-sm">
          ยังไม่มีข้อความติดต่อจากนักท่องเที่ยวในขณะนี้
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <MagnifyingGlass size={18} />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]/20"
            placeholder="Search sender, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
            {["", "unread", "read", "archived"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  statusFilter === status
                    ? "bg-[#F3704C] text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {status === "" ? "All" : status === "unread" ? "Unread" : status === "read" ? "Read" : "Archived"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Subject / Message</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredMessages.map((msg) => (
                <tr 
                  key={msg.id} 
                  className={`transition-colors hover:bg-slate-50 ${msg.status === "unread" ? "bg-slate-50 font-semibold" : ""}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {msg.status === "unread" ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-[#FFEBE5] px-2.5 py-1 text-xs font-bold text-[#F3704C]">
                          <EnvelopeSimple size={14} weight="bold" />
                          Unread
                        </span>
                      ) : msg.status === "archived" ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          <Archive size={14} weight="fill" />
                          Archived
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          <EnvelopeOpen size={14} weight="regular" />
                          Read
                        </span>
                      )}
                      
                      {msg.is_replied && (
                        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                          <CheckCircle size={14} weight="fill" />
                          Replied
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-ink">{msg.name}</div>
                    <div className="text-xs text-muted">{msg.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/messages/${msg.id}`} className="group block max-w-md">
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
                        href={`/admin/messages/${msg.id}`}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        View
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={isPending}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
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
        {filteredMessages.map((msg) => (
          <Link
            key={msg.id}
            href={`/admin/messages/${msg.id}`}
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
                  <span className="rounded-full bg-[#FFEBE5] px-2 py-0.5 text-[10px] font-bold text-[#F3704C]">
                    New
                  </span>
                )}
                {msg.is_replied && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
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
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
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
    </div>
  );
}

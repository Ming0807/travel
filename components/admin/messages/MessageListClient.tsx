"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  EnvelopeSimple, 
  EnvelopeOpen, 
  Trash, 
  Archive, 
  CheckCircle 
} from "@phosphor-icons/react";
import { 
  setAdminMessageStatus, 
  removeAdminMessage, 
  toggleAdminMessageReplied 
} from "@/app/actions/admin-messages";

export function MessageListClient({
  initialMessages,
  totalPages,
  currentPage,
}: {
  initialMessages: any[];
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-[2rem] border border-dashed border-ink/10 bg-white p-12 text-center">
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
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
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
              {initialMessages.map((msg) => (
                <tr 
                  key={msg.id} 
                  className={`transition-colors hover:bg-slate-50 ${msg.status === "unread" ? "bg-[#FCFAF8] font-semibold" : ""}`}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <Link
                key={pageNum}
                href={`/admin/messages?page=${pageNum}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
                  currentPage === pageNum
                    ? "bg-[#0A6B62] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

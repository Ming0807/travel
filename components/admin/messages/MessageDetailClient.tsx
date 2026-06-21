"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  Archive, 
  Trash, 
  EnvelopeSimple, 
  ArrowUUpLeft 
} from "@phosphor-icons/react";
import { 
  setAdminMessageStatus, 
  removeAdminMessage, 
  toggleAdminMessageReplied 
} from "@/app/actions/admin-messages";

export function MessageDetailClient({ message }: { message: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "unread" | "read" | "archived") => {
    startTransition(async () => {
      try {
        await setAdminMessageStatus(message.id, status);
        if (status === "archived") {
          router.push("/admin/messages");
        } else {
          router.refresh();
        }
      } catch {
        alert("Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    startTransition(async () => {
      try {
        await removeAdminMessage(message.id);
        router.push("/admin/messages");
        router.refresh();
      } catch {
        alert("Failed to delete message");
      }
    });
  };

  const handleToggleReplied = () => {
    startTransition(async () => {
      try {
        await toggleAdminMessageReplied(message.id, !message.is_replied);
        router.refresh();
      } catch {
        alert("Failed to update replied status");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 shadow-sm">
        <button
          onClick={() => handleToggleReplied()}
          disabled={isPending}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            message.is_replied 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {message.is_replied ? (
            <>
              <CheckCircle size={18} weight="fill" /> Marked as Replied
            </>
          ) : (
            <>
              <ArrowUUpLeft size={18} /> Mark as Replied
            </>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {message.status !== "unread" && (
          <button
            onClick={() => handleStatusChange("unread")}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <EnvelopeSimple size={18} /> Mark Unread
          </button>
        )}

        {message.status !== "archived" && (
          <button
            onClick={() => handleStatusChange("archived")}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Archive size={18} /> Archive
          </button>
        )}

        <div className="flex-1"></div>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash size={18} /> Delete
        </button>
      </div>

      {/* Message Content */}
      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-bold text-ink">{message.subject || "(ไม่มีหัวข้อ)"}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <span className="font-semibold text-slate-700">{message.name}</span>
              <span className="text-slate-300">&bull;</span>
              <a href={`mailto:${message.email}`} className="text-[#0A6B62] hover:underline">
                {message.email}
              </a>
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">
            {new Date(message.created_at).toLocaleString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </div>

        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">
          {message.message}
        </div>
      </div>
    </div>
  );
}

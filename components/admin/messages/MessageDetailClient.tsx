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
import type { AdminMessageRow } from "@/components/admin/messages/MessageListClient";

export function MessageDetailClient({
  message,
  returnTo,
  canUpdate,
  canDelete,
}: {
  message: AdminMessageRow;
  returnTo: string;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "unread" | "read" | "archived") => {
    startTransition(async () => {
      try {
        await setAdminMessageStatus(message.id, status);
        if (status === "archived") {
          router.push(returnTo);
        } else {
          router.refresh();
        }
      } catch {
        alert("ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("ยืนยันการลบข้อความนี้หรือไม่")) return;
    startTransition(async () => {
      try {
        await removeAdminMessage(message.id);
        router.push(returnTo);
        router.refresh();
      } catch {
        alert("ไม่สามารถลบข้อความได้ กรุณาลองใหม่");
      }
    });
  };

  const handleToggleReplied = () => {
    startTransition(async () => {
      try {
        await toggleAdminMessageReplied(message.id, !message.is_replied);
        router.refresh();
      } catch {
        alert("ไม่สามารถอัปเดตสถานะการตอบกลับได้ กรุณาลองใหม่");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Actions Bar */}
      {canUpdate || canDelete ? <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 shadow-sm">
        {canUpdate ? <>
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
              <CheckCircle size={18} weight="fill" /> ตอบแล้ว
            </>
          ) : (
            <>
              <ArrowUUpLeft size={18} /> ทำเครื่องหมายว่าตอบแล้ว
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
            <EnvelopeSimple size={18} /> ทำเครื่องหมายว่ายังไม่อ่าน
          </button>
        )}

        {message.status !== "archived" && (
          <button
            onClick={() => handleStatusChange("archived")}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Archive size={18} /> เก็บถาวร
          </button>
        )}

        </> : null}

        <div className="flex-1" />

        {canDelete ? <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash size={18} /> ลบข้อความ
        </button> : null}
      </div> : null}

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

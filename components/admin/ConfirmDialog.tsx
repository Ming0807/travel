"use client";

import { useCallback, useEffect, useRef } from "react";
import { WarningCircle, X } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "info";
  isPending?: boolean;
};

const toneStyles = {
  danger: {
    icon: "text-rose-600 bg-rose-50",
    button: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
  },
  warning: {
    icon: "text-amber-600 bg-amber-50",
    button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  },
  info: {
    icon: "text-[#0A6B62] bg-[#E6F4EF]",
    button: "bg-[#073F37] hover:bg-[#0A6B62] focus:ring-[#0A6B62]",
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  detail,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  tone = "danger",
  isPending = false,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const styles = toneStyles[tone];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => confirmRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const messageId = `confirm-dialog-message-${title.replace(/\s+/g, "-")}`;

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${messageId}-heading`}
      aria-describedby={messageId}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onKeyDown={(e) => {
          // Basic focus trap
          if (e.key === "Tab") {
            const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={cancelLabel}
        >
          <X size={18} weight="bold" />
        </button>

        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.icon}`}>
          <WarningCircle size={22} weight="fill" />
        </div>

        <h3 id={`${messageId}-heading`} className="text-lg font-black text-slate-800">{title}</h3>
        <p id={messageId} className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        {detail ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isPending}
            className="min-h-10 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isPending}
            className={`min-h-10 rounded-xl px-5 py-2 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
          >
            {isPending ? "กำลังดำเนินการ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}

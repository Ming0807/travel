"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { X } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl" | "full";
  bodyClassName?: string;
}

export function Drawer({ isOpen, onClose, title, children, size = "md", bodyClassName }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleFocusTrap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full m-4",
  };

  const drawerContent = (
    <div className="admin-app fixed inset-0 z-50 flex justify-end overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-950/55"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleFocusTrap}
        className={`relative flex h-[100dvh] w-full flex-col bg-white shadow-[-8px_0_24px_rgba(15,23,42,0.18)] ${sizeClasses[size]}`}
      >
        <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4">
          <h2 className="text-lg font-black text-[#202020]" id={titleId}>{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-[4px] text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#202020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]"
            aria-label={`ปิด ${title}`}
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className={bodyClassName ? `min-h-0 flex-1 overscroll-contain overflow-y-auto ${bodyClassName}` : "min-h-0 flex-1 overscroll-contain overflow-y-auto p-4 sm:p-6"}>
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(drawerContent, document.body);
}

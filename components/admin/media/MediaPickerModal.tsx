"use client";

import { X } from "@phosphor-icons/react";
import { MediaLibrary } from "./MediaLibrary";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export type MediaPickerAsset = {
  id: string;
  url: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  category: string;
  lifecycle_status?: string;
};

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onSelectAsset?: (asset: MediaPickerAsset) => void;
  title?: string;
  // When true, includes archived/draft assets in picker; default shows only active
  showArchived?: boolean;
};

export function MediaPickerModal({ isOpen, onClose, onSelect, onSelectAsset, title = "Select Image", showArchived = false }: MediaPickerModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="admin-app fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/65 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(88vh,900px)] sm:rounded-[var(--admin-radius-panel)]"
      >
        
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
          <div>
            <h2 id={titleId} className="text-lg font-black text-[#202020] sm:text-xl">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500 hidden sm:block">เลือกภาพจากคลังเพื่อใช้งานซ้ำ หรืออัปโหลดใหม่เพื่อช่วยประหยัดพื้นที่จัดเก็บ</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={`ปิด ${title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--admin-radius-control)] text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#202020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-50 pb-[env(safe-area-inset-bottom)]">
          <MediaLibrary 
            mode="pick" 
            showArchived={showArchived}
            onSelect={(url, asset) => {
              onSelect(url);
              if (onSelectAsset && asset) {
                onSelectAsset({
                  id: asset.id,
                  url: asset.url,
                  file_name: asset.file_name,
                  storage_path: asset.storage_path,
                  mime_type: asset.mime_type,
                  category: asset.category,
                  lifecycle_status: asset.lifecycle_status,
                });
              }
              onClose();
            }} 
          />
        </div>

      </div>
    </div>,
    document.body,
  );
}

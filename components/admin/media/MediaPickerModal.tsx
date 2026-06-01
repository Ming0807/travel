"use client";

import { X } from "@phosphor-icons/react";
import { MediaLibrary } from "./MediaLibrary";
import { useEffect } from "react";

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
  
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full h-[100dvh] sm:h-[85vh] max-w-6xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">{title}</h2>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 hidden sm:block">เลือกภาพจากคลังเพื่อใช้งานซ้ำ หรืออัปโหลดใหม่เพื่อช่วยประหยัดพื้นที่จัดเก็บ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-slate-50">
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
    </div>
  );
}

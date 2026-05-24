"use client";

import { X } from "@phosphor-icons/react";
import { MediaLibrary } from "./MediaLibrary";
import { useEffect } from "react";

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
};

export function MediaPickerModal({ isOpen, onClose, onSelect, title = "Select Image" }: MediaPickerModalProps) {
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-black text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-ink transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          <MediaLibrary 
            mode="pick" 
            onSelect={(url) => {
              onSelect(url);
              onClose();
            }} 
          />
        </div>

      </div>
    </div>
  );
}

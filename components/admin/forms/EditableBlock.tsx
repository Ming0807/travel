"use client";

import { PencilSimple } from "@phosphor-icons/react";
import { ReactNode } from "react";

interface EditableBlockProps {
  id: string;
  label: string;
  children: ReactNode;
  onEdit: () => void;
  isActive?: boolean;
}

export function EditableBlock({ id, label, children, onEdit, isActive = false }: EditableBlockProps) {
  return (
    <div 
      className={`group relative rounded-3xl transition-all duration-300 ${
        isActive ? 'ring-4 ring-teal ring-offset-4' : 'hover:ring-2 hover:ring-teal/50 hover:ring-offset-2'
      }`}
      id={`editable-block-${id}`}
    >
      {/* Edit Overlay Button */}
      <div className="absolute left-4 top-4 z-20 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 rounded-xl bg-teal px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal/20 transition-transform hover:scale-105 active:scale-95"
        >
          <PencilSimple size={18} weight="bold" />
          แก้ไข {label}
        </button>
      </div>
      
      {/* Subtle border to show boundaries when hovering */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl border-2 border-transparent transition-colors group-hover:border-teal/10" />
      
      <div className={isActive ? 'opacity-50' : ''}>
        {children}
      </div>
    </div>
  );
}

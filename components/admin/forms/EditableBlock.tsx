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
      className={`group relative rounded-[var(--admin-radius-panel)] transition-all duration-200 ${
        isActive ? 'ring-2 ring-[var(--admin-accent)] ring-offset-2' : 'hover:ring-2 hover:ring-[var(--admin-accent)]/35 hover:ring-offset-2'
      }`}
      id={`editable-block-${id}`}
    >
      {/* Edit Overlay Button */}
      <div className="absolute left-3 top-3 z-20 opacity-100 transition-opacity sm:left-4 sm:top-4 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] bg-[var(--admin-accent)] px-4 py-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-[var(--admin-accent-strong)]"
        >
          <PencilSimple size={18} weight="bold" />
          แก้ไข {label}
        </button>
      </div>
      
      {/* Subtle border to show boundaries when hovering */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-[var(--admin-radius-panel)] border-2 border-transparent transition-colors group-hover:border-[var(--admin-accent)]/20" />
      
      <div className={isActive ? 'opacity-50' : ''}>
        {children}
      </div>
    </div>
  );
}

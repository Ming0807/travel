"use client";

import { Funnel } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";

export function PublicFilterDisclosure({
  id,
  openLabel,
  closeLabel,
  children,
}: {
  id: string;
  openLabel: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--public-radius-control)] border border-black/15 bg-white px-4 text-sm font-bold text-[var(--public-ink)] sm:hidden"
      >
        <Funnel aria-hidden="true" size={18} weight="bold" />
        {open ? closeLabel : openLabel}
      </button>
      <div id={id} data-testid="public-filter-region" className={`${open ? "mt-4 block" : "hidden"} sm:block`}>
        {children}
      </div>
    </>
  );
}

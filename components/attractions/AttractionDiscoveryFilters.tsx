"use client";

import { Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicFields, PublicSearchField, PublicSelect, type PublicSelectOption } from "@/components/public/PublicFields";

export interface AttractionDiscoveryFiltersProps {
  query?: string;
  selectedType?: string;
  typeOptions: PublicSelectOption[];
}

export function AttractionDiscoveryFilters({ query, selectedType, typeOptions }: AttractionDiscoveryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasFilters = Boolean(query || selectedType);

  return (
    <>
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="attraction-filter-form"
        onClick={() => setMobileOpen((open) => !open)}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--public-radius-control)] border border-black/15 bg-white px-4 text-sm font-bold text-[var(--public-ink)] sm:hidden"
      >
        <Funnel aria-hidden="true" size={18} weight="bold" />
        {mobileOpen ? "ซ่อนตัวกรอง" : "เปิดตัวกรอง"}
      </button>

      <form id="attraction-filter-form" action="/attractions" method="GET" className={`${mobileOpen ? "mt-4 block" : "hidden"} sm:block`}>
        <PublicFields className="md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.75fr)_auto] md:items-end">
          <PublicSearchField id="attraction-search" label="ค้นหาสถานที่" name="q" defaultValue={query ?? ""} placeholder="ชื่อสถานที่หรือคำที่สนใจ" />
          <PublicSelect
            id="attraction-type"
            label="ประเภทสถานที่"
            name="type"
            defaultValue={selectedType ?? ""}
            options={[{ value: "", label: "ทุกประเภท" }, ...typeOptions]}
          />
          <div className="flex flex-wrap gap-2">
            <PublicButton type="submit" className="gap-2">
              <MagnifyingGlass size={18} weight="bold" aria-hidden="true" /> ค้นหาสถานที่
            </PublicButton>
            {hasFilters ? <PublicButton href="/attractions" variant="quiet">ล้างตัวกรอง</PublicButton> : null}
          </div>
        </PublicFields>
      </form>
    </>
  );
}

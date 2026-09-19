"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, MapPin } from "@phosphor-icons/react";

export type NearbyAttractionOption = {
  id: number;
  label: string;
  isPublished: boolean;
};

type NearbyAttractionPickerProps = {
  attractions: NearbyAttractionOption[];
  selectedAttractionIds?: number[];
  error?: string;
};

export function NearbyAttractionPicker({
  attractions,
  selectedAttractionIds = [],
  error,
}: NearbyAttractionPickerProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("th");
  const selected = new Set(selectedAttractionIds);
  const visibleAttractions = useMemo(
    () => attractions.filter((attraction) => (
      normalizedQuery === "" || attraction.label.toLocaleLowerCase("th").includes(normalizedQuery)
    )),
    [attractions, normalizedQuery],
  );

  return (
    <fieldset className="space-y-3" aria-describedby={error ? "nearby-attractions-error" : undefined}>
      <input type="hidden" name="syncNearbyAttractions" value="true" />
      <div>
        <legend className="text-sm font-black text-slate-800">สถานที่ท่องเที่ยวใกล้เคียง</legend>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          เลือกจากสถานที่ที่กำลังใช้งานในชุดนำร่องได้สูงสุด 12 แห่ง รายการนี้จะแสดงทั้งหน้าร้านอาหารและหน้าสถานที่
        </p>
      </div>

      {attractions.length > 6 ? (
        <label className="relative block">
          <span className="sr-only">ค้นหาสถานที่ท่องเที่ยวใกล้เคียง</span>
          <MagnifyingGlass aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อสถานที่"
            className="min-h-11 w-full rounded-[var(--admin-radius-control)] border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm"
          />
        </label>
      ) : null}

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-[var(--admin-radius-panel)] border border-slate-200 bg-slate-50 p-2">
        {visibleAttractions.length > 0 ? visibleAttractions.map((attraction) => (
          <label
            key={attraction.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--admin-radius-control)] border border-transparent bg-white px-3 py-2.5 text-sm transition hover:border-slate-300"
          >
            <input
              type="checkbox"
              name="nearbyAttractionIds"
              value={attraction.id}
              defaultChecked={selected.has(attraction.id)}
              className="h-5 w-5 shrink-0 accent-[var(--admin-accent)]"
            />
            <MapPin aria-hidden="true" className="shrink-0 text-[var(--admin-accent)]" size={18} weight="duotone" />
            <span className="min-w-0 flex-1 font-bold text-slate-700">{attraction.label}</span>
            {!attraction.isPublished ? (
              <span className="shrink-0 rounded bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-800">ยังไม่เผยแพร่</span>
            ) : null}
          </label>
        )) : (
          <p className="px-3 py-6 text-center text-sm font-semibold text-slate-500">ไม่พบสถานที่ที่ค้นหา</p>
        )}
      </div>
      {error ? <p id="nearby-attractions-error" role="alert" className="text-sm font-bold text-rose-700">{error}</p> : null}
    </fieldset>
  );
}

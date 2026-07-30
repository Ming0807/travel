"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const accommodationTypes = [
  { value: "Hotel", label: "Hotel / โรงแรม" },
  { value: "Resort", label: "Resort / รีสอร์ท" },
  { value: "Homestay", label: "Homestay / โฮมสเตย์" },
  { value: "Guesthouse", label: "Guesthouse / เกสต์เฮาส์" },
  { value: "Hostel", label: "Hostel / โฮสเทล" },
];

type AccommodationFilterBarProps = {
  accommodationType?: string;
  province?: string;
  provinces?: Array<{ value: string; label: string }>;
};

export function AccommodationFilterBar({
  accommodationType,
  province,
  provinces = [],
}: AccommodationFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <select
          name="accommodationType"
          defaultValue={accommodationType || ""}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set("accommodationType", e.target.value);
            else params.delete("accommodationType");
            params.delete("q");
            window.location.href = `/accommodations?${params.toString()}`;
          }}
          className="appearance-none bg-white border border-ink/10 px-4 py-2 rounded-full text-xs font-bold text-ink cursor-pointer hover:bg-cream transition-colors pr-8"
        >
          <option value="">ทุกประเภทที่พัก</option>
          {accommodationTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <CaretDown size={10} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
      </div>
      {provinces.length > 1 ? <div className="relative">
        <select
          name="province"
          defaultValue={province || ""}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set("province", e.target.value);
            else params.delete("province");
            params.delete("q");
            window.location.href = `/accommodations?${params.toString()}`;
          }}
          className="appearance-none bg-white border border-ink/10 px-4 py-2 rounded-full text-xs font-bold text-ink cursor-pointer hover:bg-cream transition-colors pr-8"
        >
          <option value="">ทุกจังหวัดที่เปิดให้บริการ</option>
          {provinces.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <CaretDown size={10} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
      </div> : null}
    </div>
  );
}

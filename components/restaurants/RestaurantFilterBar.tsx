"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const foodTypes = [
  { value: "Thai", label: "Thai / อาหารไทย" },
  { value: "Malay", label: "Malay / อาหารมาเลย์" },
  { value: "International", label: "International / นานาชาติ" },
  { value: "Coffee", label: "Coffee / คาเฟ่" },
  { value: "Bakery", label: "Bakery / เบเกอรี่" },
  { value: "Halal", label: "Halal / ฮาลาล" },
];

type RestaurantFilterBarProps = {
  foodType?: string;
  province?: string;
  provinces?: Array<{ value: string; label: string }>;
};

export function RestaurantFilterBar({
  foodType,
  province,
  provinces = [],
}: RestaurantFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <select
          name="foodType"
          defaultValue={foodType || ""}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set("foodType", e.target.value);
            else params.delete("foodType");
            params.delete("q");
            window.location.href = `/restaurants?${params.toString()}`;
          }}
          className="appearance-none bg-white border border-ink/10 px-4 py-2 rounded-full text-xs font-bold text-ink cursor-pointer hover:bg-cream transition-colors pr-8"
        >
          <option value="">ทุกประเภทอาหาร</option>
          {foodTypes.map((ft) => (
            <option key={ft.value} value={ft.value}>{ft.label}</option>
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
            window.location.href = `/restaurants?${params.toString()}`;
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

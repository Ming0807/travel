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

const provinces = [
  { name: "Yala", slug: "Yala" },
  { name: "Pattani", slug: "Pattani" },
  { name: "Narathiwat", slug: "Narathiwat" },
];

type RestaurantFilterBarProps = {
  foodType?: string;
  province?: string;
};

export function RestaurantFilterBar({ foodType, province }: RestaurantFilterBarProps) {
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
          <option value="">All Food Types</option>
          {foodTypes.map((ft) => (
            <option key={ft.value} value={ft.value}>{ft.label}</option>
          ))}
        </select>
        <CaretDown size={10} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
      </div>
      <div className="relative">
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
          <option value="">All Provinces</option>
          {provinces.map((p) => (
            <option key={p.slug} value={p.name}>{p.name}</option>
          ))}
        </select>
        <CaretDown size={10} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
      </div>
    </div>
  );
}

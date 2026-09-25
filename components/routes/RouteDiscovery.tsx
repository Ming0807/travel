"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicEmptyState } from "@/components/public/PublicStates";
import { PublicRouteCard } from "@/components/routes/PublicRouteCard";
import type { PublicRouteCard as PublicRouteCardData } from "@/lib/repositories/public-content.repository";

type DurationFilter = "all" | "one" | "two" | "threePlus";

const durationOptions: { value: DurationFilter; label: string }[] = [
  { value: "all", label: "ทุกระยะเวลา" },
  { value: "one", label: "1 วัน" },
  { value: "two", label: "2 วัน" },
  { value: "threePlus", label: "3 วันขึ้นไป" },
];

function matchesDuration(days: number, filter: DurationFilter) {
  if (filter === "one") return days === 1;
  if (filter === "two") return days === 2;
  if (filter === "threePlus") return days >= 3;
  return true;
}

export function RouteDiscovery({ routes }: { routes: PublicRouteCardData[] }) {
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState<DurationFilter>("all");
  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");
    return routes.filter((route) => {
      const searchableText = `${route.name} ${route.description}`.toLocaleLowerCase("th-TH");
      return searchableText.includes(normalizedQuery) && matchesDuration(route.days, duration);
    });
  }, [duration, query, routes]);
  const hasActiveFilter = query.trim().length > 0 || duration !== "all";

  if (routes.length === 0) {
    return (
      <PublicEmptyState
        title="กำลังเตรียมเส้นทางแนะนำ"
        description="เมื่อทีมงานเผยแพร่เส้นทางที่มีจุดแวะครบถ้วน รายการจะปรากฏที่หน้านี้"
        action={<PublicButton href="/attractions" variant="secondary">ดูสถานที่ท่องเที่ยว</PublicButton>}
      />
    );
  }

  return (
    <div>
      <div className="grid gap-4 border-y border-black/10 bg-[#fffdfa] px-4 py-4 sm:grid-cols-[minmax(16rem,1fr)_auto] sm:items-end sm:px-5">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-bold text-[var(--public-ink)]">ค้นหาเส้นทาง</span>
          <span className="flex min-h-12 items-center gap-3 border border-black/15 bg-white px-3 focus-within:border-[var(--public-coral)] focus-within:outline focus-within:outline-2 focus-within:outline-[var(--public-coral)]">
            <MagnifyingGlass size={20} aria-hidden="true" className="shrink-0 text-[var(--public-teal)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ชื่อเส้นทางหรือรายละเอียด"
              className="min-w-0 flex-1 bg-transparent text-base text-[var(--public-ink)] outline-none placeholder:text-black/55"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="grid size-10 shrink-0 place-items-center text-[var(--public-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--public-teal)]"
                aria-label="ล้างคำค้นหา"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
          </span>
        </label>

        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-bold text-[var(--public-ink)]">ระยะเวลาเดินทาง</legend>
          <div className="flex flex-wrap gap-2">
            {durationOptions.map((option) => {
              const selected = duration === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDuration(option.value)}
                  className={`min-h-11 border px-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] ${selected
                    ? "border-[var(--public-teal)] bg-[var(--public-teal)] text-white"
                    : "border-black/15 bg-white text-[var(--public-ink)] hover:border-[var(--public-coral)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <p role="status" aria-live="polite" className="mt-4 text-sm font-semibold text-black/65">
        พบ {filteredRoutes.length.toLocaleString("th-TH")} เส้นทาง
      </p>

      {filteredRoutes.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRoutes.map((route, index) => <PublicRouteCard key={route.slug} route={route} priority={index === 0} />)}
        </div>
      ) : (
        <div className="mt-5">
          <PublicEmptyState
            title="ไม่พบเส้นทางที่ตรงกับการค้นหา"
            description="ลองใช้คำค้นอื่น หรือเลือกดูเส้นทางทุกระยะเวลา"
            action={hasActiveFilter ? (
              <PublicButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setDuration("all");
                }}
              >
                ล้างตัวกรอง
              </PublicButton>
            ) : undefined}
          />
        </div>
      )}
    </div>
  );
}

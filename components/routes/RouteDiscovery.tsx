"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicEmptyState } from "@/components/public/PublicStates";
import { PublicRouteCard } from "@/components/routes/PublicRouteCard";
import type { PublicRouteCard as PublicRouteCardData } from "@/lib/repositories/public-content.repository";

import "./routes-directory.css";

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
  const showFilters = routes.length > 3;
  const filteredRoutes = useMemo(() => {
    if (!showFilters) return routes;
    const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");
    return routes.filter((route) => {
      const searchableText = `${route.name} ${route.description}`.toLocaleLowerCase("th-TH");
      return searchableText.includes(normalizedQuery) && matchesDuration(route.days, duration);
    });
  }, [duration, query, routes, showFilters]);
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
      {showFilters ? (
        <>
          <div className="route-directory__filters">
            <label className="route-directory__search">
              <span>ค้นหาเส้นทาง</span>
              <span className="route-directory__search-field">
                <MagnifyingGlass size={19} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ชื่อเส้นทางหรือรายละเอียด"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} aria-label="ล้างคำค้นหา">
                    <X size={18} aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            </label>

            <fieldset className="route-directory__duration">
              <legend>ระยะเวลาเดินทาง</legend>
              <div>
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={duration === option.value}
                    onClick={() => setDuration(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <p role="status" aria-live="polite" className="route-directory__result-count">
            พบ {filteredRoutes.length.toLocaleString("th-TH")} เส้นทาง
          </p>
        </>
      ) : null}

      {filteredRoutes.length > 0 ? (
        <ol className="route-directory__list" aria-label="เส้นทางท่องเที่ยวที่เผยแพร่">
          {filteredRoutes.map((route) => {
            const index = routes.indexOf(route);
            return (
              <li className="route-directory__item" key={route.slug}>
                <PublicRouteCard route={route} priority={index === 0} index={index + 1} />
              </li>
            );
          })}
        </ol>
      ) : (
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
      )}
    </div>
  );
}

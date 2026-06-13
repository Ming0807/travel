"use client";

import { useState, useEffect, useRef } from "react";
import { searchRoutesAction, getRoutesBySlugsAction } from "@/app/actions/admin-content-actions";
import { MagnifyingGlass, Spinner, Plus, Trash, ArrowUp, ArrowDown, CheckCircle, WarningCircle, Warning } from "@phosphor-icons/react";

type RouteData = {
  id: number;
  name_th: string;
  name_en: string | null;
  slug: string;
  is_published: boolean;
  is_active: boolean;
};

export function HomepageRoutePicker({
  slugs,
  onChange,
}: {
  slugs: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [items, setItems] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RouteData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const latestQueryRef = useRef("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const slugsKey = slugs.join("|");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      const currentSlugs = slugsKey ? slugsKey.split("|") : [];
      const res = await getRoutesBySlugsAction(currentSlugs);
      if (cancelled) return;
      if (res.success && res.data) {
        setItems(res.data as RouteData[]);
      } else {
        setLoadError(res.error || "ไม่สามารถโหลดเส้นทางที่เลือกไว้ได้");
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [slugsKey]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    setSearchError(null);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    latestQueryRef.current = q;
    const res = await searchRoutesAction(q);
    if (latestQueryRef.current !== q) return; // stale — ignore
    if (res.success && res.data) {
      setSearchResults(res.data as RouteData[]);
    } else {
      setSearchError(res.error || "ค้นหาเส้นทางไม่สำเร็จ");
      setSearchResults([]);
    }
    setIsSearching(false);
  }

  function handleAdd(item: RouteData) {
    if (items.find((i) => i.slug === item.slug)) return;
    const newItems = [...items, item];
    setItems(newItems);
    onChange(newItems.map((i) => i.slug));
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    searchInputRef.current?.focus();
  }

  function handleRemove(index: number) {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    onChange(newItems.map((i) => i.slug));
    setTimeout(() => {
      if (newItems.length === 0) {
        searchInputRef.current?.focus();
      } else {
        const prevIndex = Math.min(index, newItems.length - 1);
        document.querySelector<HTMLButtonElement>(`[data-remove-index="${prevIndex}"]`)?.focus();
      }
    }, 0);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    onChange(newItems.map((i) => i.slug));
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    onChange(newItems.map((i) => i.slug));
  }

  const selectedWarnings = items.reduce(
    (acc, item) => {
      if (!item.is_published) acc.draft += 1;
      if (!item.is_active) acc.inactive += 1;
      return acc;
    },
    { draft: 0, inactive: 0 }
  );

  const problematicCount = selectedWarnings.draft + selectedWarnings.inactive;
  const isExpanded = searchQuery.trim() !== "" && (searchResults.length > 0 || isSearching || searchError !== null);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative z-10">
        <label className="block text-sm font-black text-slate-700 mb-1" htmlFor="route-search-input">ค้นหาเส้นทางเพื่อเพิ่ม</label>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            ref={searchInputRef}
            id="route-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setSearchResults([]); setSearchError(null); (e.target as HTMLInputElement).blur(); } }}
            placeholder="พิมพ์ชื่อเส้นทางหรือ slug..."
            role="combobox"
            aria-expanded={isExpanded}
            aria-controls="search-results-listbox"
            aria-autocomplete="list"
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
          />
          {isSearching && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={18} />}
        </div>

        {/* Search error */}
        {searchError && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 shadow-xl z-20 flex items-center gap-2">
            <Warning size={16} weight="fill" />
            {searchError}
          </div>
        )}

        {/* Search results dropdown */}
        {searchQuery.trim() && searchResults.length > 0 && (
          <div
            id="search-results-listbox"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 max-w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20"
          >
            {searchResults.map((result) => {
              const isAdded = items.some((i) => i.slug === result.slug);
              return (
                <div
                  key={result.id}
                  role="option"
                  aria-selected={isAdded}
                  className={`flex items-center gap-3 p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition ${isAdded ? "opacity-50" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{result.name_th}</p>
                    <p className="text-xs text-slate-500 truncate">{result.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {!result.is_published && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-800">ฉบับร่าง</span>}
                      {!result.is_active && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700">ไม่เปิดใช้งาน</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAdd(result)}
                    aria-label={`เพิ่ม ${result.name_th}`}
                    className="flex-shrink-0 min-w-[44px] min-h-[44px] rounded-full bg-[#E6F4EF] text-[#0A6B62] flex items-center justify-center hover:bg-[#0A6B62] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus weight="bold" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {searchQuery.trim() && !isSearching && searchResults.length === 0 && !searchError ? (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-500 shadow-xl">
            ไม่พบเส้นทางที่ตรงกับคำค้น
          </div>
        ) : null}
      </div>

      {/* Load error */}
      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 flex items-center gap-2">
          <Warning size={16} weight="fill" />
          {loadError}
        </div>
      )}

      {/* Selected items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-black text-slate-700" aria-live="polite">เส้นทางที่แสดงผล ({items.length})</label>
          {problematicCount > 0 && (
            <span role="alert" className="text-xs font-bold text-amber-700">⚠️ {problematicCount} เส้นทางไม่พร้อมแสดงผล</span>
          )}
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center text-slate-400" role="status" aria-label="กำลังโหลด">
            <Spinner className="animate-spin" size={24} />
          </div>
        ) : items.length === 0 && !loadError ? (
          <div className="py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400" role="status">
            <p className="text-sm font-medium">ยังไม่มีเส้นทางแนะนำ</p>
            <p className="text-xs mt-1">ค้นหาและเพิ่มเส้นทางด้านบน</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                <div className="flex flex-col shrink-0 mr-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="เลื่อนขึ้น"
                    aria-label={`เลื่อน ${item.name_th} ขึ้น`}
                  >
                    <ArrowUp size={18} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="เลื่อนลง"
                    aria-label={`เลื่อน ${item.name_th} ลง`}
                  >
                    <ArrowDown size={18} weight="bold" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{item.name_th}</p>
                  <p className="text-xs text-slate-500 truncate">{item.slug}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.is_published && item.is_active ? (
                    <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                  ) : (
                    <WarningCircle size={16} weight="fill" className="text-amber-500" />
                  )}
                  <button
                    type="button"
                    data-remove-index={index}
                    onClick={() => handleRemove(index)}
                    className="text-slate-400 hover:text-rose-600 rounded transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="นำออก"
                    aria-label={`นำ ${item.name_th} ออกจากรายการ`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  MagnifyingGlass,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  saveAttractionRelatedContentAction,
  searchAttractionRelatedContentAction,
} from "@/app/actions/admin-attraction-actions";
import {
  RELATED_CONTENT_TYPES,
  type RelatedContentMode,
  type RelatedContentType,
} from "@/lib/content/attraction-related-content";
import type {
  AdminRelatedContentSetting,
  AdminRelatedContentSearchItem,
  AdminSelectedRelatedContentItem,
} from "@/lib/repositories/admin-attraction.repository";

export type SelectedRelatedContentByType = Record<
  RelatedContentType,
  AdminSelectedRelatedContentItem[]
>;

type RelatedContentWorkspaceProps = {
  attractionId: number;
  initialType: RelatedContentType;
  settings: AdminRelatedContentSetting[];
  selectedByType: SelectedRelatedContentByType;
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

type Draft = {
  mode: RelatedContentMode;
  maxItems: number;
  items: AdminSelectedRelatedContentItem[];
};

type Drafts = Record<RelatedContentType, Draft>;

const TYPE_META: Record<RelatedContentType, { label: string; searchLabel: string }> = {
  attractions: { label: "สถานที่ใกล้เคียง", searchLabel: "สถานที่" },
  restaurants: { label: "ร้านอาหาร", searchLabel: "ร้านอาหาร" },
  accommodations: { label: "ที่พัก", searchLabel: "ที่พัก" },
  stories: { label: "เรื่องราว", searchLabel: "เรื่องราว" },
};

const MODE_META: Record<RelatedContentMode, { label: string; description: string }> = {
  automatic: {
    label: "ระบบเลือกให้",
    description: "ระบบจัดอันดับจากพื้นที่ ระยะทาง และความพร้อมของเนื้อหา",
  },
  manual: {
    label: "เลือกเอง",
    description: "แสดงเฉพาะรายการที่เลือกและเรียงไว้ด้านล่าง",
  },
  hybrid: {
    label: "ผสม",
    description: "เลือกก่อน แล้วให้ระบบเติมให้ครบ",
  },
  hidden: {
    label: "ซ่อน",
    description: "ไม่แสดงส่วนนี้บนหน้าบ้าน แต่ยังเก็บรายการที่เลือกไว้",
  },
};

function defaultLimit(type: RelatedContentType): number {
  return type === "stories" ? 3 : 4;
}

function createDrafts(
  settings: AdminRelatedContentSetting[],
  selectedByType: SelectedRelatedContentByType,
): Drafts {
  const byType = new Map(settings.map((setting) => [setting.contentType, setting]));
  const draftFor = (type: RelatedContentType): Draft => {
    const setting = byType.get(type);
    return {
      mode: setting?.mode ?? (selectedByType[type].length > 0 ? "manual" : "automatic"),
      maxItems: setting?.maxItems ?? defaultLimit(type),
      items: selectedByType[type].map((item) => ({ ...item })),
    };
  };
  return {
    attractions: draftFor("attractions"),
    restaurants: draftFor("restaurants"),
    accommodations: draftFor("accommodations"),
    stories: draftFor("stories"),
  };
}

function sameDraft(left: Draft, right: Draft): boolean {
  return left.mode === right.mode
    && left.maxItems === right.maxItems
    && left.items.length === right.items.length
    && left.items.every((item, index) => item.id === right.items[index]?.id);
}

function availableItemFromSearch(
  type: RelatedContentType,
  item: AdminRelatedContentSearchItem,
): AdminSelectedRelatedContentItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    provinceName: item.provinceName,
    isPublished: true,
    isActive: type === "stories" ? null : true,
    status: "published",
    available: true,
    editHref: item.editHref,
  };
}

export function RelatedContentWorkspace({
  attractionId,
  initialType,
  settings,
  selectedByType,
  onClose,
  onDirtyChange,
}: RelatedContentWorkspaceProps) {
  const initialDrafts = useMemo(
    () => createDrafts(settings, selectedByType),
    [selectedByType, settings],
  );
  const [activeType, setActiveType] = useState<RelatedContentType>(initialType);
  const [drafts, setDrafts] = useState<Drafts>(initialDrafts);
  const [savedDrafts, setSavedDrafts] = useState<Drafts>(initialDrafts);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<AdminRelatedContentSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const activeDraft = drafts[activeType];
  const activeSavedDraft = savedDrafts[activeType];
  const isDirty = !sameDraft(activeDraft, activeSavedDraft);
  const anyDirty = RELATED_CONTENT_TYPES.some((type) => !sameDraft(drafts[type], savedDrafts[type]));
  const selectedIds = new Set(activeDraft.items.map((item) => item.id));
  const pageCount = Math.max(1, Math.ceil(total / 20));

  useEffect(() => {
    onDirtyChange?.(anyDirty);
  }, [anyDirty, onDirtyChange]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await searchAttractionRelatedContentAction({
          attractionId,
          contentType: activeType,
          query,
          page,
          pageSize: 20,
        });
        if (requestIdRef.current !== requestId) return;
        setIsSearching(false);
        if (!response.success || !response.data) {
          setResults([]);
          setTotal(0);
          setSearchError(response.error ?? "ยังค้นหาเนื้อหาไม่ได้");
          return;
        }
        setResults(response.data.items);
        setTotal(response.data.total);
      } catch {
        if (requestIdRef.current !== requestId) return;
        setIsSearching(false);
        setResults([]);
        setTotal(0);
        setSearchError("ยังค้นหาเนื้อหาไม่ได้ กรุณาลองอีกครั้ง");
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeType, attractionId, page, query]);

  function updateActiveDraft(update: (draft: Draft) => Draft) {
    setDrafts((current) => ({ ...current, [activeType]: update(current[activeType]) }));
    setSaveMessage(null);
    setSaveError(null);
  }

  function switchType(type: RelatedContentType) {
    setActiveType(type);
    setQuery("");
    setPage(1);
    setResults([]);
    setIsSearching(true);
    setSaveMessage(null);
    setSaveError(null);
  }

  function addItem(item: AdminRelatedContentSearchItem) {
    if (selectedIds.has(item.id)) return;
    updateActiveDraft((draft) => ({
      ...draft,
      items: [...draft.items, availableItemFromSearch(activeType, item)],
    }));
  }

  function removeItem(id: number) {
    updateActiveDraft((draft) => ({
      ...draft,
      items: draft.items.filter((item) => item.id !== id),
    }));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= activeDraft.items.length) return;
    updateActiveDraft((draft) => {
      const items = [...draft.items];
      [items[index], items[destination]] = [items[destination], items[index]];
      return { ...draft, items };
    });
  }

  async function saveActiveDraft() {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      const response = await saveAttractionRelatedContentAction({
        attractionId,
        type: activeType,
        relatedIds: activeDraft.items.map((item) => item.id),
        mode: activeDraft.mode,
        maxItems: activeDraft.maxItems,
      });
      if (!response.success) {
        setSaveError(response.error ?? "ยังบันทึกไม่ได้ กรุณาลองอีกครั้ง");
        return;
      }
      setSavedDrafts((current) => ({
        ...current,
        [activeType]: {
          ...activeDraft,
          items: activeDraft.items.map((item) => ({ ...item })),
        },
      }));
      setSaveMessage("บันทึกแล้ว");
    } catch {
      setSaveError("ยังบันทึกไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  }

  function cancelAndClose() {
    setDrafts(savedDrafts);
    onClose();
  }

  function requestClose() {
    if (!anyDirty || window.confirm("มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกโดยไม่บันทึกหรือไม่?")) {
      onClose();
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-[#202020]">เลือกรูปแบบและรายการที่จะแสดง</h3>
            <p className="mt-1 text-sm text-slate-600">ตั้งค่าแต่ละส่วนจากที่เดียว แล้วตรวจผลบนหน้าสถานที่จริง</p>
          </div>
          {anyDirty ? (
            <span className="shrink-0 border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              ยังไม่บันทึก
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto border-b border-slate-200 px-2 sm:px-4">
        <div className="flex min-w-max" role="tablist" aria-label="ประเภทเนื้อหาที่เกี่ยวข้อง">
          {RELATED_CONTENT_TYPES.map((type) => {
            const selectedCount = drafts[type].items.length;
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={activeType === type}
                onClick={() => switchType(type)}
                className={`min-h-12 border-b-2 px-3 text-sm font-black transition sm:px-4 ${
                  activeType === type
                    ? "border-[var(--admin-accent)] text-[var(--admin-accent-strong)]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {TYPE_META[type].label}
                <span className="ml-2 text-xs font-bold text-slate-400">{selectedCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 sm:px-6">
        <fieldset>
          <legend className="text-sm font-black text-slate-800">วิธีแสดงผล</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {Object.entries(MODE_META).map(([mode, meta]) => {
              const typedMode = mode as RelatedContentMode;
              const checked = activeDraft.mode === typedMode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => updateActiveDraft((draft) => ({ ...draft, mode: typedMode }))}
                  className={`min-h-11 border px-3 py-2 text-left text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] ${
                    checked
                      ? "border-[var(--admin-accent)] bg-[#fff5f1] text-[var(--admin-accent-strong)]"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{MODE_META[activeDraft.mode].description}</p>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-4">
          <div>
            <label htmlFor={`related-limit-${activeType}`} className="text-sm font-black text-slate-800">
              จำนวนสูงสุดบนหน้าบ้าน
            </label>
            <p className="mt-1 text-xs text-slate-500">รายการที่เลือกเกินจำนวนนี้ยังถูกเก็บไว้ แต่จะไม่แสดงทั้งหมด</p>
          </div>
          <select
            id={`related-limit-${activeType}`}
            value={activeDraft.maxItems}
            onChange={(event) => updateActiveDraft((draft) => ({ ...draft, maxItems: Number(event.target.value) }))}
            className="min-h-11 min-w-24 border border-slate-300 bg-white px-3 text-sm font-black text-slate-800 focus:border-[var(--admin-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/15"
          >
            {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{value} รายการ</option>
            ))}
          </select>
        </div>

        {activeDraft.mode === "hidden" ? (
          <div className="mt-5 flex gap-3 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
            <div><strong>ส่วนนี้ถูกซ่อนจากหน้าบ้าน</strong><br />รายการที่เลือกด้านล่างจะยังอยู่และนำกลับมาใช้ได้เมื่อเปลี่ยนโหมด</div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby={`selected-${activeType}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 id={`selected-${activeType}`} className="text-sm font-black text-slate-900">เนื้อหาที่เลือก</h4>
                <p className="mt-1 text-xs text-slate-500">เรียงจากบนลงล่างตามลำดับที่ต้องการแสดง</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{activeDraft.items.length} รายการ</span>
            </div>
            {activeDraft.items.length > activeDraft.maxItems ? (
              <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                มี {activeDraft.items.length - activeDraft.maxItems} รายการเกินจำนวนที่แสดงสูงสุด
              </p>
            ) : null}
            <ul className="mt-3 space-y-2" aria-label="เนื้อหาที่เลือก">
              {activeDraft.items.map((item, index) => {
                const name = item.name ?? `รายการ #${item.id}`;
                return (
                  <li key={item.id} className={`border p-3 ${item.available ? "border-slate-200 bg-white" : "border-amber-300 bg-amber-50"}`}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-slate-100 text-xs font-black text-slate-600">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900">{name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.provinceName ?? "ไม่ระบุพื้นที่"}</p>
                        {!item.available ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-amber-800">
                            <WarningCircle size={15} weight="fill" />
                            <span>รายการนี้ไม่พร้อมแสดงบนหน้าบ้าน</span>
                            <Link className="underline underline-offset-2" href={item.editHref} target="_blank" rel="noreferrer" aria-label={`เปิดแก้ไข ${name}`}>
                              เปิดแก้ไข
                            </Link>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" disabled={index === 0} onClick={() => moveItem(index, -1)} className="flex h-11 w-11 items-center justify-center border border-slate-200 text-slate-600 hover:border-slate-400 disabled:opacity-30" aria-label={`เลื่อน ${name} ขึ้น`}>
                          <ArrowUp size={17} weight="bold" />
                        </button>
                        <button type="button" disabled={index === activeDraft.items.length - 1} onClick={() => moveItem(index, 1)} className="flex h-11 w-11 items-center justify-center border border-slate-200 text-slate-600 hover:border-slate-400 disabled:opacity-30" aria-label={`เลื่อน ${name} ลง`}>
                          <ArrowDown size={17} weight="bold" />
                        </button>
                        <button type="button" onClick={() => removeItem(item.id)} className="flex h-11 w-11 items-center justify-center border border-rose-200 text-rose-600 hover:bg-rose-50" aria-label={`นำ ${name} ออก`}>
                          <Trash size={17} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {activeDraft.items.length === 0 ? (
              <div className="mt-3 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                ยังไม่มีรายการที่เลือก
              </div>
            ) : null}
          </section>

          <section aria-labelledby={`search-title-${activeType}`}>
            <h4 id={`search-title-${activeType}`} className="text-sm font-black text-slate-900">ค้นหา{TYPE_META[activeType].searchLabel}</h4>
            <div className="relative mt-3">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
              <input
                type="search"
                aria-label={`ค้นหา${TYPE_META[activeType].searchLabel}`}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1); setIsSearching(true); }}
                maxLength={100}
                placeholder={`ค้นหาชื่อหรือ slug ของ${TYPE_META[activeType].searchLabel}`}
                className="min-h-11 w-full border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-900 focus:border-[var(--admin-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm"
              />
            </div>
            <div className="mt-3 min-h-52 border border-slate-200">
              {isSearching ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500" role="status">กำลังค้นหา...</div>
              ) : searchError ? (
                <div className="flex gap-2 px-4 py-6 text-sm text-rose-700" role="alert"><WarningCircle className="shrink-0" size={18} />{searchError}</div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">ไม่พบรายการที่พร้อมใช้งาน</div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {results.map((item) => {
                    const selected = selectedIds.has(item.id);
                    return (
                      <li key={item.id} className="flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-900">{item.name}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{item.provinceName ?? "ไม่ระบุพื้นที่"} · {item.slug}</p>
                        </div>
                        <button
                          type="button"
                          disabled={selected}
                          onClick={() => addItem(item)}
                          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-black text-[var(--admin-accent-strong)] hover:border-[var(--admin-accent)] disabled:text-slate-400 disabled:opacity-60"
                          aria-label={selected ? `เลือก ${item.name} แล้ว` : `เลือก ${item.name}`}
                        >
                          {selected ? <CheckCircle size={16} weight="fill" /> : <Plus size={16} weight="bold" />}
                          {selected ? "เลือกแล้ว" : "เลือก"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {pageCount > 1 ? (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
                <button type="button" disabled={page <= 1} onClick={() => { setIsSearching(true); setPage((value) => Math.max(1, value - 1)); }} className="min-h-11 border border-slate-300 px-3 disabled:opacity-40">ก่อนหน้า</button>
                <span>หน้า {page} จาก {pageCount}</span>
                <button type="button" disabled={page >= pageCount} onClick={() => { setIsSearching(true); setPage((value) => Math.min(pageCount, value + 1)); }} className="min-h-11 border border-slate-300 px-3 disabled:opacity-40">ถัดไป</button>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">
        {(saveError || saveMessage) ? (
          <div className={`mb-3 text-sm font-bold ${saveError ? "text-rose-700" : "text-emerald-700"}`} role={saveError ? "alert" : "status"}>
            {saveError ?? saveMessage}
          </div>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={requestClose} className="hidden text-xs font-bold text-slate-500 underline underline-offset-2 sm:mr-auto sm:block">ปิดพื้นที่จัดการ</button>
          <button type="button" onClick={cancelAndClose} className="min-h-11 border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50">ยกเลิก</button>
          <button type="button" disabled={isSaving || !isDirty} onClick={saveActiveDraft} className="min-h-11 bg-[var(--admin-accent)] px-6 text-sm font-black text-white hover:bg-[var(--admin-accent-strong)] disabled:cursor-not-allowed disabled:opacity-50" aria-label="บันทึกส่วนนี้">
            {isSaving ? "กำลังบันทึก..." : "บันทึกส่วนนี้"}
          </button>
        </div>
      </div>
    </div>
  );
}

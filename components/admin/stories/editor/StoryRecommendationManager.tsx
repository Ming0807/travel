"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  MagnifyingGlass,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import {
  saveStoryRecommendationsAction,
  searchStoryRecommendationCandidatesAction,
} from "@/app/actions/admin-story-actions";
import type {
  AdminStoryRecommendation,
  StoryRecommendationCandidate,
} from "@/lib/repositories/story-recommendation.repository";

type StoryRecommendationManagerProps = {
  storyId: number;
  initialItems: AdminStoryRecommendation[];
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSaved?: (items: AdminStoryRecommendation[]) => void;
};

function normalizeOrder(
  items: AdminStoryRecommendation[]
): AdminStoryRecommendation[] {
  return items.map((item, index) => ({ ...item, displayOrder: index }));
}

function signature(items: AdminStoryRecommendation[]): string {
  return JSON.stringify(
    normalizeOrder(items).map((item) => ({
      targetStoryId: item.targetStoryId,
      reason: item.reason?.trim() || null,
    }))
  );
}

export function StoryRecommendationManager({
  storyId,
  initialItems,
  onClose,
  onDirtyChange,
  onSaved,
}: StoryRecommendationManagerProps) {
  const [savedItems, setSavedItems] = useState(() =>
    normalizeOrder(initialItems)
  );
  const [items, setItems] = useState(() => normalizeOrder(initialItems));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StoryRecommendationCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const dirty = signature(items) !== signature(savedItems);
  const selectedIds = useMemo(
    () => new Set(items.map((item) => item.targetStoryId)),
    [items]
  );

  function commitItems(nextItems: AdminStoryRecommendation[]) {
    const normalized = normalizeOrder(nextItems);
    setItems(normalized);
    onDirtyChange(signature(normalized) !== signature(savedItems));
    setSuccess(null);
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      requestIdRef.current += 1;
      setResults([]);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsSearching(true);
    setError(null);
    try {
      const result = await searchStoryRecommendationCandidatesAction({
        sourceStoryId: storyId,
        query: trimmed,
      });
      if (requestId !== requestIdRef.current) return;
      if (!result.success) {
        setResults([]);
        setError(result.error ?? "ค้นหาไม่สำเร็จ");
        return;
      }
      setResults(result.data ?? []);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setError("การเชื่อมต่อขัดข้อง กรุณาลองค้นหาอีกครั้ง");
    } finally {
      if (requestId === requestIdRef.current) setIsSearching(false);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      requestIdRef.current += 1;
      setResults([]);
      setIsSearching(false);
      setError(null);
    }
  }

  function addCandidate(candidate: StoryRecommendationCandidate) {
    if (selectedIds.has(candidate.storyId) || items.length >= 12) return;
    commitItems([
      ...items,
      {
        targetStoryId: candidate.storyId,
        title: candidate.title,
        slug: candidate.slug,
        provinceName: candidate.provinceName,
        displayOrder: items.length,
        reason: null,
      },
    ]);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    commitItems(next);
  }

  function updateReason(index: number, reason: string) {
    commitItems(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, reason } : item
      )
    );
  }

  function cancel() {
    setItems(savedItems);
    onDirtyChange(false);
    onClose();
  }

  async function save() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await saveStoryRecommendationsAction({
        sourceStoryId: storyId,
        items: items.map((item, index) => ({
          targetStoryId: item.targetStoryId,
          displayOrder: index,
          reason: item.reason?.trim() || null,
        })),
      });
      if (!result.success) {
        setError(result.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      const updated = normalizeOrder(result.data ?? []);
      setItems(updated);
      setSavedItems(updated);
      onDirtyChange(false);
      onSaved?.(updated);
      setSuccess("บันทึกบทความแนะนำแล้ว");
    } catch {
      setError("การเชื่อมต่อขัดข้อง กรุณาลองบันทึกอีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <section aria-labelledby="selected-recommendations-heading">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="selected-recommendations-heading"
                className="text-base font-black text-slate-900"
              >
                เรื่องที่เลือกแล้ว
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                เรื่องที่อยู่บนสุดจะแสดงก่อน เลือกได้สูงสุด 12 เรื่อง
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-slate-500">
              {items.length}/12
            </span>
          </div>

          {items.length > 0 ? (
            <ol className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              {items.map((item, index) => (
                <li key={item.targetStoryId} className="py-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F4F1] text-xs font-black text-[#075E54]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-6 text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {item.provinceName
                          ? `${item.provinceName} · ${item.slug}`
                          : item.slug}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`เลื่อน ${item.title} ขึ้น`}
                      >
                        <ArrowUp size={18} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`เลื่อน ${item.title} ลง`}
                      >
                        <ArrowDown size={18} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          commitItems(
                            items.filter(
                              (selected) =>
                                selected.targetStoryId !== item.targetStoryId
                            )
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50"
                        aria-label={`นำ ${item.title} ออกจากรายการ`}
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </div>
                  <label className="mt-3 block text-xs font-bold text-slate-700">
                    เหตุผลที่แนะนำ (ไม่บังคับ)
                    <input
                      value={item.reason ?? ""}
                      onChange={(event) =>
                        updateReason(index, event.target.value)
                      }
                      maxLength={255}
                      placeholder="เช่น อ่านต่อเพื่อวางแผนเส้นทางวัฒนธรรม"
                      className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-[#075E54] focus:ring-2 focus:ring-[#075E54]/20"
                    />
                  </label>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-5 border-y border-dashed border-slate-300 py-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                ยังไม่ได้เลือกเรื่องแนะนำ
              </p>
              <p className="mt-1 text-sm text-slate-500">
                หากไม่เลือก ระบบจะจัดอันดับจากจังหวัด หัวข้อ และความสดใหม่
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="search-recommendations-heading">
          <h2
            id="search-recommendations-heading"
            className="text-base font-black text-slate-900"
          >
            ค้นหาบทความที่เผยแพร่แล้ว
          </h2>
          <form onSubmit={handleSearch} className="mt-3 flex gap-2">
            <label className="sr-only" htmlFor="recommendation-search">
              ค้นหาจากชื่อหรือ slug
            </label>
            <input
              id="recommendation-search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              maxLength={120}
              placeholder="ชื่อเรื่องหรือ slug"
              className="min-h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#075E54] focus:ring-2 focus:ring-[#075E54]/20"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#075E54] text-white transition hover:bg-[#064E46] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ค้นหาบทความ"
            >
              <MagnifyingGlass size={19} weight="bold" />
            </button>
          </form>

          {results.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {results.map((candidate) => {
                const isSelected = selectedIds.has(candidate.storyId);
                return (
                  <li
                    key={candidate.storyId}
                    className="flex items-center gap-3 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        {candidate.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {candidate.provinceName
                          ? `${candidate.provinceName} · ${candidate.slug}`
                          : candidate.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addCandidate(candidate)}
                      disabled={isSelected || items.length >= 12}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-300 text-[#075E54] transition hover:bg-[#E6F4F1] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={
                        isSelected
                          ? `${candidate.title} ถูกเลือกแล้ว`
                          : `เพิ่ม ${candidate.title}`
                      }
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.trim() && !isSearching && !error ? (
            <p className="mt-4 text-sm text-slate-500">
              กดค้นหาเพื่อดูบทความที่ตรงกัน
            </p>
          ) : null}
        </section>

        {error ? (
          <p role="alert" className="text-sm font-bold text-rose-700">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="text-sm font-bold text-emerald-700">
            {success}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={cancel}
          disabled={isSaving}
          className="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isSaving || !dirty}
          className="min-h-11 rounded-md bg-[#075E54] px-5 text-sm font-bold text-white transition hover:bg-[#064E46] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "กำลังบันทึก..." : "บันทึกบทความแนะนำ"}
        </button>
      </div>
    </div>
  );
}

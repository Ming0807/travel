"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookmarkSimple, FloppyDisk, Trash, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  createDashboardSavedView,
  DASHBOARD_SAVED_VIEW_LIMIT,
  DASHBOARD_SAVED_VIEWS_STORAGE_KEY,
  dashboardQueryString,
  dashboardFiltersToSafeQuery,
  parseDashboardSavedViews,
  sanitizeDashboardQuery,
  type DashboardSavedView,
} from "@/lib/dashboard/dashboard-saved-views";
import type { DashboardFilters } from "@/types/dashboard";

function makePresetHref(pathname: string, searchParams: URLSearchParams, evidenceScope: "field_claim" | "pilot_only") {
  const query = sanitizeDashboardQuery(searchParams);
  query.evidence_scope = evidenceScope;
  return `${pathname}?${dashboardQueryString(query)}`;
}

export function DashboardSavedViews({ filters }: { filters?: DashboardFilters }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [views, setViews] = useState<DashboardSavedView[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const storageInitializedRef = useRef(false);
  const resolvedParams = useMemo(() => new URLSearchParams(filters ? dashboardFiltersToSafeQuery(filters) : sanitizeDashboardQuery(searchParams)), [filters, searchParams]);
  const fieldHref = useMemo(() => makePresetHref(pathname, resolvedParams, "field_claim"), [pathname, resolvedParams]);
  const pilotHref = useMemo(() => makePresetHref(pathname, resolvedParams, "pilot_only"), [pathname, resolvedParams]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!storageInitializedRef.current) {
        try {
          setViews(parseDashboardSavedViews(window.localStorage.getItem(DASHBOARD_SAVED_VIEWS_STORAGE_KEY)));
        } catch {
          // Presets remain available when browser storage is blocked.
        }
        storageInitializedRef.current = true;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function persist(nextViews: DashboardSavedView[]) {
    try {
      window.localStorage.setItem(DASHBOARD_SAVED_VIEWS_STORAGE_KEY, JSON.stringify(nextViews));
    } catch {
      setError("เบราว์เซอร์ไม่อนุญาตให้บันทึกมุมมองในเครื่องนี้ กรุณาตรวจการตั้งค่าพื้นที่จัดเก็บ");
      return false;
    }
    storageInitializedRef.current = true;
    setViews(nextViews);
    setError(null);
    return true;
  }

  function saveCurrentView() {
    try {
      const view = createDashboardSavedView({
        id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `view-${Date.now()}`,
        name,
        pathname,
        searchParams: resolvedParams,
        createdAt: new Date().toISOString(),
      });
      if (!persist([view, ...views].slice(0, DASHBOARD_SAVED_VIEW_LIMIT))) return;
      setName("");
      setError(null);
      setIsEditing(false);
    } catch {
      setError("กรุณาตั้งชื่อมุมมองไม่เกิน 60 ตัวอักษร");
    }
  }

  function applyView(view: DashboardSavedView) {
    router.push(view.query ? `${view.pathname}?${view.query}` : view.pathname);
  }

  function removeView(id: string) {
    persist(views.filter((view) => view.id !== id));
  }

  return (
    <section aria-labelledby="dashboard-saved-views-title" className="border border-slate-200 bg-white px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF0EA] text-[#B94727]"><BookmarkSimple aria-hidden="true" size={17} weight="fill" /></span>
          <div className="min-w-0">
            <h2 id="dashboard-saved-views-title" className="text-sm font-black text-slate-900">มุมมองวิเคราะห์</h2>
            <p className="text-[11px] leading-4 text-slate-500">บันทึกเฉพาะตัวกรอง aggregate ในเครื่องนี้ ไม่บันทึกข้อมูลบุคคล</p>
          </div>
        </div>
        <Link aria-label="หลักฐานภาคสนาม" className="inline-flex min-h-9 items-center rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:border-emerald-400" href={fieldHref}>หลักฐานภาคสนาม</Link>
        <Link aria-label="ตรวจ Pilot" className="inline-flex min-h-9 items-center rounded-[4px] border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 hover:border-amber-400" href={pilotHref}>ตรวจ Pilot</Link>
        <button aria-expanded={isEditing} className="inline-flex min-h-9 items-center gap-1.5 rounded-[4px] bg-[#171717] px-3 text-xs font-bold text-white hover:bg-[#B94727]" onClick={() => { setIsEditing((current) => !current); setError(null); }} type="button">
          {isEditing ? <X aria-hidden="true" size={14} /> : <FloppyDisk aria-hidden="true" size={14} />}
          {isEditing ? "ปิด" : "บันทึกมุมมองนี้"}
        </button>
      </div>

      {isEditing ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-700">ชื่อมุมมอง</span>
            <input aria-describedby={error ? "saved-view-error" : undefined} className="mt-1 min-h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" maxLength={60} onChange={(event) => setName(event.target.value)} placeholder="เช่น Pilot สิงหาคม - ความพึงพอใจ" value={name} />
          </label>
          <button className="min-h-10 rounded-[4px] bg-[#B94727] px-4 text-sm font-bold text-white hover:bg-[#92351F]" onClick={saveCurrentView} type="button">ยืนยันการบันทึก</button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs font-semibold text-rose-700" id="saved-view-error" role="alert">{error}</p> : null}

      {views.length > 0 ? (
        <div aria-label="มุมมองที่บันทึกไว้" className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {views.map((view) => (
            <span className="inline-flex max-w-full items-stretch rounded-[4px] border border-slate-200 bg-slate-50" key={view.id}>
              <button aria-label={`ใช้มุมมอง ${view.name}`} className="min-h-9 max-w-[15rem] truncate px-3 text-left text-xs font-bold text-slate-700 hover:bg-white hover:text-[#B94727]" onClick={() => applyView(view)} type="button">{view.name}</button>
              <button aria-label={`ลบมุมมอง ${view.name}`} className="flex min-h-9 w-9 shrink-0 items-center justify-center border-l border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-700" onClick={() => removeView(view.id)} type="button"><Trash aria-hidden="true" size={14} /></button>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

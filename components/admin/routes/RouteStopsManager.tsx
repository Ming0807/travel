"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, MapPin, Plus, Trash, WarningCircle, XCircle } from "@phosphor-icons/react";
import { updateRouteStopsAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import {
  AdminFormErrorSummary,
  type AdminFormActionState,
  AdminFormSection,
  AdminHelpPanel,
  AdminReadinessPanel,
  AdminSaveBar,
} from "@/components/admin/forms/AdminFormUX";

export type RouteAttractionOption = Pick<
  AdminAttractionRow,
  "attraction_id" | "name_th" | "name_en" | "province_name_th" | "is_active" | "is_published"
> & Partial<Pick<AdminAttractionRow, "slug" | "latitude" | "longitude">> & { coverImageUrl?: string | null };

export type NormalizedStop = {
  attractionId: number;
  dayNumber: number;
  displayOrder: number;
  stopNoteTh: string;
  stopNoteEn: string;
};

interface RouteStopsManagerProps {
  routeId: number;
  initialStops: AdminRouteStopRow[];
  attractions: RouteAttractionOption[];
  onStopsChange?: (stops: NormalizedStop[]) => void;
  onStopsSaved?: () => void;
}

interface StopState extends NormalizedStop {
  id: string;
  attractionName: string;
}

const FIELD_LABELS = { stops: "จุดแวะ", routeId: "เส้นทาง" };

function sortStops(stops: StopState[]) {
  return [...stops].sort((a, b) => a.dayNumber - b.dayNumber || a.displayOrder - b.displayOrder);
}

function compactStopDays(stops: StopState[]) {
  const days = Array.from(new Set(stops.map((stop) => (
    Number.isInteger(stop.dayNumber) && stop.dayNumber > 0 ? stop.dayNumber : 1
  )))).sort((a, b) => a - b);
  const dayByPosition = new Map(days.map((day, index) => [day, index + 1]));

  return stops.map((stop) => ({
    ...stop,
    dayNumber: dayByPosition.get(stop.dayNumber) ?? 1,
  }));
}

function normalizeStops(stops: StopState[]): NormalizedStop[] {
  const orderByDay = new Map<number, number>();

  return sortStops(compactStopDays(stops)).map((stop) => {
    const dayNumber = Math.max(1, Number(stop.dayNumber) || 1);
    const displayOrder = (orderByDay.get(dayNumber) ?? 0) + 1;
    orderByDay.set(dayNumber, displayOrder);

    return {
      attractionId: stop.attractionId,
      dayNumber,
      displayOrder,
      stopNoteTh: stop.stopNoteTh,
      stopNoteEn: stop.stopNoteEn,
    };
  });
}

export function RouteStopsManager({ routeId, initialStops, attractions, onStopsChange, onStopsSaved }: RouteStopsManagerProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [stops, setStops] = useState<StopState[]>(() => compactStopDays(
    initialStops.map((stop, index) => ({
      id: `stop-${index}-${stop.stop_id}`,
      attractionId: stop.attraction_id,
      attractionName: stop.attraction_name_th ?? "",
      dayNumber: stop.day_number,
      displayOrder: stop.display_order,
      stopNoteTh: stop.stop_note_th ?? "",
      stopNoteEn: stop.stop_note_en ?? "",
    }))
  ));
  const [search, setSearch] = useState("");
  const [addDay, setAddDay] = useState(1);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eligibleAttractions = useMemo(
    () => attractions.filter((attraction) => attraction.is_active && attraction.is_published),
    [attractions]
  );
  const action = updateRouteStopsAction.bind(null, routeId);
  const [state, formAction, isPending] = useActionState<AdminFormActionState, FormData>(action, { success: false });
  const handledSaveState = useRef<AdminFormActionState | null>(null);
  const orderedStops = useMemo(() => sortStops(stops), [stops]);
  const normalizedStops = useMemo(() => normalizeStops(stops), [stops]);
  const serializedStops = useMemo(() => JSON.stringify(normalizedStops), [normalizedStops]);
  const usedAttractionIds = useMemo(() => new Set(stops.map((stop) => stop.attractionId).filter(Boolean)), [stops]);
  const dayNumbers = useMemo(
    () => Array.from(new Set(orderedStops.map((stop) => stop.dayNumber))).filter((day) => day > 0).sort((a, b) => a - b),
    [orderedStops]
  );
  const daysForControls = useMemo(() => {
    const maxDay = Math.max(1, ...dayNumbers);
    return Array.from({ length: maxDay + 1 }, (_, index) => index + 1);
  }, [dayNumbers]);

  const commitStops = useCallback((next: StopState[]) => {
    const compacted = compactStopDays(next);
    const availableDays = Array.from(new Set(compacted.map((stop) => stop.dayNumber))).sort((a, b) => a - b);
    const selectedDayPosition = availableDays.indexOf(addDay);
    setAddDay(selectedDayPosition >= 0 ? selectedDayPosition + 1 : Math.min(addDay, availableDays.length + 1));
    setStops(compacted);
    onStopsChange?.(normalizeStops(compacted));
  }, [addDay, onStopsChange]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }, []);

  useEffect(() => {
    if (state?.success && handledSaveState.current !== state) {
      handledSaveState.current = state;
      onStopsSaved?.();
      router.refresh();
    }
  }, [state, onStopsSaved, router]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const attractionById = useMemo(
    () => new Map(attractions.map((attraction) => [attraction.attraction_id, attraction])),
    [attractions]
  );
  const attractionOccurrences = useMemo(() => {
    const occurrences = new Map<number, StopState[]>();
    orderedStops.forEach((stop) => {
      if (!stop.attractionId) return;
      occurrences.set(stop.attractionId, [...(occurrences.get(stop.attractionId) ?? []), stop]);
    });
    return occurrences;
  }, [orderedStops]);
  const duplicatedAttractions = useMemo(() => new Map(
    Array.from(attractionOccurrences.entries())
      .filter(([, occurrences]) => occurrences.length > 1)
      .map(([attractionId, occurrences]) => [attractionId, {
        name: attractionById.get(attractionId)?.name_th ?? occurrences[0]?.attractionName ?? "สถานที่",
        occurrences,
      }])
  ), [attractionById, attractionOccurrences]);
  const hasDuplicateAttractions = duplicatedAttractions.size > 0;
  const hasInvalidAttraction = stops.some((stop) => !stop.attractionId);
  const hasInvalidDay = stops.some((stop) => !Number.isInteger(stop.dayNumber) || stop.dayNumber < 1);
  const distinctEligibleStopCount = new Set(
    stops
      .filter((stop) => eligibleAttractions.some((attraction) => attraction.attraction_id === stop.attractionId))
      .map((stop) => stop.attractionId)
  ).size;
  const contiguousDays = dayNumbers.every((day, index) => day === index + 1);
  const expectedOrderByDay = new Map<number, number>();
  const contiguousOrder = normalizedStops.every((stop) => {
    const expectedOrder = (expectedOrderByDay.get(stop.dayNumber) ?? 0) + 1;
    expectedOrderByDay.set(stop.dayNumber, expectedOrder);
    return stop.displayOrder === expectedOrder;
  });
  const hasContiguousSchedule = stops.length > 0 && contiguousDays && contiguousOrder && !hasInvalidDay;
  const selectedIds = usedAttractionIds;
  const filteredAttractions = eligibleAttractions.filter((attraction) => {
    if (selectedIds.has(attraction.attraction_id)) return false;
    const term = search.trim().toLocaleLowerCase();
    if (!term) return true;
    return [attraction.name_th, attraction.name_en, attraction.province_name_th]
      .some((value) => value?.toLocaleLowerCase().includes(term));
  });

  const readiness = [
    {
      label: "มีจุดแวะที่เข้าเกณฑ์อย่างน้อย 2 แห่ง",
      complete: distinctEligibleStopCount >= 2,
      help: `พบ ${distinctEligibleStopCount}/2 แห่งจากสถานที่ที่เปิดใช้งานและเผยแพร่; เซิร์ฟเวอร์ตรวจเงื่อนไขก่อนเผยแพร่`,
    },
    { label: "ทุกจุดเลือกสถานที่แล้ว", complete: stops.length > 0 && !hasInvalidAttraction, help: "แต่ละจุดต้องเชื่อมกับสถานที่ท่องเที่ยว" },
    {
      label: "วันและลำดับต่อเนื่อง",
      complete: hasContiguousSchedule,
      help: "ใช้ปุ่มขึ้น/ลงจัดลำดับ; วันว่างจะถูกยุบและจัดหมายเลขวันใหม่ให้ต่อเนื่อง",
    },
    {
      label: "ไม่มีจุดแวะซ้ำ",
      complete: !hasDuplicateAttractions,
      help: hasDuplicateAttractions ? `สถานที่ ${duplicatedAttractions.size} แห่งถูกเพิ่มซ้ำ` : "แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว",
    },
  ];

  const handleQuickAdd = (dayNumber: number) => {
    setAddDay(dayNumber);
    searchRef.current?.focus();
  };

  const handleAddStop = (attraction: RouteAttractionOption) => {
    if (usedAttractionIds.has(attraction.attraction_id)) return;
    const nextDayStops = stops.filter((stop) => stop.dayNumber === addDay);
    commitStops([...stops, {
      id: `stop-new-${attraction.attraction_id}`,
      attractionId: attraction.attraction_id,
      attractionName: attraction.name_th,
      dayNumber: addDay,
      displayOrder: Math.max(0, ...nextDayStops.map((stop) => stop.displayOrder)) + 1,
      stopNoteTh: "",
      stopNoteEn: "",
    }]);
  };

  const handleRemoveStop = (id: string) => commitStops(stops.filter((stop) => stop.id !== id));

  const handleMove = (id: string, direction: "up" | "down") => {
    const dayStops = orderedStops.filter((stop) => stop.dayNumber === orderedStops.find((item) => item.id === id)?.dayNumber);
    const index = dayStops.findIndex((stop) => stop.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= dayStops.length) return;
    const current = dayStops[index];
    const target = dayStops[targetIndex];
    commitStops(stops.map((stop) => {
      if (stop.id === current.id) return { ...stop, displayOrder: target.displayOrder };
      if (stop.id === target.id) return { ...stop, displayOrder: current.displayOrder };
      return stop;
    }));
  };

  const handleMoveToDay = (id: string, dayNumber: number) => {
    const nextDayStops = stops.filter((stop) => stop.dayNumber === dayNumber && stop.id !== id);
    const nextOrder = Math.max(0, ...nextDayStops.map((stop) => stop.displayOrder)) + 1;
    commitStops(stops.map((stop) => stop.id === id ? { ...stop, dayNumber, displayOrder: nextOrder } : stop));
  };

  const handleAttractionChange = (stop: StopState, newAttractionId: number) => {
    const existingStop = stops.find((candidate) => candidate.id !== stop.id && candidate.attractionId === newAttractionId);
    if (existingStop) {
      const name = attractionById.get(newAttractionId)?.name_th ?? existingStop.attractionName ?? "สถานที่";
      showToast(`"${name}" ถูกใช้ในวันที่ ${existingStop.dayNumber} (ลำดับ ${existingStop.displayOrder}) อยู่แล้ว — เกิดจุดแวะซ้ำ`);
      return;
    }
    const attraction = attractionById.get(newAttractionId);
    commitStops(stops.map((item) => item.id === stop.id ? {
      ...item,
      attractionId: newAttractionId,
      attractionName: attraction?.name_th ?? item.attractionName,
    } : item));
  };

  const handleRemoveAllDuplicates = () => {
    const seen = new Set<number>();
    commitStops(orderedStops.filter((stop) => {
      if (seen.has(stop.attractionId)) return false;
      seen.add(stop.attractionId);
      return true;
    }));
  };

  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast("");
  };

  return (
    <form action={formAction} className="space-y-5">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />
      {state?.success ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">บันทึกจุดแวะแล้ว</p> : null}

      {toast ? (
        <div role="status" className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" aria-live="polite">
          <WarningCircle size={18} className="mt-0.5 shrink-0 text-amber-700" weight="fill" />
          <p className="min-w-0 flex-1 leading-6">{toast}</p>
          <button type="button" onClick={dismissToast} className="rounded p-1 text-amber-700 hover:bg-amber-100" aria-label="ปิดการแจ้งเตือน">
            <XCircle size={18} weight="bold" />
          </button>
        </div>
      ) : null}

      <input type="hidden" name="stops" value={serializedStops} />

      <fieldset disabled={isPending} className="min-w-0 space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)]">
        <div className="min-w-0 space-y-5">
          {eligibleAttractions.length === 0 ? (
            <AdminHelpPanel title="ยังไม่มีสถานที่สำหรับเพิ่มในเส้นทาง" tone="warning">
              <p>ยังไม่มีสถานที่ท่องเที่ยวที่เปิดใช้งานและเผยแพร่ จึงเพิ่มจุดแวะใหม่ไม่ได้</p>
              <Link href="/admin/attractions" className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-100">
                จัดการสถานที่ท่องเที่ยว
              </Link>
            </AdminHelpPanel>
          ) : null}

          <AdminFormSection title="เพิ่มสถานที่" description="ค้นหาจากสถานที่ที่เปิดใช้งานและเผยแพร่ แล้วเพิ่มเข้าวันเดินทางที่เลือก">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
              <label className="block min-w-0">
                <span className="text-sm font-bold text-slate-700">ค้นหาสถานที่ท่องเที่ยว</span>
                <input
                  ref={searchRef}
                  aria-label="ค้นหาสถานที่ท่องเที่ยว"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ชื่อสถานที่หรือจังหวัด"
                  className="mt-2 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
            <div role="group" aria-label="เพิ่มจุดแวะในวัน" className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600">เพิ่มในวัน</span>
              {daysForControls.map((day) => (
                <button key={day} type="button" aria-pressed={addDay === day} onClick={() => setAddDay(day)} className={`min-h-9 rounded-md border px-3 py-1.5 text-xs font-bold ${addDay === day ? "border-[#0A6B62] bg-emerald-50 text-[#073F37]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  วันที่ {day}
                </button>
              ))}
            </div>
            {filteredAttractions.length ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="สถานที่ที่เลือกเพิ่มได้">
                {filteredAttractions.map((attraction) => (
                  <li key={attraction.attraction_id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleAddStop(attraction)}
                      className="flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-slate-800 transition hover:border-[#0A6B62] hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
                      aria-label={`เพิ่ม ${attraction.name_th} วันที่ ${addDay}`}
                    >
                      <span className="min-w-0">
                        <span className="block break-words">{attraction.name_th}</span>
                        {attraction.province_name_th ? <span className="mt-0.5 block text-xs font-medium text-slate-500">{attraction.province_name_th}</span> : null}
                      </span>
                      <Plus size={18} className="shrink-0 text-[#0A6B62]" weight="bold" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500" aria-live="polite">
                {eligibleAttractions.length === 0 ? "ไม่มีสถานที่ที่เข้าเงื่อนไข" : search.trim() ? "ไม่พบสถานที่ที่ยังไม่ได้เลือก" : "เลือกสถานที่ครบแล้ว"}
              </p>
            )}
          </AdminFormSection>

          {stops.length === 0 ? (
            <AdminFormSection title="ยังไม่มีจุดแวะ" description="เพิ่มสถานที่แรกจากรายการด้านบน หรือบันทึกรายการว่างสำหรับฉบับร่าง">
              <button type="button" onClick={() => handleQuickAdd(1)} disabled={eligibleAttractions.length === 0} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#073F37] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0A6B62] disabled:cursor-not-allowed disabled:opacity-50">
                <Plus size={18} weight="bold" /> เพิ่มจุดแวะแรก
              </button>
            </AdminFormSection>
          ) : null}

          {dayNumbers.map((day) => {
            const dayStops = orderedStops.filter((stop) => stop.dayNumber === day);

            return (
              <AdminFormSection
                key={`day-${day}`}
                title={`วันที่ ${day}`}
                description={`${dayStops.length} จุดแวะ`}
                icon={MapPin}
                aside={<button type="button" onClick={() => handleQuickAdd(day)} disabled={eligibleAttractions.length === 0} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0A6B62] hover:bg-emerald-50 disabled:opacity-50"><Plus size={16} weight="bold" />เพิ่มจุดแวะ</button>}
              >
                <ol className="space-y-3">
                  {dayStops.map((stop, index) => {
                    const attraction = attractionById.get(stop.attractionId);
                    const name = attraction?.name_th || stop.attractionName || `สถานที่ #${stop.attractionId}`;
                    const occurrences = attractionOccurrences.get(stop.attractionId) ?? [];
                    const isDuplicate = occurrences.length > 1;
                    const canMoveUp = index > 0;
                    const canMoveDown = index < dayStops.length - 1;

                    return (
                      <li key={stop.id}>
                        <article aria-label={`จุดแวะ ${name} วันที่ ${day} ลำดับ ${index + 1}`} className="grid min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:p-4">
                          <div className="flex items-start gap-3 sm:block">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:h-16 sm:w-16">
                              {attraction?.coverImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={attraction.coverImageUrl} alt={name} className="h-full w-full object-cover" />
                              ) : <MapPin size={22} className="absolute inset-0 m-auto text-slate-400" weight="duotone" />}
                            </div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-sm font-black text-[#073F37] sm:mt-2">{index + 1}</span>
                          </div>

                          <div className="min-w-0 space-y-3">
                            <div className="flex min-w-0 items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 aria-label={name} className="break-words text-sm font-black text-slate-900">
                                  <span>{name} · {attraction?.province_name_th ?? "จังหวัดไม่ระบุ"}</span>
                                </h3>
                                {isDuplicate ? <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900">ซ้ำ</span> : null}
                              </div>
                              <button type="button" onClick={() => handleRemoveStop(stop.id)} aria-label={`ลบ ${name} ออกจากเส้นทาง`} title="ลบจุดแวะ" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
                                <Trash size={17} weight="bold" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button type="button" onClick={() => handleMove(stop.id, "up")} disabled={!canMoveUp} aria-label={`เลื่อน${name}ขึ้น`} title="เลื่อนขึ้น" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                <ArrowUp size={17} weight="bold" />
                              </button>
                              <button type="button" onClick={() => handleMove(stop.id, "down")} disabled={!canMoveDown} aria-label={`เลื่อน${name}ลง`} title="เลื่อนลง" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                <ArrowDown size={17} weight="bold" />
                              </button>
                            </div>

                            {isDuplicate ? (
                              <p className="text-xs leading-5 text-amber-800">
                                ปรากฏซ้ำใน: {occurrences.filter((occurrence) => occurrence.id !== stop.id).map((occurrence) => `วันที่ ${occurrence.dayNumber} (ลำดับ ${occurrence.displayOrder})`).join(", ")}
                              </p>
                            ) : null}

                            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                              <label className="block min-w-0">
                                <span className="sr-only">เลือกสถานที่แทน {name}</span>
                                <select aria-label={`เลือกสถานที่แทน ${name}`} value={stop.attractionId} onChange={(event) => handleAttractionChange(stop, Number(event.target.value))} className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15">
                                  <option value="0" disabled>เลือกสถานที่</option>
                                  {!eligibleAttractions.some((option) => option.attraction_id === stop.attractionId) ? <option value={stop.attractionId}>{name} (สถานที่ปัจจุบัน)</option> : null}
                                  {eligibleAttractions.map((option) => {
                                    const usedByOtherStop = stops.some((candidate) => candidate.id !== stop.id && candidate.attractionId === option.attraction_id);
                                    const isCurrentStop = option.attraction_id === stop.attractionId;
                                    return <option key={option.attraction_id} value={option.attraction_id} disabled={usedByOtherStop || isCurrentStop}>{option.name_th}{isCurrentStop ? " (สถานที่ปัจจุบัน)" : usedByOtherStop ? " (เลือกแล้ว)" : ""}</option>;
                                  })}
                                </select>
                              </label>
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                วันเดินทาง
                                <select aria-label="วันเดินทาง" value={stop.dayNumber} onChange={(event) => handleMoveToDay(stop.id, Number(event.target.value))} className="min-h-11 min-w-24 rounded-lg border border-slate-300 bg-white px-2 text-sm font-normal outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15">
                                  {daysForControls.map((dayNumber) => <option key={dayNumber} value={dayNumber}>วันที่ {dayNumber}</option>)}
                                </select>
                              </label>
                            </div>

                            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                              <label className="block min-w-0">
                                <span className="text-xs font-bold text-slate-600">คำแนะนำภาษาไทย</span>
                                <input type="text" value={stop.stopNoteTh} onChange={(event) => commitStops(stops.map((item) => item.id === stop.id ? { ...item, stopNoteTh: event.target.value } : item))} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" placeholder="เช่น จุดนัดพบหรือข้อมูลที่ควรรู้" />
                              </label>
                              <label className="block min-w-0">
                                <span className="text-xs font-bold text-slate-600">คำแนะนำภาษาอังกฤษ</span>
                                <input type="text" value={stop.stopNoteEn} onChange={(event) => commitStops(stops.map((item) => item.id === stop.id ? { ...item, stopNoteEn: event.target.value } : item))} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" placeholder="e.g. meeting point or helpful visitor information" />
                              </label>
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </AdminFormSection>
            );
          })}
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-24">
          <AdminReadinessPanel title="ความพร้อมของจุดแวะ" items={readiness} />
          {hasDuplicateAttractions ? (
            <AdminHelpPanel title="พบจุดแวะซ้ำ" tone="warning">
              <p className="mb-2 text-sm font-bold">มี {duplicatedAttractions.size} สถานที่ที่ถูกเพิ่มซ้ำในเส้นทางนี้:</p>
              <ul className="space-y-2">
                {Array.from(duplicatedAttractions.entries()).map(([attractionId, info]) => (
                  <li key={attractionId} className="text-xs leading-5">
                    <span className="font-bold text-amber-950">{info.name}</span>
                    <ul className="ml-3 mt-1 list-disc pl-4">
                      {info.occurrences.map((occurrence) => <li key={occurrence.id}>วันที่ {occurrence.dayNumber} (ลำดับ {occurrence.displayOrder})</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={handleRemoveAllDuplicates} className="mt-3 min-h-10 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-black text-amber-950 hover:bg-amber-100">
                ลบจุดแวะซ้ำทั้งหมด (เหลือเพียงรายการแรก)
              </button>
            </AdminHelpPanel>
          ) : null}
          <AdminHelpPanel title="ลำดับที่จะบันทึก" tone="info">
            {normalizedStops.length ? (
              <ol className="space-y-1">
                {normalizedStops.map((stop, index) => (
                  <li key={`${stop.dayNumber}-${stop.displayOrder}-${stop.attractionId}-${index}`}>
                    <span className="break-words text-sm font-medium text-slate-700">วันที่ {stop.dayNumber}.{stop.displayOrder} · {attractionById.get(stop.attractionId)?.name_th ?? stops.find((item) => item.attractionId === stop.attractionId)?.attractionName ?? `สถานที่ #${stop.attractionId}`}</span>
                  </li>
                ))}
              </ol>
            ) : <p>ยังไม่มีจุดแวะ</p>}
          </AdminHelpPanel>
        </aside>
      </div>

      <AdminSaveBar
        position="inline"
        cancelHref={`/admin/routes/${routeId}/edit#review`}
        isPending={isPending}
        submitLabel="บันทึกจุดแวะของเส้นทาง"
        disabled={hasInvalidAttraction || hasInvalidDay || hasDuplicateAttractions}
      />
      </fieldset>
    </form>
  );
}

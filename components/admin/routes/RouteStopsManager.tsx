"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  DotsSixVertical,
  MapPin,
  Plus,
  Trash,
  CaretDown,
  WarningCircle,
  Eraser,
  XCircle,
} from "@phosphor-icons/react";
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

interface RouteStopsManagerProps {
  routeId: number;
  initialStops: AdminRouteStopRow[];
  attractions: AdminAttractionRow[];
}

interface StopState {
  id: string;
  attractionId: number;
  dayNumber: number;
  displayOrder: number;
  stopNoteTh: string;
  stopNoteEn: string;
}

const FIELD_LABELS = {
  stops: "จุดแวะ",
  routeId: "เส้นทาง",
};

function sortStops(stops: StopState[]) {
  return [...stops].sort((a, b) => a.dayNumber - b.dayNumber || a.displayOrder - b.displayOrder);
}

function normalizeStops(stops: StopState[]) {
  const ordered = sortStops(stops);
  const orderByDay = new Map<number, number>();

  return ordered.map((stop) => {
    const nextOrder = (orderByDay.get(stop.dayNumber) ?? 0) + 1;
    orderByDay.set(stop.dayNumber, nextOrder);

    return {
      attractionId: stop.attractionId,
      dayNumber: Math.max(1, Number(stop.dayNumber) || 1),
      displayOrder: nextOrder,
      stopNoteTh: stop.stopNoteTh,
      stopNoteEn: stop.stopNoteEn,
    };
  });
}

export function RouteStopsManager({ routeId, initialStops, attractions }: RouteStopsManagerProps) {
  const router = useRouter();
  const [stops, setStops] = useState<StopState[]>(
    initialStops.map((stop, index) => ({
      id: `stop-${index}-${stop.stop_id}`,
      attractionId: stop.attraction_id,
      dayNumber: stop.day_number,
      displayOrder: stop.display_order,
      stopNoteTh: stop.stop_note_th ?? "",
      stopNoteEn: stop.stop_note_en ?? "",
    }))
  );

  const action = updateRouteStopsAction.bind(null, routeId);
  const [state, formAction, isPending] = useActionState<AdminFormActionState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/routes");
      router.refresh();
    }
  }, [state?.success, router]);

  const normalizedStops = useMemo(() => normalizeStops(stops), [stops]);
  const serializedStops = useMemo(() => JSON.stringify(normalizedStops), [normalizedStops]);
  const sortedStops = useMemo(() => sortStops(stops), [stops]);
  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(sortedStops.map((stop) => stop.dayNumber))).sort((a, b) => a - b);
    return uniqueDays.length ? uniqueDays : [1];
  }, [sortedStops]);

  // ─── Toast state ────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: "", visible: false });
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const hasInvalidAttraction = stops.some((stop) => !stop.attractionId);
  const hasInvalidOrder = stops.some((stop) => stop.dayNumber < 1 || stop.displayOrder < 1);
  // Build duplicate attraction info: which attractions appear more than once, and their day/order occurrences
  const attractionOccurrences = new Map<number, { id: string; dayNumber: number; displayOrder: number; name: string }[]>();
  stops.forEach((stop) => {
    if (!stop.attractionId) return;
    const attraction = attractions.find((a) => a.attraction_id === stop.attractionId);
    const occs = attractionOccurrences.get(stop.attractionId) ?? [];
    occs.push({ id: stop.id, dayNumber: stop.dayNumber, displayOrder: stop.displayOrder, name: attraction?.name_th ?? '' });
    attractionOccurrences.set(stop.attractionId, occs);
  });
  const duplicatedAttractions = new Map<number, { occurrences: { id: string; dayNumber: number; displayOrder: number }[]; name: string }>();
  attractionOccurrences.forEach((occs, attractionId) => {
    if (occs.length > 1) {
      duplicatedAttractions.set(attractionId, { occurrences: occs.map((o) => ({ id: o.id, dayNumber: o.dayNumber, displayOrder: o.displayOrder })), name: occs[0].name });
    }
  });
  const isStopDuplicate = (attractionId: number) => {
    return duplicatedAttractions.has(attractionId);
  };

  const hasDuplicateAttractions = duplicatedAttractions.size > 0;

  const readiness = [
    {
      label: "มีจุดแวะอย่างน้อย 1 จุด",
      complete: stops.length > 0,
      help: "เส้นทางที่ไม่มีจุดแวะจะทำให้นักท่องเที่ยวไม่เห็น itinerary จริง",
    },
    {
      label: "ทุกจุดเลือกสถานที่แล้ว",
      complete: stops.length > 0 && !hasInvalidAttraction,
      help: "แต่ละ stop ต้องเชื่อมกับ attraction เพื่อให้ข้อมูลหน้าบ้านและ dashboard ใช้ต่อได้",
    },
    {
      label: "ลำดับและวันเดินทางถูกต้อง",
      complete: stops.length > 0 && !hasInvalidOrder,
      help: "ระบบจะจัดลำดับใหม่ในแต่ละวันตอนบันทึก เพื่อลดความสับสน",
    },
    {
      label: "ไม่มีจุดแวะซ้ำ",
      complete: !hasDuplicateAttractions,
      help: hasDuplicateAttractions
        ? `สถานที่ ${duplicatedAttractions.size} แห่งถูกเพิ่มซ้ำ — ควรลบจุดแวะซ้ำหรือเปลี่ยนเป็นสถานที่อื่น`
        : "แต่ละสถานที่ปรากฏในเส้นทางได้เพียงครั้งเดียว",
    },
  ];

  const handleAddStop = (dayNumber = 1) => {
    const defaultAttractionId = attractions[0]?.attraction_id;
    const defaultName = attractions[0]?.name_th;

    // Check if the default attraction is already used in another stop
    const existingStop = defaultAttractionId
      ? stops.find((stop) => stop.attractionId === defaultAttractionId)
      : undefined;
    if (existingStop) {
      showToast(
        `"${defaultName ?? "สถานที่"}" ถูกใช้ในวันที่ ${existingStop.dayNumber} (ลำดับ ${existingStop.displayOrder}) อยู่แล้ว — เกิดจุดแวะซ้ำ`
      );
    }

    const dayStops = stops.filter((stop) => stop.dayNumber === dayNumber);

    setStops((current) => [
      ...current,
      {
        id: `stop-new-${Date.now()}`,
        attractionId: defaultAttractionId ?? 0,
        dayNumber,
        displayOrder: dayStops.length + 1,
        stopNoteTh: "",
        stopNoteEn: "",
      },
    ]);
  };

  const handleRemoveStop = (id: string) => {
    setStops((current) => current.filter((stop) => stop.id !== id));
  };

  const handleChange = (id: string, field: keyof StopState, value: string | number) => {
    setStops((current) =>
      current.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop))
    );
  };

  const handleAttractionChange = (id: string, newAttractionId: number) => {
    // Check if this attraction is already used by another stop
    const existingStop = stops.find((stop) => stop.id !== id && stop.attractionId === newAttractionId);
    if (existingStop) {
      const attraction = attractions.find((a) => a.attraction_id === newAttractionId);
      showToast(
        `"${attraction?.name_th ?? "สถานที่"}" ถูกใช้ในวันที่ ${existingStop.dayNumber} (ลำดับ ${existingStop.displayOrder}) อยู่แล้ว — เกิดจุดแวะซ้ำ`
      );
    }
    handleChange(id, "attractionId", newAttractionId);
  };

  const handleMoveToDay = (id: string, fromDay: number, toDay: number) => {
    setStops((current) => {
      const dayStops = current.filter((s) => s.dayNumber === toDay);
      const nextOrder = dayStops.length + 1;
      return current.map((stop) =>
        stop.id === id ? { ...stop, dayNumber: toDay, displayOrder: nextOrder } : stop
      );
    });
  };

  const handleRenumberDays = () => {
    setStops((current) => {
      const ordered = sortStops(current);
      const uniqueDays = Array.from(new Set(ordered.map((s) => s.dayNumber))).sort((a, b) => a - b);
      const dayMap = new Map(uniqueDays.map((day, index) => [day, index + 1]));
      return current.map((stop) => ({
        ...stop,
        dayNumber: dayMap.get(stop.dayNumber) ?? stop.dayNumber
      }));
    });
  };

  const handleRenumberOrderWithinDays = () => {
    setStops((current) => {
      const orderByDay = new Map<number, number>();
      const ordered = sortStops(current);
      return ordered.map((stop) => {
        const nextOrder = (orderByDay.get(stop.dayNumber) ?? 0) + 1;
        orderByDay.set(stop.dayNumber, nextOrder);
        return { ...stop, displayOrder: nextOrder };
      });
    });
  };

  const handleRemoveAllDuplicates = () => {
    setStops((current) => {
      // Recompute duplicates from current state to ensure accuracy
      const occMap = new Map<number, { id: string; dayNumber: number; displayOrder: number }[]>();
      current.forEach((s) => {
        if (!s.attractionId) return;
        const occs = occMap.get(s.attractionId) ?? [];
        occs.push({ id: s.id, dayNumber: s.dayNumber, displayOrder: s.displayOrder });
        occMap.set(s.attractionId, occs);
      });

      const idsToRemove = new Set<string>();
      occMap.forEach((occs) => {
        if (occs.length > 1) {
          // Keep first occurrence (sorted by day then order), remove the rest
          occs.sort((a, b) => a.dayNumber - b.dayNumber || a.displayOrder - b.displayOrder);
          occs.slice(1).forEach((occ) => idsToRemove.add(occ.id));
        }
      });

      return current.filter((stop) => !idsToRemove.has(stop.id));
    });
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    setStops((current) => {
      const ordered = sortStops(current);
      const index = ordered.findIndex((stop) => stop.id === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return current;
      const stop = ordered[index];
      const target = ordered[targetIndex];
      if (stop.dayNumber !== target.dayNumber) return current;

      return current.map((item) => {
        if (item.id === stop.id) return { ...item, displayOrder: target.displayOrder };
        if (item.id === target.id) return { ...item, displayOrder: stop.displayOrder };
        return item;
      });
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      {/* Duplicate toast notification */}
      {toast.visible ? (
        <div className="fixed left-1/2 top-4 z-50 w-full max-w-lg -translate-x-1/2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg backdrop-blur-md">
            <WarningCircle size={20} className="mt-0.5 shrink-0 text-amber-600" weight="fill" />
            <p className="flex-1 text-sm font-bold leading-relaxed text-amber-900">{toast.message}</p>
            <button
              type="button"
              onClick={dismissToast}
              className="shrink-0 rounded-lg p-1 text-amber-500 transition hover:bg-amber-100 hover:text-amber-700"
              aria-label="ปิดการแจ้งเตือน"
            >
              <XCircle size={18} weight="bold" />
            </button>
          </div>
        </div>
      ) : null}

      <input type="hidden" name="stops" value={serializedStops} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {stops.length === 0 ? (
            <AdminFormSection
              title="ยังไม่มีจุดแวะ"
              description="เริ่มจากเพิ่มสถานที่แรกของเส้นทางก่อน จากนั้นค่อยจัดวันและลำดับ"
              icon={MapPin}
            >
              <button
                type="button"
                onClick={() => handleAddStop(1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#073F37] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0A6B62]"
              >
                <Plus size={18} weight="bold" />
                เพิ่มจุดแวะแรก
              </button>
            </AdminFormSection>
          ) : null}

          {days.map((day) => {
            const dayStops = sortedStops.filter((stop) => stop.dayNumber === day);

            return (
              <AdminFormSection
                key={`day-${day}`}
                title={`วันที่ ${day}`}
                description={`${dayStops.length} จุดแวะในวันนี้ — เส้นทางมีทั้งหมด ${stops.length} จุดแวะ (${days.length} วัน)`}
                icon={MapPin}
                aside={
                  <button
                    type="button"
                    onClick={() => handleAddStop(day)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0A6B62]/20 bg-white px-3 py-2 text-xs font-black text-[#0A6B62] transition hover:bg-[#E6F4EF]"
                  >
                    <Plus size={15} weight="bold" />
                    เพิ่มจุดแวะ
                  </button>
                }
              >
                <div className="space-y-4">
                  {dayStops.map((stop, index) => {
                    const isDuplicate = isStopDuplicate(stop.attractionId);
                    const dupInfo = duplicatedAttractions.get(stop.attractionId);
                    const otherOccurrences = dupInfo?.occurrences.filter((o) => o.id !== stop.id) ?? [];

                    return (
                      <div key={stop.id} className="grid gap-4 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0 lg:grid-cols-[40px,1fr,160px]">
                        <div className="flex items-start justify-between gap-2 lg:block">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                            {index + 1}
                          </span>
                          <DotsSixVertical className="hidden text-slate-300 lg:mt-3 lg:block" size={18} />
                        </div>

                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                              <span className="text-sm font-black text-slate-700">
                                สถานที่ *
                                {isDuplicate ? (
                                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-amber-800">
                                    <WarningCircle size={11} weight="bold" />
                                    ซ้ำ
                                  </span>
                                ) : null}
                              </span>
                              <select
                                value={stop.attractionId}
                                onChange={(event) => handleAttractionChange(stop.id, Number(event.target.value))}
                                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                              >
                                <option value={0} disabled>
                                  เลือกสถานที่
                                </option>
                                {attractions.map((attraction) => (
                                  <option key={attraction.attraction_id} value={attraction.attraction_id}>
                                    {attraction.name_th}
                                  </option>
                                ))}
                              </select>
                              {otherOccurrences.length > 0 ? (
                                <span className="mt-1 block text-xs text-amber-700">
                                  ปรากฏซ้ำใน: {otherOccurrences.map((o) => `วันที่ ${o.dayNumber} (ลำดับ ${o.displayOrder})`).join(', ')}
                                </span>
                              ) : null}
                            </label>

                            <label className="block">
                              <span className="text-sm font-black text-slate-700">วันเดินทาง</span>
                              <input
                                type="number"
                                min={1}
                                value={stop.dayNumber}
                                onChange={(event) => handleChange(stop.id, "dayNumber", Number(event.target.value))}
                                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                              />
                            </label>

                            <label className="block">
                              <span className="text-sm font-black text-slate-700">ลำดับในวัน</span>
                              <input
                                type="number"
                                min={1}
                                value={stop.displayOrder}
                                onChange={(event) => handleChange(stop.id, "displayOrder", Number(event.target.value))}
                                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                              />
                            </label>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                              <span className="text-sm font-black text-slate-700">คำแนะนำภาษาไทย</span>
                              <input
                                type="text"
                                value={stop.stopNoteTh}
                                onChange={(event) => handleChange(stop.id, "stopNoteTh", event.target.value)}
                                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                                placeholder="เช่น แวะถ่ายรูป 30 นาที"
                              />
                            </label>

                            <label className="block">
                              <span className="text-sm font-black text-slate-700">English note</span>
                              <input
                                type="text"
                                value={stop.stopNoteEn}
                                onChange={(event) => handleChange(stop.id, "stopNoteEn", event.target.value)}
                                className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                                placeholder="e.g. Photo stop for 30 minutes"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 lg:flex-col lg:items-stretch lg:justify-start">
                          <div className="flex items-center gap-1 lg:flex-row">
                            <button
                              type="button"
                              onClick={() => handleMove(stop.id, "up")}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                              title="เลื่อนขึ้น"
                            >
                              <ArrowUp size={16} weight="bold" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(stop.id, "down")}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
                              title="เลื่อนลง"
                            >
                              <ArrowDown size={16} weight="bold" />
                            </button>
                          </div>
                          <label className="flex h-9 flex-1 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-500 transition hover:border-[#0A6B62] lg:justify-center">
                            <CaretDown size={13} weight="bold" />
                            <select
                              value={stop.dayNumber}
                              onChange={(event) => {
                                const newDay = Number(event.target.value);
                                if (newDay === stop.dayNumber) return;
                                handleMoveToDay(stop.id, stop.dayNumber, newDay);
                              }}
                              className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none"
                              title="ย้ายไปวันอื่น"
                            >
                              {days.map((d) => (
                                <option key={d} value={d}>
                                  วัน {d}
                                </option>
                              ))}
                              <option value={Math.max(...days) + 1}>+ วันใหม่</option>
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(stop.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50"
                            title="ลบจุดแวะนี้"
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AdminFormSection>
            );
          })}
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:col-span-4">
          <AdminReadinessPanel title="Route readiness" items={readiness} />

          {hasDuplicateAttractions ? (
            <AdminHelpPanel title="พบจุดแวะซ้ำ" tone="warning">
              <p className="mb-2 text-sm font-bold">
                มี {duplicatedAttractions.size} สถานที่ที่ถูกเพิ่มซ้ำในเส้นทางนี้:
              </p>
              <ul className="space-y-2">
                {Array.from(duplicatedAttractions.entries()).map(([attractionId, info]) => {
                  return (
                    <li key={attractionId} className="text-xs leading-5">
                      <span className="font-bold text-amber-900">{info.name}</span>
                      <ul className="ml-3 mt-1 list-disc pl-4">
                        {info.occurrences.map((occ, i) => (
                          <li key={i}>
                            วันที่ {occ.dayNumber} (ลำดับ {occ.displayOrder})
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={handleRemoveAllDuplicates}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-900 transition hover:bg-amber-100"
              >
                <Eraser size={14} weight="bold" />
                ลบจุดแวะซ้ำทั้งหมด (เหลือเพียงรายการแรก)
              </button>
            </AdminHelpPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRenumberDays}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  เรียงลำดับวันใหม่
                </button>
                <button
                  type="button"
                  onClick={handleRenumberOrderWithinDays}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  เรียงลำดับลำดับใหม่
                </button>
              </div>

              <AdminHelpPanel title="ลำดับที่ระบบจะบันทึก" tone="success">
            <ol className="space-y-2">
              {normalizedStops.length ? (
                normalizedStops.map((stop, index) => {
                  const attraction = attractions.find((item) => item.attraction_id === stop.attractionId);
                  return (
                    <li key={`${stop.dayNumber}-${stop.displayOrder}-${stop.attractionId}-${index}`} className="text-sm">
                      <span className="font-black text-[#073F37]">
                        Day {stop.dayNumber}.{stop.displayOrder}
                      </span>{" "}
                      {attraction?.name_th ?? "ยังไม่เลือกสถานที่"}
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-slate-500">ยังไม่มีจุดแวะในเส้นทางนี้</li>
              )}
            </ol>
          </AdminHelpPanel>

          <AdminHelpPanel title="หลักการจัดเส้นทาง" tone="info">
            ใช้ stop เพื่อกำหนดเรื่องเล่าหน้าบ้านและเชื่อมข้อมูลเข้ากับ attraction analytics.
            ถ้าต้องเปลี่ยนภาพของสถานที่ ให้ไปที่ Media ของสถานที่นั้น ไม่ต้องสร้าง stop ใหม่
          </AdminHelpPanel>
        </div>
      </div>

      <AdminSaveBar
        cancelHref="/admin/routes"
        isPending={isPending}
        submitLabel="บันทึกจุดแวะของเส้นทาง"
        disabled={stops.length === 0 || hasInvalidAttraction || hasInvalidOrder || hasDuplicateAttractions}
        secondary={
          <button
            type="button"
            onClick={() => handleAddStop(days[days.length - 1] ?? 1)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <Plus size={17} weight="bold" />
            เพิ่มจุดแวะ
          </button>
        }
      />
    </form>
  );
}

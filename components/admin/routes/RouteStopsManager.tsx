"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  DotsSixVertical,
  MapPin,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { updateRouteStopsAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import {
  AdminFormErrorSummary,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
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

  const hasInvalidAttraction = stops.some((stop) => !stop.attractionId);
  const hasInvalidOrder = stops.some((stop) => stop.dayNumber < 1 || stop.displayOrder < 1);
  const duplicatedAttractions = new Set<number>();
  const seenAttractions = new Set<number>();

  stops.forEach((stop) => {
    if (!stop.attractionId) return;
    if (seenAttractions.has(stop.attractionId)) duplicatedAttractions.add(stop.attractionId);
    seenAttractions.add(stop.attractionId);
  });

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
  ];

  const handleAddStop = (dayNumber = 1) => {
    const dayStops = stops.filter((stop) => stop.dayNumber === dayNumber);

    setStops((current) => [
      ...current,
      {
        id: `stop-new-${Date.now()}`,
        attractionId: attractions[0]?.attraction_id ?? 0,
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
                description={`${dayStops.length} จุดแวะในวันนี้`}
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
                    const duplicate = duplicatedAttractions.has(stop.attractionId);

                    return (
                      <div key={stop.id} className="grid gap-4 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0 lg:grid-cols-[40px,1fr,44px]">
                        <div className="flex items-start justify-between gap-2 lg:block">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                            {index + 1}
                          </span>
                          <DotsSixVertical className="hidden text-slate-300 lg:mt-3 lg:block" size={18} />
                        </div>

                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                              <span className="text-sm font-black text-slate-700">สถานที่ *</span>
                              <select
                                value={stop.attractionId}
                                onChange={(event) => handleChange(stop.id, "attractionId", Number(event.target.value))}
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
                              {duplicate ? (
                                <span className="mt-1 block text-xs font-bold text-amber-700">
                                  สถานที่นี้ถูกเลือกซ้ำในเส้นทางเดียวกัน ตรวจอีกครั้งว่าเป็นความตั้งใจหรือไม่
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

                        <div className="flex items-center justify-end gap-2 lg:flex-col lg:items-stretch lg:justify-start">
                          <button
                            type="button"
                            onClick={() => handleMove(stop.id, "up")}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp size={17} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(stop.id, "down")}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                            title="เลื่อนลง"
                          >
                            <ArrowDown size={17} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(stop.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50"
                            title="ลบจุดแวะนี้"
                          >
                            <Trash size={17} weight="bold" />
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
        disabled={stops.length === 0 || hasInvalidAttraction || hasInvalidOrder}
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

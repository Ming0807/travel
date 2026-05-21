"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { updateRouteStopsAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteStopRow } from "@/lib/repositories/admin-route.repository";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import { Plus, Trash, DotsSixVertical } from "@phosphor-icons/react";

interface RouteStopsManagerProps {
  routeId: number;
  initialStops: AdminRouteStopRow[];
  attractions: AdminAttractionRow[];
}

interface StopState {
  id: string; // temp client-side id
  attractionId: number;
  dayNumber: number;
  displayOrder: number;
  stopNoteTh: string;
  stopNoteEn: string;
}

export function RouteStopsManager({ routeId, initialStops, attractions }: RouteStopsManagerProps) {
  const router = useRouter();
  const [stops, setStops] = useState<StopState[]>(
    initialStops.map((s, i) => ({
      id: `stop-${i}-${s.stop_id}`,
      attractionId: s.attraction_id,
      dayNumber: s.day_number,
      displayOrder: s.display_order,
      stopNoteTh: s.stop_note_th ?? "",
      stopNoteEn: s.stop_note_en ?? "",
    }))
  );

  const action = updateRouteStopsAction.bind(null, routeId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
  });

  if (state?.success) {
    router.push("/admin/routes");
    router.refresh();
  }

  const handleAddStop = () => {
    setStops([
      ...stops,
      {
        id: `stop-new-${Date.now()}`,
        attractionId: attractions[0]?.attraction_id ?? 0,
        dayNumber: 1,
        displayOrder: stops.length + 1,
        stopNoteTh: "",
        stopNoteEn: "",
      },
    ]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleChange = (id: string, field: keyof StopState, value: string | number) => {
    setStops(
      stops.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  // Group by day for rendering
  const days = Array.from(new Set(stops.map((s) => s.dayNumber))).sort((a, b) => a - b);
  // If no days, just show Day 1
  if (days.length === 0) days.push(1);

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {state?.error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
          {state.error}
        </div>
      )}

      {/* Hidden input to pass the JSON stops payload */}
      <input type="hidden" name="stops" value={JSON.stringify(stops)} />

      <div className="space-y-6">
        {days.map((day) => {
          const dayStops = stops.filter((s) => s.dayNumber === day).sort((a, b) => a.displayOrder - b.displayOrder);

          return (
            <div key={`day-${day}`} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="font-semibold text-slate-800">วันที่ {day}</h3>
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0A6B62] hover:text-[#075049]"
                >
                  <Plus size={16} weight="bold" />
                  เพิ่มจุดแวะ
                </button>
              </div>
              <div className="p-6 space-y-4">
                {dayStops.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-4">ไม่มีจุดแวะในวันนี้</p>
                ) : (
                  dayStops.map((stop, index) => (
                    <div key={stop.id} className="flex items-start gap-4 rounded-lg border border-slate-200 p-4">
                      <div className="flex h-10 items-center text-slate-400">
                        <DotsSixVertical size={20} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">สถานที่</label>
                            <select
                              value={stop.attractionId}
                              onChange={(e) => handleChange(stop.id, "attractionId", Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
                            >
                              <option value={0} disabled>-- เลือกสถานที่ --</option>
                              {attractions.map((a) => (
                                <option key={a.attraction_id} value={a.attraction_id}>
                                  {a.name_th}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-medium text-slate-700">วันที่</label>
                              <input
                                type="number"
                                min={1}
                                value={stop.dayNumber}
                                onChange={(e) => handleChange(stop.id, "dayNumber", Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="mb-1 block text-xs font-medium text-slate-700">ลำดับ</label>
                              <input
                                type="number"
                                min={1}
                                value={stop.displayOrder}
                                onChange={(e) => handleChange(stop.id, "displayOrder", Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">คำแนะนำ/บันทึก (TH)</label>
                            <input
                              type="text"
                              value={stop.stopNoteTh}
                              onChange={(e) => handleChange(stop.id, "stopNoteTh", e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
                              placeholder="เช่น แวะถ่ายรูป 30 นาที"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">คำแนะนำ/บันทึก (EN)</label>
                            <input
                              type="text"
                              value={stop.stopNoteEn}
                              onChange={(e) => handleChange(stop.id, "stopNoteEn", e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="ลบจุดแวะนี้"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-[#0A6B62] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูลจุดแวะ"}
        </button>
      </div>
    </form>
  );
}

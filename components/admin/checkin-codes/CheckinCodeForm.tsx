"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCheckinCodeAction, updateCheckinCodeAction } from "@/app/actions/admin-checkin-code-actions";
import type { AdminCheckinCodeRow } from "@/lib/repositories/admin-checkin-code.repository";

interface CheckinCodeFormProps {
  initialData?: AdminCheckinCodeRow | null;
  attractions: { attraction_id: number; name_th: string }[];
  photoSpots: { photo_spot_id: number; attraction_id: number; spot_name_th: string }[];
}

export function CheckinCodeForm({ initialData, attractions, photoSpots }: CheckinCodeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateCheckinCodeAction.bind(null, initialData.checkin_code_id) : createCheckinCodeAction;
  
  const [selectedAttractionId, setSelectedAttractionId] = useState<number | "">(
    initialData?.attraction_id ?? ""
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/checkin-codes");
      router.refresh();
    }
  }, [state?.success, router]);

  const filteredSpots = photoSpots.filter(
    (spot) => spot.attraction_id === Number(selectedAttractionId)
  );

  return (
    <form action={formAction} className="space-y-8 max-w-4xl">
      {state?.error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
          {state.error}
        </div>
      )}

      <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">รหัส Check-in (Check-in Code)</h3>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-700">รหัส (Code) *</label>
            <input
              type="text"
              id="code"
              name="code"
              defaultValue={initialData?.code}
              required
              title="URL-safe characters only (letters, numbers, hyphens, underscores)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            />
            {state?.fieldErrors?.code && <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.code[0]}</p>}
            <p className="mt-1 text-[11px] text-slate-500">ใช้เป็นลิงก์: /c/รหัส</p>
          </div>

          <div>
            <label htmlFor="label" className="mb-1 block text-sm font-medium text-slate-700">ป้ายกำกับ (Label)</label>
            <input
              type="text"
              id="label"
              name="label"
              defaultValue={initialData?.label ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
              placeholder="เช่น จุดชมวิว, ทางเข้าหลัก"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">ความเชื่อมโยงสถานที่ (Associations)</h3>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="attractionId" className="mb-1 block text-sm font-medium text-slate-700">สถานที่ (Attraction) *</label>
            <select
              id="attractionId"
              name="attractionId"
              value={selectedAttractionId}
              onChange={(e) => setSelectedAttractionId(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
            >
              <option value="" disabled>-- เลือกสถานที่ --</option>
              {attractions.map(a => (
                <option key={a.attraction_id} value={a.attraction_id}>{a.name_th}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="photoSpotId" className="mb-1 block text-sm font-medium text-slate-700">จุดถ่ายภาพ (Photo Spot)</label>
            <select
              id="photoSpotId"
              name="photoSpotId"
              defaultValue={initialData?.photo_spot_id ?? ""}
              disabled={!selectedAttractionId || filteredSpots.length === 0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62] disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">-- ไม่ระบุจุดถ่ายภาพ --</option>
              {filteredSpots.map(s => (
                <option key={s.photo_spot_id} value={s.photo_spot_id}>{s.spot_name_th}</option>
              ))}
            </select>
            {selectedAttractionId && filteredSpots.length === 0 && (
              <p className="mt-1 text-[11px] text-slate-500">สถานที่นี้ยังไม่มีจุดถ่ายภาพ</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">ระยะเวลาและสถานะ (Duration & Status)</h3>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="startsAt" className="mb-1 block text-sm font-medium text-slate-700">เริ่มต้นใช้งาน (Starts At)</label>
            <input
              type="datetime-local"
              id="startsAt"
              name="startsAt"
              defaultValue={initialData?.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62]"
            />
          </div>
          <div>
            <label htmlFor="endsAt" className="mb-1 block text-sm font-medium text-slate-700">หมดอายุการใช้งาน (Ends At)</label>
            <input
              type="datetime-local"
              id="endsAt"
              name="endsAt"
              defaultValue={initialData?.ends_at ? new Date(initialData.ends_at).toISOString().slice(0, 16) : ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62]"
            />
            {state?.fieldErrors?.endsAt && <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.endsAt[0]}</p>}
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={initialData?.is_active ?? true}
              className="h-4 w-4 rounded border-slate-300 text-[#0A6B62] focus:ring-[#0A6B62]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              เปิดใช้งาน (Active)
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
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
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างรหัสใหม่"}
        </button>
      </div>
    </form>
  );
}

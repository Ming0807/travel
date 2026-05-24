"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckinCodeAction, updateCheckinCodeAction } from "@/app/actions/admin-checkin-code-actions";
import type { AdminCheckinCodeRow } from "@/lib/repositories/admin-checkin-code.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { QrCode, List, Plus } from "@phosphor-icons/react";

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

  if (state?.success && isEditing) {
    router.push("/admin/checkin-codes");
    router.refresh();
  }

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างรหัส Check-in สำเร็จ!"
          description="ระบบได้บันทึกข้อมูลรหัส Check-in เรียบร้อยแล้ว คุณสามารถนำรหัสนี้ไปทำ QR Code ได้ทันที"
          actions={[
            { label: "สร้างรหัส Check-in เพิ่ม", href: "/admin/checkin-codes/new", primary: true, icon: Plus },
            { label: "กลับไปหน้ารายการ", href: "/admin/checkin-codes", primary: false, icon: List }
          ]}
        />
      );
    }
  }

  const filteredSpots = photoSpots.filter(
    (spot) => spot.attraction_id === Number(selectedAttractionId)
  );

  function fieldError(name: string) {
    return state?.fieldErrors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-2xl p-4 text-sm font-bold bg-rose-50 text-rose-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Basic Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก (Basic Info)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">รหัส (Code) *</span>
                <input
                  type="text"
                  name="code"
                  defaultValue={initialData?.code}
                  required
                  title="URL-safe characters only (letters, numbers, hyphens, underscores)"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("code") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("code")}</span> : null}
                <p className="mt-1 text-[11px] font-bold text-slate-400">ตัวอย่างลิงก์ที่จะใช้งานจริง: /c/รหัสของคุณ</p>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ป้ายกำกับ (Label)</span>
                <input
                  type="text"
                  name="label"
                  defaultValue={initialData?.label ?? ""}
                  placeholder="เช่น จุดชมวิว, ทางเข้าหลัก"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </section>

          {/* 2. Associations */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ความเชื่อมโยงสถานที่ (Associations)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-1">
                <span className="text-sm font-bold text-slate-700">สถานที่ (Attraction) *</span>
                <select
                  name="attractionId"
                  value={selectedAttractionId}
                  onChange={(e) => setSelectedAttractionId(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                >
                  <option value="" disabled>-- เลือกสถานที่ --</option>
                  {attractions.map(a => (
                    <option key={a.attraction_id} value={a.attraction_id}>{a.name_th}</option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-1">
                <span className="text-sm font-bold text-slate-700">จุดถ่ายภาพ (Photo Spot)</span>
                <select
                  name="photoSpotId"
                  defaultValue={initialData?.photo_spot_id ?? ""}
                  disabled={!selectedAttractionId || filteredSpots.length === 0}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">-- ไม่ระบุจุดถ่ายภาพ --</option>
                  {filteredSpots.map(s => (
                    <option key={s.photo_spot_id} value={s.photo_spot_id}>{s.spot_name_th}</option>
                  ))}
                </select>
                {selectedAttractionId && filteredSpots.length === 0 && (
                  <p className="mt-1 text-[11px] font-bold text-slate-400">สถานที่นี้ยังไม่มีจุดถ่ายภาพ</p>
                )}
              </label>
            </div>
          </section>

        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 lg:h-max lg:self-start">
          
          {/* Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สถานะ (Status)</h2>
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
                เปิดใช้งาน (Active)
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={initialData?.is_active ?? true}
                  className="h-4 w-4 accent-teal-600"
                />
              </label>
            </div>
          </section>

          {/* Timing */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ระยะเวลา (Timing)</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">เริ่มต้นใช้งาน (Starts At)</span>
                <input
                  type="datetime-local"
                  name="startsAt"
                  defaultValue={initialData?.starts_at ? new Date(initialData.starts_at).toISOString().slice(0, 16) : ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">หมดอายุ (Ends At)</span>
                <input
                  type="datetime-local"
                  name="endsAt"
                  defaultValue={initialData?.ends_at ? new Date(initialData.ends_at).toISOString().slice(0, 16) : ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("endsAt") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("endsAt")}</span> : null}
              </label>
            </div>
          </section>

        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition" href="/admin/checkin-codes">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-[#F3704C] px-8 py-3 text-sm font-black text-white shadow-card hover:bg-[#E55A35] disabled:opacity-50 transition" type="submit">
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างรหัส Check-in"}
        </button>
      </div>
    </form>
  );
}

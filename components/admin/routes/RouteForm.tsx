"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createRouteAction, updateRouteAction } from "@/app/actions/admin-route-actions";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { MapPin, List, Plus } from "@phosphor-icons/react";

interface RouteFormProps {
  initialData?: AdminRouteRow | null;
}

export function RouteForm({ initialData }: RouteFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateRouteAction.bind(null, initialData.route_id) : createRouteAction;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  if (state?.success && isEditing) {
    router.push("/admin/routes");
    router.refresh();
  }

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างเส้นทางท่องเที่ยวสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลเส้นทางท่องเที่ยวใหม่ของคุณเรียบร้อยแล้ว ขั้นตอนต่อไปคือการเพิ่มจุดแวะพักเข้าสู่เส้นทาง"
          actions={[
            { label: "เพิ่มจุดแวะพัก (Stops) ลงในเส้นทาง", href: `/admin/routes/${newId}/stops`, primary: true, icon: MapPin },
            { label: "สร้างเส้นทางใหม่", href: "/admin/routes/new", primary: false, icon: Plus },
            { label: "กลับไปหน้ารายการ", href: "/admin/routes", primary: false, icon: List }
          ]}
        />
      );
    }
  }

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
                <span className="text-sm font-bold text-slate-700">ชื่อเส้นทาง (TH) *</span>
                <input
                  type="text"
                  name="nameTh"
                  defaultValue={initialData?.name_th}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("nameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameTh")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อเส้นทาง (EN)</span>
                <input
                  type="text"
                  name="nameEn"
                  defaultValue={initialData?.name_en ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
                {fieldError("nameEn") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameEn")}</span> : null}
              </label>
            </div>
          </section>

          {/* 2. Content */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">รายละเอียดเส้นทาง (Description)</h2>
            <div className="mt-5 space-y-6">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">รายละเอียดเส้นทาง (TH)</span>
                <textarea
                  name="descriptionTh"
                  defaultValue={initialData?.description_th ?? ""}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">รายละเอียดเส้นทาง (EN)</span>
                <textarea
                  name="descriptionEn"
                  defaultValue={initialData?.description_en ?? ""}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
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

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                เผยแพร่ (Published)
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={initialData?.is_published ?? false}
                  className="h-4 w-4 accent-[#F3704C]"
                />
              </label>
            </div>
          </section>

          {/* Media */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สื่อ (Media)</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">รูปภาพปก (URL/Path)</span>
                <input
                  type="text"
                  name="coverImagePath"
                  defaultValue={initialData?.cover_image_path ?? ""}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </section>

        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition" href="/admin/routes">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-[#F3704C] px-8 py-3 text-sm font-black text-white shadow-card hover:bg-[#E55A35] disabled:opacity-50 transition" type="submit">
          {isPending ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "สร้างเส้นทาง"}
        </button>
      </div>
    </form>
  );
}

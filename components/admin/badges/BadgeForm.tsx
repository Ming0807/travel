"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBadgeAction, updateBadgeAction } from "@/app/actions/admin-badge-actions";
import type { BadgeDefinition } from "@/types/tourism";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { List, Plus } from "@phosphor-icons/react";

type BadgeFormProps = {
  badge?: BadgeDefinition | null;
  submitLabel?: string;
};

type BadgeFormState = {
  success: boolean;
  error?: string;
  data?: { id: number };
};

const CATEGORY_OPTIONS = [
  { value: "exploration", label: "Exploration / การสำรวจ" },
  { value: "engagement", label: "Engagement / การมีส่วนร่วม" },
  { value: "milestone", label: "Milestone / เหตุการณ์สำคัญ" },
  { value: "social", label: "Social / สังคม" },
];

const REQUIREMENT_TYPE_OPTIONS = [
  { value: "xp_total", label: "XP Total (รวม XP)" },
  { value: "stamp_count", label: "Stamp Count (จำนวนตราประทับ)" },
  { value: "visit_count", label: "Visit Count (จำนวนการเข้าชม)" },
  { value: "survey_count", label: "Survey Count (จำนวนแบบสอบถาม)" },
  { value: "review_count", label: "Review Count (จำนวนรีวิว)" },
  { value: "restaurant_count", label: "Restaurant Count (จำนวนร้านอาหาร)" },
  { value: "province_count", label: "Province Count (จำนวนจังหวัด)" },
  { value: "attractions_in_province", label: "Attractions in Province" },
  { value: "attraction_category", label: "Attraction Category (ประเภทสถานที่)" },
];

export function BadgeForm({ badge, submitLabel = "บันทึกข้อมูล" }: BadgeFormProps) {
  const router = useRouter();
  const isEditing = !!badge;
  const action = isEditing ? updateBadgeAction.bind(null, badge!.badgeId) : createBadgeAction;

  const [state, formAction, isPending] = useActionState<BadgeFormState, FormData>(action, {
    success: false,
    error: undefined,
  });

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/badges");
    router.refresh();
    }
  }, [state?.success, isEditing, router]);

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างเหรียญรางวัล (Badge) สำเร็จ!"
          description="ระบบได้บันทึกข้อมูลเหรียญรางวัลใหม่ของคุณเรียบร้อยแล้ว"
          actions={[
            { label: "สร้างเหรียญรางวัลเพิ่ม", href: "/admin/badges/new", primary: true, icon: Plus },
            { label: "กลับไปหน้ารายการ", href: "/admin/badges", primary: false, icon: List }
          ]}
        />
      );
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {state?.error ? (
        <div className="rounded-2xl p-4 text-sm font-bold bg-rose-50 text-rose-700">{state.error}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก (Basic Info)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Badge Key * <span className="font-normal text-slate-400">(lowercase, no spaces)</span>
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.badgeKey ?? ""}
                  maxLength={100}
                  name="badgeKey"
                  required
                  pattern="[a-z0-9_]+"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Display Order</span>
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.displayOrder ?? 0}
                  name="displayOrder"
                  min={0}
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.nameTh ?? ""}
                  maxLength={255}
                  name="nameTh"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.nameEn ?? ""}
                  maxLength={255}
                  name="nameEn"
                  required
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">คำอธิบายภาษาไทย</span>
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.descriptionTh ?? ""}
                  maxLength={1000}
                  name="descriptionTh"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">คำอธิบายภาษาอังกฤษ</span>
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.descriptionEn ?? ""}
                  maxLength={1000}
                  name="descriptionEn"
                />
              </label>
            </div>
          </section>

          {/* Requirement */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">เงื่อนไขการปลดล็อค (Requirement)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">ประเภทเงื่อนไข *</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.requirementType ?? "xp_total"}
                  name="requirementType"
                  required
                >
                  {REQUIREMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">ค่าเงื่อนไข *</span>
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.requirementValue ?? 1}
                  name="requirementValue"
                  min={1}
                  required
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ค่าเงื่อนไขเสริม (เช่นชื่อจังหวัด หรือประเภท)</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.requirementExtra ?? ""}
                  maxLength={255}
                  name="requirementExtra"
                  placeholder="เช่น cultural_religious, yala, ..."
                />
              </label>
            </div>
          </section>
        </div>

        {/* Right Column (Settings & Icon) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 lg:h-max lg:self-start">
          {/* Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สถานะ (Status)</h2>
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
                เปิดใช้งาน (Active)
                <input
                  defaultChecked={badge?.isActive ?? true}
                  name="isActive"
                  type="checkbox"
                  value="true"
                  className="h-4 w-4 accent-teal-600"
                />
              </label>
            </div>
          </section>

          {/* Category & Icon */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">หมวดหมู่และไอคอน</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">หมวดหมู่ *</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.category ?? "exploration"}
                  name="category"
                  required
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Icon Name <span className="font-normal text-slate-400">(Phosphor icon)</span>
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={badge?.iconName ?? ""}
                  maxLength={100}
                  name="iconName"
                  placeholder="เช่น Trophy, Star, MapPin"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Icon Color (hex)</span>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200"
                    defaultValue={badge?.iconColor ?? "#E18868"}
                    name="iconColor"
                  />
                  <input
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                    defaultValue={badge?.iconColor ?? "#E18868"}
                    maxLength={50}
                    name="iconColorText"
                    placeholder="#E18868"
                  />
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition"
          href="/admin/badges"
        >
          ยกเลิก
        </Link>
        <button
          disabled={isPending}
          className="rounded-full bg-[#F3704C] px-8 py-3 text-sm font-black text-white shadow-card hover:bg-[#E55A35] disabled:opacity-50 transition"
          type="submit"
        >
          {isPending ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

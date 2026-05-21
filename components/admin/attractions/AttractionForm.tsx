"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createAttractionAction, updateAttractionAction } from "@/app/actions/admin-attraction-actions";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";

export type AdminSelectOption = {
  id: number;
  label: string;
};

type AttractionFormProps = {
  attraction?: AdminAttractionRow | null;
  provinces: AdminSelectOption[];
  districts: AdminSelectOption[];
  attractionTypes: AdminSelectOption[];
  submitLabel?: string;
};

export function AttractionForm({
  attraction,
  provinces,
  districts,
  attractionTypes,
  submitLabel = "บันทึกข้อมูล"
}: AttractionFormProps) {
  const router = useRouter();
  const isEditing = !!attraction;
  const action = isEditing ? updateAttractionAction.bind(null, attraction.attraction_id) : createAttractionAction;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  if (state?.success) {
    router.push("/admin/attractions");
    router.refresh();
  }

  function fieldError(name: string) {
    return state?.fieldErrors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="space-y-6">
      {attraction?.attraction_id ? <input name="attractionId" type="hidden" value={attraction.attraction_id} /> : null}

      {state?.error ? (
        <div className="rounded-2xl p-4 text-sm font-bold bg-rose-50 text-rose-700">
          {state.error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.name_th ?? ""}
              maxLength={255}
              name="nameTh"
              required
            />
            {fieldError("nameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameTh")}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.name_en ?? ""}
              maxLength={255}
              name="nameEn"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.slug ?? ""}
              maxLength={200}
              name="slug"
              required
            />
            {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัด *</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.province_id ?? ""}
              name="provinceId"
              required
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">อำเภอ</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.district_id ?? ""}
              name="districtId"
            >
              <option value="">ไม่ระบุ</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">ประเภทแหล่งท่องเที่ยว</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
              defaultValue={attraction?.attraction_type_id ?? ""}
              name="attractionTypeId"
            >
              <option value="">ไม่ระบุ</option>
              {attractionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-[#073F37]">เนื้อหาสาธารณะ</h2>
        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">คำอธิบายสั้นภาษาไทย</span>
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">คำอธิบายรายละเอียดภาษาไทย</span>
            <textarea className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.description_th ?? ""} maxLength={4000} name="descriptionTh" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">ที่อยู่/จุดสังเกต</span>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.address_text ?? ""} maxLength={1000} name="addressText" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ</span>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.opening_hours ?? ""} maxLength={255} name="openingHours" />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-black text-[#073F37]">สถานะและพิกัด</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Latitude</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.latitude ?? ""} name="latitude" type="number" step="0.0000001" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Longitude</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.longitude ?? ""} name="longitude" type="number" step="0.0000001" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            <input defaultChecked={attraction?.is_active ?? true} name="isActive" type="checkbox" value="true" />
            Active
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
            <input defaultChecked={attraction?.is_published ?? false} name="isPublished" type="checkbox" value="true" />
            Published
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-[#F4F8F6]/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700" href="/admin/attractions">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-[#073F37] px-5 py-3 text-sm font-black text-white shadow-card hover:bg-[#0A6B62] disabled:opacity-50" type="submit">
          {isPending ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

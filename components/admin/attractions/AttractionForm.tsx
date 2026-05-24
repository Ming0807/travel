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
    <form action={formAction} className="space-y-8">
      {attraction?.attraction_id ? <input name="attractionId" type="hidden" value={attraction.attraction_id} /> : null}

      {state?.error ? (
        <div className="rounded-2xl p-4 text-sm font-bold bg-rose-50 text-rose-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. ข้อมูลหลัก (Basic Info) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">ข้อมูลหลัก (Basic Info)</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
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

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={attraction?.name_en ?? ""}
                  maxLength={255}
                  name="nameEn"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={attraction?.slug ?? ""}
                  maxLength={200}
                  name="slug"
                  required
                />
                {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
              </label>
            </div>
          </section>

          {/* 2. เนื้อหาและภาษา (Content & Languages) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">เนื้อหาและเรื่องราว (Content & Story)</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">เนื้อหาภาษาไทย</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">คำอธิบายสั้น</span>
                  <textarea className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">รายละเอียดเชิงลึก</span>
                  <textarea className="mt-2 min-h-[160px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.description_th ?? ""} maxLength={4000} name="descriptionTh" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">ประวัติศาสตร์ / เรื่องเล่า (Storytelling)</span>
                  <textarea className="mt-2 min-h-[160px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.history_th ?? ""} maxLength={4000} name="historyTh" />
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">English Content</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Short Description</span>
                  <textarea className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.short_description_en ?? ""} maxLength={500} name="shortDescriptionEn" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Full Description</span>
                  <textarea className="mt-2 min-h-[160px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.description_en ?? ""} maxLength={4000} name="descriptionEn" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">History / Storytelling</span>
                  <textarea className="mt-2 min-h-[160px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.history_en ?? ""} maxLength={4000} name="historyEn" />
                </label>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 lg:h-max lg:self-start">
          
          {/* Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">สถานะ (Status)</h2>
            <div className="mt-5 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
                เปิดใช้งาน (Active)
                <input defaultChecked={attraction?.is_active ?? true} name="isActive" type="checkbox" value="true" className="h-4 w-4 accent-teal-600" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                เผยแพร่ (Published)
                <input defaultChecked={attraction?.is_published ?? false} name="isPublished" type="checkbox" value="true" className="h-4 w-4 accent-[#F3704C]" />
              </label>
            </div>
          </section>

          {/* Taxonomy */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#073F37]">หมวดหมู่พื้นที่</h2>
            <div className="mt-5 grid gap-4">
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
            </div>
          </section>

          {/* Sustainability */}
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
            <h2 className="text-lg font-black text-emerald-800">ความยั่งยืน (Sustainability)</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">หมวดหมู่ความยั่งยืน</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={attraction?.sustainability_category ?? ""}
                  name="sustainabilityCategory"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="Nature Conservation">Nature Conservation (เชิงนิเวศ/ธรรมชาติ)</option>
                  <option value="Community Based">Community Based (ชุมชน/ท้องถิ่น)</option>
                  <option value="Cultural Heritage">Cultural Heritage (ประวัติศาสตร์/วัฒนธรรม)</option>
                  <option value="Health & Wellness">Health & Wellness (สุขภาพ/เชิงการแพทย์)</option>
                  <option value="Adventure & Sport">Adventure & Sport (ผจญภัย/กีฬา)</option>
                  <option value="General">General (ทั่วไป)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">ขีดความสามารถ (คน/วัน)</span>
                <input 
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" 
                  defaultValue={attraction?.estimated_capacity_per_day ?? ""} 
                  name="estimatedCapacityPerDay" 
                  type="number" 
                  min="1" 
                  placeholder="จำนวน นทท. สูงสุด" 
                />
              </label>
            </div>
          </section>

        </div>
      </div>

      {/* 3. การจัดการและพิกัด (Location & Management) - Moved to bottom full width */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#073F37]">พิกัดและการติดต่อ (Location & Contact)</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="block md:col-span-2 lg:col-span-4">
            <span className="text-sm font-bold text-slate-700">ที่อยู่ / จุดสังเกต</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.address_text ?? ""} maxLength={1000} name="addressText" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">Latitude (ละติจูด)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">Longitude (ลองจิจูด)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.opening_hours ?? ""} maxLength={255} name="openingHours" placeholder="เช่น ทุกวัน 08:00 - 17:00 น." />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-sm font-bold text-slate-700">ข้อมูลการติดต่อ</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15" defaultValue={attraction?.contact_info ?? ""} maxLength={255} name="contactInfo" placeholder="เช่น เบอร์โทรศัพท์, Facebook" />
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition" href="/admin/attractions">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-[#F3704C] px-8 py-3 text-sm font-black text-white shadow-card hover:bg-[#E55A35] disabled:opacity-50 transition" type="submit">
          {isPending ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createAttractionAction, updateAttractionAction } from "@/app/actions/admin-attraction-actions";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { ImageSquare, QrCode, ArrowLeft, Info, MapPinLine, FileText } from "@phosphor-icons/react";
import { useState } from "react";

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

  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const [slug, setSlug] = useState(attraction?.slug ?? "");

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto format slug: lowercase, replace spaces and invalid chars with hyphens
    let val = e.target.value.toLowerCase();
    val = val.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(val);
  };

  if (state?.success && state.data?.id) {
    return (
      <SuccessNextSteps
        title={isEditing ? "อัปเดตข้อมูลสถานที่สำเร็จ!" : "สร้างสถานที่ท่องเที่ยวสำเร็จ!"}
        description="คุณสามารถไปจัดการรูปภาพ หรือสร้าง QR Code สำหรับสถานที่นี้ต่อได้เลย"
        actions={[
          {
            label: "จัดการรูปภาพ (Media & Photos)",
            href: `/admin/attractions/${state.data.id}/media`,
            icon: ImageSquare,
            primary: true,
          },
          {
            label: "สร้าง QR Code เช็คอิน",
            href: `/admin/checkin-codes/new?attraction_id=${state.data.id}`,
            icon: QrCode,
          },
          {
            label: "กลับหน้ารวมสถานที่",
            href: "/admin/attractions",
            icon: ArrowLeft,
          }
        ]}
      />
    );
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
          <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText size={20} className="text-ink" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">ข้อมูลหลัก (Basic Info)</h2>
                <p className="text-xs text-slate-500">ชื่อและข้อมูลพื้นฐานของสถานที่</p>
              </div>
            </div>
            <div className="p-6 grid gap-5 md:grid-cols-2">
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
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                  <div className="group relative flex items-center">
                    <Info size={16} className="text-slate-400 cursor-help" />
                    <div className="absolute left-6 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                      ใช้สำหรับสร้างลิงก์ของสถานที่ เช่น yala-tourism.com/attractions/<strong>{slug || "your-slug"}</strong> <br/>*ต้องเป็นภาษาอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น
                    </div>
                  </div>
                </div>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
                  value={slug}
                  onChange={handleSlugChange}
                  maxLength={200}
                  name="slug"
                  placeholder="e.g. betong-hot-spring"
                  required
                />
                {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
              </label>
            </div>
          </section>

          {/* 2. เนื้อหาและภาษา (Content & Languages) */}
          <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText size={20} className="text-ink" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">เนื้อหาและเรื่องราว (Content & Story)</h2>
                <p className="text-xs text-slate-500">คำอธิบายและประวัติศาสตร์ของสถานที่ (รองรับ 2 ภาษา)</p>
              </div>
            </div>
            <div className="p-6 grid gap-8 md:grid-cols-2">
              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">🇹🇭 เนื้อหาภาษาไทย</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600 mb-1.5 block">คำอธิบายสั้น</span>
                  <textarea className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" placeholder="สรุปจุดเด่นของสถานที่สั้นๆ..." />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600 mb-1.5 block">รายละเอียดเชิงลึก</span>
                  <textarea className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.description_th ?? ""} maxLength={4000} name="descriptionTh" placeholder="รายละเอียดของสถานที่ กิจกรรม สิ่งอำนวยความสะดวก..." />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600 mb-1.5 block">ประวัติศาสตร์ / เรื่องเล่า (Storytelling)</span>
                  <textarea className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.history_th ?? ""} maxLength={4000} name="historyTh" placeholder="ประวัติความเป็นมา เรื่องเล่า ตำนาน..." />
                </label>
              </div>

              <div className="space-y-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">🇬🇧 English Content</h3>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600 mb-1.5 block">Short Description</span>
                  <textarea className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.short_description_en ?? ""} maxLength={500} name="shortDescriptionEn" placeholder="Brief summary of the attraction..." />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600 mb-1.5 block">Full Description</span>
                  <textarea className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.description_en ?? ""} maxLength={4000} name="descriptionEn" placeholder="Detailed description of activities and facilities..." />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600 mb-1.5 block">History / Storytelling</span>
                  <textarea className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.history_en ?? ""} maxLength={4000} name="historyEn" placeholder="Historical background and storytelling..." />
                </label>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Settings & Metadata) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 lg:h-max lg:self-start">
          
          {/* Status */}
          <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QrCode size={20} className="text-ink" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">สถานะ (Status)</h2>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal has-[:checked]:bg-teal/5 has-[:checked]:text-teal-800">
                เปิดใช้งาน (Active)
                <input defaultChecked={attraction?.is_active ?? true} name="isActive" type="checkbox" value="true" className="h-4 w-4 accent-teal" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-coral has-[:checked]:bg-coral/5 has-[:checked]:text-coral">
                เผยแพร่ (Published)
                <input defaultChecked={attraction?.is_published ?? false} name="isPublished" type="checkbox" value="true" className="h-4 w-4 accent-coral" />
              </label>
            </div>
          </section>

          {/* Taxonomy */}
          <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">หมวดหมู่พื้นที่</h2>
            </div>
            <div className="p-6 grid gap-5">
              <label className="block">
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ประเภทแหล่งท่องเที่ยว</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
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
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">จังหวัด *</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
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
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">อำเภอ</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
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
          <section className="rounded-3xl border border-emerald-100 bg-white overflow-hidden shadow-sm">
            <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-800">ความยั่งยืน (Sustainability)</h2>
            </div>
            <div className="p-6 grid gap-5">
              <label className="block">
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">หมวดหมู่ความยั่งยืน</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
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
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ขีดความสามารถ (คน/วัน)</span>
                <input 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" 
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

      {/* 3. การจัดการและพิกัด (Location & Contact) */}
      <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <MapPinLine size={20} className="text-ink" weight="duotone" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">พิกัดและการติดต่อ (Location & Contact)</h2>
          </div>
        </div>
        <div className="p-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <label className="block md:col-span-2 lg:col-span-4">
            <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ที่อยู่ / จุดสังเกต</span>
            <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.address_text ?? ""} maxLength={1000} name="addressText" placeholder="หมู่บ้าน ถนน ตำบล..." />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">Latitude (ละติจูด)</span>
            <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">Longitude (ลองจิจูด)</span>
            <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">เวลาเปิดทำการ</span>
            <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.opening_hours ?? ""} maxLength={255} name="openingHours" placeholder="เช่น ทุกวัน 08:00 - 17:00 น." />
          </label>
          <label className="block lg:col-span-1">
            <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ข้อมูลการติดต่อ</span>
            <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.contact_info ?? ""} maxLength={255} name="contactInfo" placeholder="เช่น เบอร์โทรศัพท์, Facebook" />
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50 transition" href="/admin/attractions">
          ยกเลิก
        </Link>
        <button disabled={isPending} className="rounded-full bg-ink px-8 py-3 text-sm font-black text-white shadow-card hover:bg-ink/90 disabled:opacity-50 transition hover:-translate-y-0.5" type="submit">
          {isPending ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

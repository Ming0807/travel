"use client";

import { useActionState } from "react";
import { createAttractionAction, updateAttractionAction } from "@/app/actions/admin-attraction-actions";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { FormRichText } from "@/components/admin/forms/FormRichText";
import { ImageSquare, QrCode, ArrowLeft, MapPinLine, FileText, CheckCircle, WarningCircle, List } from "@phosphor-icons/react";
import { useState } from "react";
import { AttractionCategoryPicker, type AttractionCategoryOption } from "@/components/admin/attractions/AttractionCategoryPicker";
import type { AttractionTypeAssignment } from "@/lib/repositories/attraction-category.repository";

export type AdminSelectOption = {
  id: number;
  label: string;
  labelEn?: string | null;
  isActive?: boolean;
};

type AttractionFormProps = {
  attraction?: AdminAttractionRow | null;
  provinces: AdminSelectOption[];
  districts: AdminSelectOption[];
  attractionTypes: AttractionCategoryOption[];
  categoryAssignments?: AttractionTypeAssignment[];
  submitLabel?: string;
};

const FIELD_LABELS = {
  nameTh: "ชื่อภาษาไทย",
  slug: "Slug",
  provinceId: "จังหวัด",
  latitude: "Latitude",
  longitude: "Longitude",
  estimatedCapacityPerDay: "ขีดความสามารถ",
};

type AttractionFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: { id: number };
};

type AttractionFormTab = "overview" | "content" | "location" | "settings";

const FORM_TABS: { id: AttractionFormTab; label: string; icon: typeof FileText }[] = [
  { id: "overview", label: "ข้อมูลหลัก", icon: FileText },
  { id: "content", label: "เนื้อหา (2 ภาษา)", icon: List },
  { id: "location", label: "พิกัดและการติดต่อ", icon: MapPinLine },
  { id: "settings", label: "หมวดหมู่ & สถานะ", icon: QrCode },
];

export function AttractionForm({
  attraction,
  provinces,
  districts,
  attractionTypes,
  categoryAssignments = [],
  submitLabel = "บันทึกข้อมูล"
}: AttractionFormProps) {
  const isEditing = !!attraction;
  const action = isEditing ? updateAttractionAction.bind(null, attraction.attraction_id) : createAttractionAction;

  const [state, formAction, isPending] = useActionState<AttractionFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const [slug, setSlug] = useState(attraction?.slug ?? "");
  const [activeTab, setActiveTab] = useState<AttractionFormTab>("overview");

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <form action={formAction} className="space-y-6 pb-20">
      {attraction?.attraction_id ? <input name="attractionId" type="hidden" value={attraction.attraction_id} /> : null}

      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] items-start">
        {/* Left Navigation Menu */}
        <nav className="space-y-2 lg:sticky lg:top-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-2">เมนูจัดการข้อมูล</p>
          {FORM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                  isActive ? "bg-teal/10 text-teal-800" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} className={isActive ? "text-teal" : "text-slate-400"} />
                {tab.label}
              </button>
            );
          })}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center gap-2"><WarningCircle className="text-amber-500" size={16} weight="fill"/> ความพร้อม</h4>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className={slug ? "text-emerald-500" : "text-slate-300"} weight="fill" /> Slug
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className={attraction?.name_th ? "text-emerald-500" : "text-slate-300"} weight="fill" /> ชื่อภาษาไทย
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className={attraction?.province_id ? "text-emerald-500" : "text-slate-300"} weight="fill" /> จังหวัด
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Right Content Area */}
        <div className="space-y-6">

          {/* TAB 1: Overview */}
          <div className={activeTab === "overview" ? "block" : "hidden"}>
            <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">ข้อมูลหลัก (Basic Info)</h2>
                <p className="text-xs text-slate-500 mt-1">ชื่อและข้อมูลพื้นฐานของสถานที่</p>
              </div>
              <div className="p-6 grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                    defaultValue={attraction?.name_th ?? ""}
                    maxLength={255}
                    name="nameTh"
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
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
                    value={slug}
                    onChange={handleSlugChange}
                    maxLength={200}
                    name="slug"
                    placeholder="e.g. betong-hot-spring"
                  />
                  {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : null}
                </label>
              </div>
            </section>
          </div>

          {/* TAB 2: Content */}
          <div className={activeTab === "content" ? "block" : "hidden"}>
            <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">เนื้อหาและเรื่องราว (Content & Story)</h2>
                <p className="text-xs text-slate-500 mt-1">คำอธิบายและประวัติศาสตร์ของสถานที่ (รองรับ 2 ภาษา)</p>
              </div>
              <div className="p-6 grid gap-8 md:grid-cols-2">
                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">🇹🇭 เนื้อหาภาษาไทย</h3>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-600 mb-1.5 block">คำอธิบายสั้น</span>
                    <textarea className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" placeholder="สรุปจุดเด่นของสถานที่สั้นๆ..." />
                  </label>
                  <FormRichText imageLayoutControls label="รายละเอียดเชิงลึก" name="descriptionTh" defaultValue={attraction?.description_th ?? ""} minHeight={200} placeholder="รายละเอียดของสถานที่ กิจกรรม สิ่งอำนวยความสะดวก..." />
                  <FormRichText imageLayoutControls label="ประวัติศาสตร์ / เรื่องเล่า (Storytelling)" name="historyTh" defaultValue={attraction?.history_th ?? ""} minHeight={200} placeholder="ประวัติความเป็นมา เรื่องเล่า ตำนาน..." />
                </div>

                <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">🇬🇧 English Content</h3>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-600 mb-1.5 block">Short Description</span>
                    <textarea className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all resize-none" defaultValue={attraction?.short_description_en ?? ""} maxLength={500} name="shortDescriptionEn" placeholder="Brief summary of the attraction..." />
                  </label>
                  <FormRichText imageLayoutControls label="Full Description" name="descriptionEn" defaultValue={attraction?.description_en ?? ""} minHeight={200} placeholder="Detailed description of activities and facilities..." />
                  <FormRichText imageLayoutControls label="History / Storytelling" name="historyEn" defaultValue={attraction?.history_en ?? ""} minHeight={200} placeholder="Historical background and storytelling..." />
                </div>
              </div>
            </section>
          </div>

          {/* TAB 3: Location */}
          <div className={activeTab === "location" ? "block" : "hidden"}>
            <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">พิกัดและการติดต่อ (Location & Contact)</h2>
              </div>
              <div className="p-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <label className="block md:col-span-2 lg:col-span-4">
                  <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ที่อยู่ / จุดสังเกต</span>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.address_text ?? ""} maxLength={1000} name="addressText" placeholder="หมู่บ้าน ถนน ตำบล..." />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">Latitude (ละติจูด)</span>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">Longitude (ลองจิจูด)</span>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">เวลาเปิดทำการ</span>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.opening_hours ?? ""} maxLength={255} name="openingHours" placeholder="เช่น ทุกวัน 08:00 - 17:00 น." />
                </label>
                <label className="block lg:col-span-2">
                  <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ข้อมูลการติดต่อ</span>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={attraction?.contact_info ?? ""} maxLength={255} name="contactInfo" placeholder="เช่น เบอร์โทรศัพท์, Facebook" />
                </label>
              </div>
            </section>
          </div>

          {/* TAB 4: Settings (Status, Taxonomy, Sustainability) */}
          <div className={activeTab === "settings" ? "block" : "hidden"}>
            <div className="space-y-6">
              {/* Status */}
              <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">สถานะ (Status)</h2>
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
                  <AttractionCategoryPicker
                    categories={attractionTypes}
                    selectedCategoryIds={categoryAssignments.map((category) => category.attractionTypeId)}
                    primaryCategoryId={categoryAssignments.find((category) => category.isPrimary)?.attractionTypeId ?? attraction?.attraction_type_id}
                    error={state?.fieldErrors?.primaryAttractionTypeId?.[0] ?? state?.fieldErrors?.attractionTypeIds?.[0]}
                  />

                  <label className="block">
                    <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">จังหวัด *</span>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
                      defaultValue={attraction?.province_id ?? ""}
                      name="provinceId"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                    {fieldError("provinceId") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("provinceId")}</span> : null}
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
        </div>
      </div>

      <AdminSaveBar cancelHref="/admin/attractions" isPending={isPending} submitLabel={submitLabel} />
    </form>
  );
}

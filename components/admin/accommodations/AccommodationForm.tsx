"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAccommodationAction, updateAccommodationAction } from "@/app/actions/admin-accommodation-actions";
import type { AdminAccommodationRow } from "@/lib/repositories/admin-accommodation.repository";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";
import { AdminFormErrorSummary, AdminReadinessPanel, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { ArrowSquareOut, CheckCircle, Image as ImageIcon, List, MapPin, WarningCircle } from "@phosphor-icons/react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

export type AdminSelectOption = {
  id: number;
  label: string;
};

type AccommodationFormProps = {
  accommodation?: AdminAccommodationRow | null;
  provinces: AdminSelectOption[];
  submitLabel?: string;
  coverMediaId?: number | null;
  coverPreviewUrl?: string | null;
  isPubliclyAvailable?: boolean;
};

type AdminFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: { id: number };
};

type AccommodationDraft = {
  nameTh: string;
  nameEn: string;
  slug: string;
  descriptionTh: string;
  descriptionEn: string;
  provinceId: string;
  accommodationType: string;
  priceRange: string;
  addressText: string;
  contactInfo: string;
  latitude: string;
  longitude: string;
  isPublished: boolean;
};

type EditorSection = "basics" | "content" | "location" | "publishing";

const SECTIONS: { id: EditorSection; label: string; detail: string }[] = [
  { id: "basics", label: "ข้อมูลหลัก", detail: "ชื่อและ URL" },
  { id: "content", label: "รายละเอียด", detail: "เนื้อหาไทยและอังกฤษ" },
  { id: "location", label: "ที่ตั้ง", detail: "จังหวัด พิกัด และการติดต่อ" },
  { id: "publishing", label: "การแสดงผล", detail: "ภาพปก สถานะ และคลังรูป" },
];

const FIELD_LABELS: Record<string, string> = {
  nameTh: "ชื่อภาษาไทย",
  slug: "Slug",
  provinceId: "จังหวัด",
  latitude: "Latitude",
  longitude: "Longitude",
  coverMediaId: "รูปภาพปก",
  priceRange: "ช่วงราคา",
  accommodationType: "ประเภทที่พัก",
};

function initialDraft(accommodation?: AdminAccommodationRow | null): AccommodationDraft {
  return {
    nameTh: accommodation?.name_th ?? "",
    nameEn: accommodation?.name_en ?? "",
    slug: accommodation?.slug ?? "",
    descriptionTh: accommodation?.description_th ?? "",
    descriptionEn: accommodation?.description_en ?? "",
    provinceId: accommodation ? String(accommodation.province_id) : "",
    accommodationType: accommodation?.accommodation_type ?? "",
    priceRange: accommodation?.price_range ?? "",
    addressText: accommodation?.address_text ?? "",
    contactInfo: accommodation?.contact_info ?? "",
    latitude: accommodation?.latitude === null || accommodation?.latitude === undefined ? "" : String(accommodation.latitude),
    longitude: accommodation?.longitude === null || accommodation?.longitude === undefined ? "" : String(accommodation.longitude),
    isPublished: accommodation?.is_published ?? false,
  };
}

function inputValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

function textFieldClass(error?: string) {
  return `mt-2 min-h-11 w-full rounded-lg border bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15 sm:text-sm ${error ? "border-rose-400" : "border-slate-300"}`;
}

export function AccommodationForm({
  accommodation,
  provinces,
  submitLabel = "บันทึกข้อมูล",
  coverMediaId: initialMediaId,
  coverPreviewUrl: initialPreviewUrl,
  isPubliclyAvailable = false,
}: AccommodationFormProps) {
  const router = useRouter();
  const isEditing = !!accommodation;
  const [activeSection, setActiveSection] = useState<EditorSection>("basics");
  const [draft, setDraft] = useState(() => initialDraft(accommodation));
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(initialPreviewUrl ?? "");
  const [coverMediaId, setCoverMediaId] = useState<number | string | null>(initialMediaId ?? null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const action = isEditing ? updateAccommodationAction.bind(null, accommodation.accommodation_id) : createAccommodationAction;

  const [state, formAction, isPending] = useActionState<AdminFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state?.success && isEditing) {
      router.push("/admin/accommodations");
      router.refresh();
    }
  }, [state?.success, isEditing, router]);

  useEffect(() => {
    const errors = state?.fieldErrors;
    if (!errors) return;
    const section = errors.nameTh || errors.slug || errors.nameEn ? "basics"
      : errors.descriptionTh || errors.descriptionEn ? "content"
        : errors.provinceId || errors.latitude || errors.longitude || errors.addressText ? "location"
          : errors.coverMediaId || errors.coverMediaUrl ? "publishing" : null;
    if (!section) return;
    const frame = window.requestAnimationFrame(() => setActiveSection(section));
    return () => window.cancelAnimationFrame(frame);
  }, [state?.fieldErrors]);

  if (state?.success && !isEditing) {
    const newId = state.data?.id;
    if (newId) {
      return (
        <SuccessNextSteps
          title="สร้างที่พักสำเร็จ!"
          description="ระบบได้บันทึกข้อมูลที่พักใหม่ของคุณเรียบร้อยแล้ว คุณสามารถจัดการรูปภาพหรือกลับไปยังหน้ารายการได้"
          actions={[
            { label: "อัปโหลดรูปภาพที่พัก", href: `/admin/accommodations/${newId}`, primary: true, icon: ImageIcon },
            { label: "กลับไปหน้ารายการ", href: "/admin/accommodations", primary: false, icon: List },
          ]}
        />
      );
    }
  }

  function fieldError(name: string) {
    return state?.fieldErrors?.[name]?.[0];
  }

  function syncDraft(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setDraft({
      nameTh: inputValue(data, "nameTh"),
      nameEn: inputValue(data, "nameEn"),
      slug: inputValue(data, "slug"),
      descriptionTh: inputValue(data, "descriptionTh"),
      descriptionEn: inputValue(data, "descriptionEn"),
      provinceId: inputValue(data, "provinceId"),
      accommodationType: inputValue(data, "accommodationType"),
      priceRange: inputValue(data, "priceRange"),
      addressText: inputValue(data, "addressText"),
      contactInfo: inputValue(data, "contactInfo"),
      latitude: inputValue(data, "latitude"),
      longitude: inputValue(data, "longitude"),
      isPublished: data.has("isPublished"),
    });
  }

  const provinceLabel = provinces.find((province) => String(province.id) === draft.provinceId)?.label || "จังหวัดยังไม่ระบุ";
  const previewName = draft.nameTh.trim() || draft.nameEn.trim() || "ชื่อที่พัก";
  const readiness = [
    { label: "เพิ่มชื่อภาษาไทย", complete: !!draft.nameTh.trim() },
    { label: "กำหนด URL ที่ถูกต้อง", complete: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) },
    { label: "เลือกจังหวัด", complete: !!draft.provinceId },
    { label: "เพิ่มรายละเอียดอย่างน้อยหนึ่งภาษา", complete: !!(draft.descriptionTh.trim() || draft.descriptionEn.trim()) },
    { label: "เลือกภาพปกจากคลังสื่อ", complete: !!coverPreviewUrl },
  ];
  const completeReadinessCount = readiness.filter((item) => item.complete).length;

  return (
    <form action={formAction} onChange={syncDraft} noValidate className="space-y-5 pb-24">
      {accommodation?.accommodation_id ? <input name="accommodationId" type="hidden" value={accommodation.accommodation_id} /> : null}
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#0A6B62]">Accommodation editor</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{isEditing ? "แก้ไขข้อมูลที่พัก" : "สร้างข้อมูลที่พัก"}</h2>
          <p className="mt-1 text-sm text-slate-600">แก้ไขเนื้อหาเป็นส่วน ๆ และตรวจตัวอย่างก่อนบันทึก</p>
        </div>
        {isEditing ? <div className="flex flex-wrap gap-2">
          {isPubliclyAvailable ? <Link href={`/accommodations/${accommodation.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">ดูหน้าสาธารณะ<ArrowSquareOut size={15} aria-hidden="true" /></Link> : null}
          <Link
            href={`/admin/accommodations/${accommodation.accommodation_id}/media`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ImageIcon size={18} aria-hidden="true" />
            จัดการคลังรูปภาพ
            <ArrowSquareOut size={15} aria-hidden="true" />
          </Link>
        </div> : null}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <nav aria-label="ส่วนข้อมูลที่พัก" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {SECTIONS.map((section, index) => (
              <button
                key={section.id}
                type="button"
                aria-pressed={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
                className={`min-h-11 shrink-0 rounded-lg border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] sm:min-w-32 ${activeSection === section.id ? "border-[#0A6B62] bg-[#E8F4F1] text-[#073F37]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                <span className="block text-sm font-black">{index + 1}. {section.label}</span>
                <span className="hidden text-xs text-slate-500 sm:block">{section.detail}</span>
              </button>
            ))}
          </nav>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <section aria-labelledby="accommodation-section-basics" hidden={activeSection !== "basics"}>
              <div className="mb-5">
                <h3 id="accommodation-section-basics" className="text-lg font-black text-[#073F37]">ข้อมูลหลัก</h3>
                <p className="mt-1 text-sm text-slate-600">ชื่อและ URL ที่ใช้แสดงและแชร์หน้าที่พัก</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
                  <input className={textFieldClass(fieldError("nameTh"))} aria-invalid={!!fieldError("nameTh")} defaultValue={accommodation?.name_th ?? ""} maxLength={255} name="nameTh" required />
                  {fieldError("nameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("nameTh")}</span> : null}
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
                  <input className={textFieldClass()} defaultValue={accommodation?.name_en ?? ""} maxLength={255} name="nameEn" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
                  <input
                    className={textFieldClass(fieldError("slug"))}
                    aria-invalid={!!fieldError("slug")}
                    defaultValue={accommodation?.slug ?? ""}
                    maxLength={200}
                    name="slug"
                    required
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    placeholder="e.g. cozy-resort-yala"
                    onChange={(event) => {
                      event.target.value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                    }}
                  />
                  {fieldError("slug") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("slug")}</span> : <span className="mt-1 block text-xs text-slate-500">ใช้ตัวอักษรอังกฤษ ตัวเลข และขีดกลาง</span>}
                </label>
              </div>
            </section>

            <section aria-labelledby="accommodation-section-content" hidden={activeSection !== "content"}>
              <div className="mb-5">
                <h3 id="accommodation-section-content" className="text-lg font-black text-[#073F37]">รายละเอียดที่พัก</h3>
                <p className="mt-1 text-sm text-slate-600">เขียนข้อมูลที่ช่วยให้นักท่องเที่ยวเข้าใจลักษณะและบรรยากาศของที่พัก</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">รายละเอียดภาษาไทย</span>
                  <textarea className={`${textFieldClass()} min-h-52 resize-y leading-6`} defaultValue={accommodation?.description_th ?? ""} maxLength={5000} name="descriptionTh" />
                  <span className="mt-1 block text-xs text-slate-500">สูงสุด 5,000 ตัวอักษร</span>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Description in English</span>
                  <textarea className={`${textFieldClass()} min-h-52 resize-y leading-6`} defaultValue={accommodation?.description_en ?? ""} maxLength={5000} name="descriptionEn" />
                  <span className="mt-1 block text-xs text-slate-500">Up to 5,000 characters</span>
                </label>
              </div>
            </section>

            <section aria-labelledby="accommodation-section-location" hidden={activeSection !== "location"}>
              <div className="mb-5">
                <h3 id="accommodation-section-location" className="text-lg font-black text-[#073F37]">ที่ตั้งและข้อมูลติดต่อ</h3>
                <p className="mt-1 text-sm text-slate-600">พิกัดเป็นตัวเลือก แต่ต้องกรอกละติจูดและลองจิจูดเป็นคู่</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">จังหวัด *</span>
                  <select className={textFieldClass(fieldError("provinceId"))} defaultValue={accommodation?.province_id ?? ""} name="provinceId" required>
                    <option value="">เลือกจังหวัด</option>
                    {provinces.map((province) => <option key={province.id} value={province.id}>{province.label}</option>)}
                  </select>
                  {fieldError("provinceId") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("provinceId")}</span> : null}
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">ประเภทที่พัก</span>
                  <select className={textFieldClass()} defaultValue={accommodation?.accommodation_type ?? ""} name="accommodationType">
                    <option value="">ไม่ระบุ</option>
                    <option value="Hotel">Hotel / โรงแรม</option>
                    <option value="Resort">Resort / รีสอร์ท</option>
                    <option value="Homestay">Homestay / โฮมสเตย์</option>
                    <option value="Hostel">Hostel / โฮสเทล</option>
                    <option value="Guesthouse">Guesthouse / เกสต์เฮาส์</option>
                    <option value="Villa">Villa / วิลล่า</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">ช่วงราคา (Price Range)</span>
                  <select className={textFieldClass()} defaultValue={accommodation?.price_range ?? ""} name="priceRange">
                    <option value="">ไม่ระบุ</option>
                    <option value="฿">฿ (ราคาประหยัด)</option>
                    <option value="฿฿">฿฿ (ราคาปานกลาง)</option>
                    <option value="฿฿฿">฿฿฿ (ราคาสูง)</option>
                    <option value="฿฿฿฿">฿฿฿฿ (หรูหรา)</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">ที่อยู่</span>
                  <input className={textFieldClass()} defaultValue={accommodation?.address_text ?? ""} maxLength={1000} name="addressText" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Latitude (ละติจูด)</span>
                  <input aria-invalid={!!fieldError("latitude")} aria-describedby={fieldError("latitude") ? "accommodation-latitude-error" : undefined} className={textFieldClass(fieldError("latitude"))} defaultValue={accommodation?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
                  {fieldError("latitude") ? <span id="accommodation-latitude-error" className="mt-1 block text-xs font-bold text-rose-600">{fieldError("latitude")}</span> : null}
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Longitude (ลองจิจูด)</span>
                  <input aria-invalid={!!fieldError("longitude")} aria-describedby={fieldError("longitude") ? "accommodation-longitude-error" : undefined} className={textFieldClass(fieldError("longitude"))} defaultValue={accommodation?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
                  {fieldError("longitude") ? <span id="accommodation-longitude-error" className="mt-1 block text-xs font-bold text-rose-600">{fieldError("longitude")}</span> : null}
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-700">ข้อมูลการติดต่อ (เบอร์โทร, เว็บไซต์)</span>
                  <input className={textFieldClass()} defaultValue={accommodation?.contact_info ?? ""} maxLength={255} name="contactInfo" placeholder="เช่น เบอร์โทร หรือเว็บไซต์" />
                </label>
              </div>
            </section>

            <section aria-labelledby="accommodation-section-publishing" hidden={activeSection !== "publishing"}>
              <div className="mb-5">
                <h3 id="accommodation-section-publishing" className="text-lg font-black text-[#073F37]">ภาพปกและการเผยแพร่</h3>
                <p className="mt-1 text-sm text-slate-600">ตั้งค่าภาพหลักและสถานะที่จะแสดงต่อสาธารณะ</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div>
                  <span className="text-sm font-bold text-slate-700">รูปภาพปก (Cover Image)</span>
                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <div className="aspect-[16/9] bg-slate-100">
                      {coverPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverPreviewUrl} alt={`ภาพปกตัวอย่าง: ${previewName}`} className="h-full w-full object-cover" />
                      ) : <div className="flex h-full items-center justify-center px-4 text-center text-sm font-bold text-slate-500">ยังไม่ได้เลือกรูปภาพปก</div>}
                    </div>
                    <div className="flex flex-col gap-2 p-3 sm:flex-row">
                      <button type="button" onClick={() => setIsPickerOpen(true)} className="min-h-11 flex-1 rounded-lg bg-[#073F37] px-3 py-2 text-sm font-black text-white hover:bg-[#0A6B62]">เลือกจากคลังสื่อ</button>
                      {coverPreviewUrl ? <button type="button" onClick={() => { setCoverPreviewUrl(""); setCoverMediaId(null); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">นำภาพปกออก</button> : null}
                    </div>
                  </div>
                  <input type="hidden" name="coverMediaId" value={coverMediaId ?? ""} />
                  <input type="hidden" name="coverMediaUrl" value={coverPreviewUrl} />
                  {fieldError("coverMediaId") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("coverMediaId")}</span> : null}
                  {isEditing ? <Link href={`/admin/accommodations/${accommodation.accommodation_id}/media`} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#0A6B62] hover:underline"><ImageIcon size={17} aria-hidden="true" />คลังรูปภาพและแกลเลอรี<ArrowSquareOut size={14} aria-hidden="true" /></Link> : null}
                </div>
                <div className="space-y-3">
                  <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
                    <span>เปิดใช้งาน (Active)</span>
                    <input defaultChecked={accommodation?.is_active ?? true} name="isActive" type="checkbox" value="true" className="h-5 w-5 accent-teal-600" />
                  </label>
                  <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
                    <span>เผยแพร่ (Published)</span>
                    <input defaultChecked={accommodation?.is_published ?? false} name="isPublished" type="checkbox" value="true" className="h-5 w-5 accent-[#F3704C]" />
                  </label>
                  <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">รายการตรวจความพร้อมเป็นคำแนะนำสำหรับผู้ดูแล ไม่ได้เปลี่ยนกฎการเผยแพร่หรือการบันทึกฝั่งเซิร์ฟเวอร์</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <section aria-label="ตัวอย่างหน้าที่พักสาธารณะ" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-black text-slate-900">ตัวอย่างหน้าที่พักสาธารณะ</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${draft.isPublished ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{draft.isPublished ? "เผยแพร่" : "ฉบับร่าง"}</span>
            </div>
            <div className="aspect-[16/9] bg-slate-100">
              {coverPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreviewUrl} alt={previewName} className="h-full w-full object-cover" />
              ) : <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm font-semibold text-slate-500"><ImageIcon size={24} aria-hidden="true" /><span>ตัวอย่างภาพปกจะแสดงที่นี่</span></div>}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="text-xs font-bold text-[#0A6B62]">{draft.accommodationType || "ที่พัก"}</p>
                <h4 className="mt-1 break-words text-lg font-black leading-6 text-slate-900">{previewName}</h4>
                {draft.nameEn.trim() ? <p className="mt-0.5 break-words text-sm text-slate-500">{draft.nameEn}</p> : null}
              </div>
              <p className="flex items-start gap-2 text-sm text-slate-600"><MapPin size={17} className="mt-0.5 shrink-0 text-[#0A6B62]" />{provinceLabel}{draft.addressText.trim() ? ` · ${draft.addressText}` : ""}</p>
              {draft.priceRange ? <p className="text-sm font-bold text-slate-700">ช่วงราคา {draft.priceRange}</p> : null}
              <p className="line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">{draft.descriptionTh.trim() || draft.descriptionEn.trim() || "เพิ่มรายละเอียดเพื่อแสดงข้อมูลที่พักแก่นักท่องเที่ยว"}</p>
              {draft.slug ? <p className="break-all border-t border-slate-100 pt-3 text-xs text-slate-500">/accommodations/{draft.slug}</p> : null}
            </div>
          </section>

          <AdminReadinessPanel
            title="ความพร้อมของเนื้อหา"
            items={readiness}
          />
          <p aria-live="polite" className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            {completeReadinessCount === readiness.length ? <CheckCircle size={16} className="text-emerald-700" weight="fill" /> : <WarningCircle size={16} className="text-amber-600" weight="fill" />}
            {completeReadinessCount === readiness.length ? "ข้อมูลหลักพร้อมสำหรับตรวจทาน" : `เติมข้อมูลที่ขาดอีก ${readiness.length - completeReadinessCount} รายการ`}
          </p>
        </aside>
      </div>

      <AdminSaveBar cancelHref="/admin/accommodations" isPending={isPending} submitLabel={submitLabel} />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const id = Number(asset.id);
          setCoverMediaId(Number.isNaN(id) ? asset.id : id);
          setCoverPreviewUrl(asset.url);
        }}
        onSelect={() => {}}
        title="เลือกรูปภาพที่พัก"
      />
    </form>
  );
}

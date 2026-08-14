"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAttractionSectionAction } from "@/app/actions/admin-attraction-actions";
import { AdminFormErrorSummary, AdminSaveBar, type AdminFormActionState } from "@/components/admin/forms/AdminFormUX";
import { FormRichText } from "@/components/admin/forms/FormRichText";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import type { AdminSelectOption } from "@/components/admin/attractions/types";
import { AttractionCategoryPicker } from "@/components/admin/attractions/AttractionCategoryPicker";
import type { AttractionTypeAssignment } from "@/lib/repositories/attraction-category.repository";
import type { AttractionEditSection } from "@/lib/validation/admin-attraction";

type AdminDistrictOption = AdminSelectOption & {
  provinceId: number;
};

type SectionFormProps = {
  attraction: AdminAttractionRow;
  onClose: () => void;
};

const inputClass = "mt-2 min-h-11 w-full rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm";
const textareaClass = "mt-2 w-full rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/15 sm:text-sm";
const helpClass = "mt-1 text-xs leading-5 text-slate-500";

function useAttractionSectionAction(
  attraction: AdminAttractionRow,
  section: AttractionEditSection,
  onClose: () => void,
) {
  const router = useRouter();
  const action = updateAttractionSectionAction.bind(null, attraction.attraction_id, section);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number }>, FormData>(action, { success: false });

  useEffect(() => {
    if (!state?.success) return;
    router.refresh();
    onClose();
  }, [state?.success, onClose, router]);

  return { state, formAction, isPending };
}

export function HeaderForm({ attraction, onClose }: SectionFormProps) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, "header", onClose);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="grid gap-5">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย (Thai Name) *</span>
          <input className={inputClass} defaultValue={attraction.name_th} maxLength={255} name="nameTh" required />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ (English Name)</span>
          <input className={inputClass} defaultValue={attraction.name_en ?? ""} maxLength={255} name="nameEn" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ลิงก์ URL (Slug) *</span>
          <input className={inputClass} defaultValue={attraction.slug} maxLength={200} name="slug" required />
          <p className={helpClass}>
            ใช้ตัวอักษรอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น เช่น `aiyerweng-skywalk`<br/>
            Slug นี้คือ URL สาธารณะ `/attractions/{attraction.slug || "your-slug"}`
          </p>
        </label>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกข้อมูล" />
    </form>
  );
}

export function ContentForm({ attraction, onClose }: SectionFormProps) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, "content", onClose);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="space-y-8">
        <div className="space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-800">เนื้อหาภาษาไทย</h3>
            <p className={helpClass}>ภาพรวมและประวัติจะแสดงเป็นคนละส่วนบนหน้าสาธารณะ เพื่อให้ผู้อ่านค้นหาข้อมูลได้ง่าย</p>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">คำอธิบายสั้น (Short Description)</span>
            <textarea className={`${textareaClass} min-h-[96px]`} defaultValue={attraction.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" />
          </label>
          <FormRichText imageLayoutControls label="ภาพรวมสถานที่" name="descriptionTh" defaultValue={attraction.description_th ?? ""} minHeight={200} />
          <FormRichText imageLayoutControls label="ประวัติ / เรื่องเล่า" name="historyTh" defaultValue={attraction.history_th ?? ""} minHeight={200} />
          <label className="block">
            <span className="text-sm font-bold text-slate-600">ข้อแนะนำการเดินทาง (Travel Tips)</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.travel_tips_th ?? ""} maxLength={5000} name="travelTipsTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">วิธีการเดินทาง (How to Get There)</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.how_to_get_there_th ?? ""} maxLength={5000} name="howToGetThereTh" />
          </label>
        </div>

        <div className="space-y-5">
          <h3 className="border-b border-slate-200 pb-3 font-bold text-slate-800">เนื้อหาภาษาอังกฤษ (ไม่บังคับ)</h3>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">คำอธิบายสั้น (Short Description)</span>
            <textarea className={`${textareaClass} min-h-[96px]`} defaultValue={attraction.short_description_en ?? ""} maxLength={500} name="shortDescriptionEn" />
          </label>
          <FormRichText imageLayoutControls label="ภาพรวมสถานที่ (Overview)" name="descriptionEn" defaultValue={attraction.description_en ?? ""} minHeight={200} />
          <FormRichText imageLayoutControls label="ประวัติ / เรื่องเล่า (History & Stories)" name="historyEn" defaultValue={attraction.history_en ?? ""} minHeight={200} />
          <label className="block">
            <span className="text-sm font-bold text-slate-600">ข้อแนะนำการเดินทาง (Travel Tips)</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.travel_tips_en ?? ""} maxLength={5000} name="travelTipsEn" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">วิธีการเดินทาง (How to Get There)</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.how_to_get_there_en ?? ""} maxLength={5000} name="howToGetThereEn" />
          </label>
        </div>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกเนื้อหาและเรื่องเล่า" />
    </form>
  );
}

export function LocationForm({ attraction, onClose }: SectionFormProps) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, "location", onClose);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="grid gap-5">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ที่อยู่ / จุดสังเกต (Address)</span>
          <input className={inputClass} defaultValue={attraction.address_text ?? ""} maxLength={1000} name="addressText" />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ละติจูด (Latitude)</span>
            <input className={inputClass} defaultValue={attraction.latitude ?? ""} name="latitude" type="number" step="0.0000001" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ลองจิจูด (Longitude)</span>
            <input className={inputClass} defaultValue={attraction.longitude ?? ""} name="longitude" type="number" step="0.0000001" />
          </label>
        </div>
        <p className={helpClass}>
          พิกัดช่วยให้ผู้ใช้ดูแผนที่ นำทาง และเช็คอินผ่าน QR ได้แม่นยำขึ้น โปรดใช้ค่า Decimal Degrees จาก Google Maps
        </p>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ (Opening Hours)</span>
          <input className={inputClass} defaultValue={attraction.opening_hours ?? ""} maxLength={255} name="openingHours" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ข้อมูลติดต่อ (Contact Info)</span>
          <input className={inputClass} defaultValue={attraction.contact_info ?? ""} maxLength={255} name="contactInfo" />
        </label>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกพิกัด" />
    </form>
  );
}

export function SettingsForm({
  attraction,
  provinces,
  districts,
  attractionTypes,
  categoryAssignments,
  onClose,
}: {
  attraction: AdminAttractionRow;
  provinces: AdminSelectOption[];
  districts: AdminDistrictOption[];
  attractionTypes: AdminSelectOption[];
  categoryAssignments: AttractionTypeAssignment[];
  onClose: () => void;
}) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, "settings", onClose);
  const [selectedProvinceId, setSelectedProvinceId] = useState(attraction.province_id);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | "">(attraction.district_id ?? "");
  const filteredDistricts = useMemo(
    () => districts.filter((district) => district.provinceId === Number(selectedProvinceId)),
    [districts, selectedProvinceId]
  );

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="grid gap-6">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700">
            เปิดใช้งาน (Active)
            <input defaultChecked={attraction.is_active} name="isActive" type="checkbox" value="true" className="h-4 w-4" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700">
            เผยแพร่สู่สาธารณะ (Published)
            <input defaultChecked={attraction.is_published} name="isPublished" type="checkbox" value="true" className="h-4 w-4" />
          </label>
          <p className={helpClass}>
            เก็บเนื้อหาที่ไม่สมบูรณ์ไว้เป็นแบบร่างเสมอ <br/>
            - <strong>Active</strong> ใช้สำหรับการควบคุมระบบภายใน (เพิ่มเช็คอิน)<br/>
            - <strong>Published</strong> ใช้สำหรับแสดงผลให้บุคคลทั่วไปเข้าชมทางหน้าเว็บ
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัด (Province) *</span>
            <select
              className={inputClass}
              value={selectedProvinceId ?? ""}
              onChange={(event) => {
                const nextProvinceId = Number(event.target.value);
                setSelectedProvinceId(nextProvinceId);
                if (!districts.some((district) => district.id === selectedDistrictId && district.provinceId === nextProvinceId)) {
                  setSelectedDistrictId("");
                }
              }}
              name="provinceId"
              required
            >
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>{province.label}</option>
              ))}
            </select>
            <p className={helpClass}>
              จังหวัดส่งผลต่อตัวกรอง (Filters), การแนะนำสถานที่ใกล้เคียง และข้อมูล Dashboard
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">อำเภอ (District)</span>
            <select
              className={inputClass}
              value={selectedDistrictId}
              onChange={(event) => setSelectedDistrictId(event.target.value ? Number(event.target.value) : "")}
              name="districtId"
            >
              <option value="">ไม่ระบุ (Not specified)</option>
              {filteredDistricts.map((district) => (
                <option key={district.id} value={district.id}>{district.label}</option>
              ))}
            </select>
            <p className={helpClass}>
              กรุณาระบุอำเภอหากทราบ เพื่อช่วยในการกรองและทำสถิติ หากไม่ทราบให้เว้นว่างไว้ก่อน
            </p>
          </label>

          <AttractionCategoryPicker
            categories={attractionTypes}
            selectedCategoryIds={categoryAssignments.map((category) => category.attractionTypeId)}
            primaryCategoryId={categoryAssignments.find((category) => category.isPrimary)?.attractionTypeId ?? attraction.attraction_type_id}
            error={state?.fieldErrors?.primaryAttractionTypeId?.[0] ?? state?.fieldErrors?.attractionTypeIds?.[0]}
          />

          <label className="block">
            <span className="text-sm font-bold text-slate-700">หมวดหมู่ความยั่งยืน (Sustainability Category)</span>
            <select className={inputClass} defaultValue={attraction.sustainability_category ?? ""} name="sustainabilityCategory">
              <option value="">ไม่ระบุ (None)</option>
              <option value="eco">Eco-tourism (เชิงนิเวศ)</option>
              <option value="community">Community-based (อิงชุมชน)</option>
              <option value="heritage">Heritage & Culture (มรดกและวัฒนธรรม)</option>
            </select>
            <p className={helpClass}>ใช้สำหรับแสดงตราสัญลักษณ์พิเศษและเก็บสถิติ</p>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">ความจุผู้เข้าชมต่อวัน (Daily Capacity)</span>
            <input className={inputClass} defaultValue={attraction.estimated_capacity_per_day ?? ""} name="estimatedCapacityPerDay" type="number" min="1" placeholder="เช่น 500" />
            <p className={helpClass}>ใช้สำหรับวางแผนลดความหนาแน่นในจุดต่างๆ ของ Dashboard</p>
          </label>
        </div>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกการตั้งค่า" />
    </form>
  );
}

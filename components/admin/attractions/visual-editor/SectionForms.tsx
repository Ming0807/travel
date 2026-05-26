"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateAttractionAction } from "@/app/actions/admin-attraction-actions";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { HiddenAttractionFields } from "./HiddenAttractionFields";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";
import type { AdminSelectOption } from "@/components/admin/attractions/AttractionForm";

type AdminDistrictOption = AdminSelectOption & {
  provinceId: number;
};

type SectionFormProps = {
  attraction: AdminAttractionRow;
  onClose: () => void;
};

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15";
const textareaClass = "mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15";
const helpClass = "mt-1 text-xs leading-5 text-slate-500";

function useAttractionSectionAction(attraction: AdminAttractionRow, onClose: () => void) {
  const action = updateAttractionAction.bind(null, attraction.attraction_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, { success: false });

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return { state, formAction, isPending };
}

export function HeaderForm({ attraction, onClose }: SectionFormProps) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, onClose);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <HiddenAttractionFields attraction={attraction} exclude={["nameTh", "nameEn", "slug"]} />
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="grid gap-5">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ชื่อภาษาไทย *</span>
          <input className={inputClass} defaultValue={attraction.name_th} maxLength={255} name="nameTh" required />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ชื่อภาษาอังกฤษ</span>
          <input className={inputClass} defaultValue={attraction.name_en ?? ""} maxLength={255} name="nameEn" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Slug สำหรับ URL *</span>
          <input className={inputClass} defaultValue={attraction.slug} maxLength={200} name="slug" required />
          <p className={helpClass}>
            ใช้ตัวอักษรอังกฤษตัวเล็ก ตัวเลข และขีดกลางเท่านั้น เช่น `aiyerweng-skywalk`.
            Slug นี้คือ URL สาธารณะ `/attractions/{attraction.slug || "your-slug"}`.
          </p>
        </label>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกข้อมูล" />
    </form>
  );
}

export function ContentForm({ attraction, onClose }: SectionFormProps) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, onClose);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <HiddenAttractionFields
        attraction={attraction}
        exclude={[
          "shortDescriptionTh",
          "shortDescriptionEn",
          "descriptionTh",
          "descriptionEn",
          "historyTh",
          "historyEn",
          "travelTipsTh",
          "travelTipsEn",
          "howToGetThereTh",
          "howToGetThereEn",
        ]}
      />
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="space-y-8">
        <div className="space-y-5">
          <h3 className="border-b border-slate-100 pb-2 font-bold text-slate-800">เนื้อหาภาษาไทย</h3>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">คำอธิบายสั้น</span>
            <textarea className={`${textareaClass} min-h-[96px]`} defaultValue={attraction.short_description_th ?? ""} maxLength={500} name="shortDescriptionTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">รายละเอียด</span>
            <textarea className={`${textareaClass} min-h-[150px]`} defaultValue={attraction.description_th ?? ""} maxLength={4000} name="descriptionTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">ประวัติ / เรื่องเล่า</span>
            <textarea className={`${textareaClass} min-h-[140px]`} defaultValue={attraction.history_th ?? ""} maxLength={4000} name="historyTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">ข้อแนะนำการเดินทาง</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.travel_tips_th ?? ""} maxLength={5000} name="travelTipsTh" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">วิธีการเดินทาง</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.how_to_get_there_th ?? ""} maxLength={5000} name="howToGetThereTh" />
          </label>
        </div>

        <div className="space-y-5">
          <h3 className="border-b border-slate-100 pb-2 font-bold text-slate-800">English Content</h3>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">Short Description</span>
            <textarea className={`${textareaClass} min-h-[96px]`} defaultValue={attraction.short_description_en ?? ""} maxLength={500} name="shortDescriptionEn" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">Full Description</span>
            <textarea className={`${textareaClass} min-h-[150px]`} defaultValue={attraction.description_en ?? ""} maxLength={4000} name="descriptionEn" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">History / Storytelling</span>
            <textarea className={`${textareaClass} min-h-[140px]`} defaultValue={attraction.history_en ?? ""} maxLength={4000} name="historyEn" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">Travel Tips</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.travel_tips_en ?? ""} maxLength={5000} name="travelTipsEn" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">How to Get There</span>
            <textarea className={`${textareaClass} min-h-[110px]`} defaultValue={attraction.how_to_get_there_en ?? ""} maxLength={5000} name="howToGetThereEn" />
          </label>
        </div>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกเนื้อหา" />
    </form>
  );
}

export function LocationForm({ attraction, onClose }: SectionFormProps) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, onClose);

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <HiddenAttractionFields attraction={attraction} exclude={["addressText", "latitude", "longitude", "openingHours", "contactInfo"]} />
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="grid gap-5">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ที่อยู่ / จุดสังเกต</span>
          <input className={inputClass} defaultValue={attraction.address_text ?? ""} maxLength={1000} name="addressText" />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Latitude</span>
            <input className={inputClass} defaultValue={attraction.latitude ?? ""} name="latitude" type="number" step="0.0000001" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Longitude</span>
            <input className={inputClass} defaultValue={attraction.longitude ?? ""} name="longitude" type="number" step="0.0000001" />
          </label>
        </div>
        <p className={helpClass}>
          Coordinates help maps, QR landing context, and future route planning. Use decimal degrees from a verified map source.
        </p>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">เวลาเปิดทำการ</span>
          <input className={inputClass} defaultValue={attraction.opening_hours ?? ""} maxLength={255} name="openingHours" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ข้อมูลการติดต่อ</span>
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
  onClose,
}: {
  attraction: AdminAttractionRow;
  provinces: AdminSelectOption[];
  districts: AdminDistrictOption[];
  attractionTypes: AdminSelectOption[];
  onClose: () => void;
}) {
  const { state, formAction, isPending } = useAttractionSectionAction(attraction, onClose);
  const [selectedProvinceId, setSelectedProvinceId] = useState(attraction.province_id);
  const filteredDistricts = useMemo(
    () => districts.filter((district) => district.provinceId === Number(selectedProvinceId)),
    [districts, selectedProvinceId]
  );

  return (
    <form action={formAction} className="space-y-6 pb-20">
      <HiddenAttractionFields
        attraction={attraction}
        exclude={["isActive", "isPublished", "attractionTypeId", "provinceId", "districtId", "sustainabilityCategory", "estimatedCapacityPerDay"]}
      />
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

      <div className="grid gap-6">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700">
            Active
            <input defaultChecked={attraction.is_active} name="isActive" type="checkbox" value="true" className="h-4 w-4" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700">
            Published
            <input defaultChecked={attraction.is_published} name="isPublished" type="checkbox" value="true" className="h-4 w-4" />
          </label>
          <p className={helpClass}>
            Keep draft attractions unpublished until content, media, and QR readiness are checked. Active controls admin/tourism operations; Published controls public visibility.
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Province *</span>
            <select
              className={inputClass}
              value={selectedProvinceId ?? ""}
              onChange={(event) => setSelectedProvinceId(Number(event.target.value))}
              name="provinceId"
              required
            >
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>{province.label}</option>
              ))}
            </select>
            <p className={helpClass}>
              Province controls public filters, homepage grouping, dashboard province analysis, and related content suggestions.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">District</span>
            <select className={inputClass} defaultValue={attraction.district_id ?? ""} name="districtId">
              <option value="">Not specified</option>
              {filteredDistricts.map((district) => (
                <option key={district.id} value={district.id}>{district.label}</option>
              ))}
            </select>
            <p className={helpClass}>
              Choose a district when known. It improves local filtering and reporting, but leave it blank if the source is not verified.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Attraction category</span>
            <select className={inputClass} defaultValue={attraction.attraction_type_id ?? ""} name="attractionTypeId">
              <option value="">Not specified</option>
              {attractionTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Sustainability category</span>
            <select className={inputClass} defaultValue={attraction.sustainability_category ?? ""} name="sustainabilityCategory">
              <option value="">Not specified</option>
              <option value="Nature Conservation">Nature Conservation</option>
              <option value="Community Based">Community Based</option>
              <option value="Cultural Heritage">Cultural Heritage</option>
              <option value="Health & Wellness">Health & Wellness</option>
            </select>
            <p className={helpClass}>
              Use this for sustainable tourism planning and dashboard segmentation. Pick the closest primary value, not every possible theme.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Estimated capacity per day</span>
            <input className={inputClass} defaultValue={attraction.estimated_capacity_per_day ?? ""} name="estimatedCapacityPerDay" type="number" min="1" placeholder="เช่น 500" />
            <p className={helpClass}>
              Estimate daily visitor capacity for planning pressure, staffing, and sustainable tourism indicators. Leave blank if unknown.
            </p>
          </label>
        </div>
      </div>

      <AdminSaveBar onCancel={onClose} isPending={isPending} submitLabel="บันทึกการตั้งค่า" />
    </form>
  );
}

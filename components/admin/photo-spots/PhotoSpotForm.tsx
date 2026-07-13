"use client";

import { useActionState, useMemo, useState } from "react";
import { createPhotoSpotAction, updatePhotoSpotAction } from "@/app/actions/admin-photo-spot-actions";
import { AdminPhotoSpotRow } from "@/lib/repositories/photo-spot.repository";
import { ArrowLeft, FileText, ImageSquare, List, MapPinLine, QrCode } from "@phosphor-icons/react";
import { AdminSelectOption } from "@/components/admin/attractions/AttractionForm";
import {
  AdminFormErrorSummary,
  AdminFormSection,
  AdminHelpPanel,
  AdminReadinessPanel,
  AdminSaveBar,
} from "@/components/admin/forms/AdminFormUX";
import { FormInput, FormTextarea, FormCheckbox, getFieldError } from "@/components/admin/forms/FormField";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";

interface PhotoSpotFormProps {
  photoSpot?: AdminPhotoSpotRow;
  attractions: AdminSelectOption[];
  submitLabel?: string;
  defaultAttractionId?: number | null;
}

const FIELD_LABELS = {
  attractionId: "แหล่งท่องเที่ยว",
  spotNameTh: "ชื่อจุดถ่ายภาพ",
  latitude: "Latitude",
  longitude: "Longitude",
  displayOrder: "ลำดับการแสดงผล",
};

type PhotoSpotFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: AdminPhotoSpotRow;
};

function getInitialAttractionId(attractions: AdminSelectOption[], defaultAttractionId?: number | null) {
  if (defaultAttractionId && attractions.some((attraction) => attraction.id === defaultAttractionId)) {
    return defaultAttractionId;
  }
  return attractions[0]?.id ?? "";
}

export function PhotoSpotForm({
  photoSpot,
  attractions,
  submitLabel = "บันทึกข้อมูล",
  defaultAttractionId,
}: PhotoSpotFormProps) {
  const isEditing = !!photoSpot;
  const action = isEditing ? updatePhotoSpotAction.bind(null, photoSpot.photo_spot_id) : createPhotoSpotAction;
  const initialAttractionId = photoSpot?.attraction_id ?? getInitialAttractionId(attractions, defaultAttractionId);
  const [selectedAttractionId, setSelectedAttractionId] = useState<number | "">(initialAttractionId);
  const [spotNameTh, setSpotNameTh] = useState(photoSpot?.spot_name_th ?? "");
  const [isActive, setIsActive] = useState(photoSpot?.is_active ?? true);

  const [state, formAction, isPending] = useActionState<PhotoSpotFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const fe = (name: string) => getFieldError(state?.fieldErrors, name);

  const selectedAttraction = useMemo(
    () => attractions.find((attraction) => attraction.id === Number(selectedAttractionId)),
    [attractions, selectedAttractionId]
  );

  if (state?.success) {
    const savedPhotoSpot = state.data ?? photoSpot;
    const attractionId = savedPhotoSpot?.attraction_id ?? selectedAttractionId;
    const photoSpotId = savedPhotoSpot?.photo_spot_id ?? photoSpot?.photo_spot_id;
    const photoSpotLabel = savedPhotoSpot?.spot_name_th ?? spotNameTh;

    return (
      <SuccessNextSteps
        title={isEditing ? "อัปเดตจุดถ่ายภาพสำเร็จ" : "สร้างจุดถ่ายภาพสำเร็จ"}
        description={`${photoSpotLabel || "จุดถ่ายภาพนี้"} เชื่อมโยงกับ ${selectedAttraction?.label || "สถานที่ที่เลือก"} แล้ว ขั้นตอนต่อไปคือสร้างหรือทดสอบ QR เช็คอินสำหรับนักท่องเที่ยว`}
        actions={[
          {
            label: "สร้าง QR Code เช็คอิน",
            href: `/admin/checkin-codes/new?attraction_id=${attractionId}${photoSpotId ? `&photo_spot_id=${photoSpotId}` : ""}`,
            icon: QrCode,
            primary: true,
          },
          {
            label: "จัดการรูปภาพสถานที่",
            href: `/admin/attractions/${attractionId}/media`,
            icon: ImageSquare,
          },
          {
            label: "กลับไปที่สถานที่",
            href: `/admin/attractions/${attractionId}/edit`,
            icon: ArrowLeft,
          },
          {
            label: "ดูรายการจุดถ่ายภาพ",
            href: "/admin/photo-spots",
            icon: List,
          },
        ]}
      />
    );
  }

  const readiness = [
    {
      label: "Attraction selected",
      complete: !!selectedAttractionId,
      help: "The QR landing and certificate context need the source attraction.",
    },
    {
      label: "Photo spot has a clear Thai name",
      complete: spotNameTh.trim().length > 0,
      help: "This name helps staff match the printed QR to the real location.",
    },
    {
      label: "Ready for QR setup",
      complete: !!selectedAttractionId && spotNameTh.trim().length > 0 && isActive,
      help: "Create the check-in code after saving this active photo spot.",
    },
  ];

  return (
    <form action={formAction} className="space-y-8">
      {photoSpot?.photo_spot_id ? <input name="photoSpotId" type="hidden" value={photoSpot.photo_spot_id} /> : null}

      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column (Main Content) */}
        <div className="space-y-8 lg:col-span-7">
          <AdminFormSection title="ข้อมูลหลัก (Basic Info)" icon={FileText}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">แหล่งท่องเที่ยว *</span>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                    value={selectedAttractionId}
                    onChange={(event) => setSelectedAttractionId(event.target.value === "" ? "" : Number(event.target.value))}
                    name="attractionId"
                    required
                  >
                    <option value="">เลือกแหล่งท่องเที่ยว</option>
                    {attractions.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                  {fe("attractionId") ? <p className="mt-1 text-xs font-bold text-rose-600">{fe("attractionId")}</p> : null}
                </label>
              </div>

              <FormInput
                label="ชื่อจุดถ่ายภาพ (TH)"
                value={spotNameTh}
                onChange={(event) => setSpotNameTh(event.target.value)}
                maxLength={255}
                name="spotNameTh"
                required
                error={fe("spotNameTh")}
                className="md:col-span-2"
              />

              <FormInput
                label="ชื่อจุดถ่ายภาพ (EN)"
                defaultValue={photoSpot?.spot_name_en ?? ""}
                maxLength={255}
                name="spotNameEn"
                className="md:col-span-2"
              />

              <FormTextarea
                label="รายละเอียด (TH)"
                defaultValue={photoSpot?.description_th ?? ""}
                name="descriptionTh"
                className="md:col-span-2"
              />

              <FormTextarea
                label="รายละเอียด (EN)"
                defaultValue={photoSpot?.description_en ?? ""}
                name="descriptionEn"
                className="md:col-span-2"
              />
            </div>
          </AdminFormSection>
        </div>

        {/* Right Column */}
        <div className="space-y-8 lg:sticky lg:top-8 lg:col-span-5 lg:self-start">
          <AdminFormSection title="สถานะ (Status)" icon={QrCode}>
            <div className="flex flex-col gap-3">
              <FormCheckbox
                label="เปิดใช้งาน (Active)"
                name="isActive"
                checked={isActive}
                onChange={setIsActive}
                accent="teal"
              />

              <div className="mt-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">ลำดับการแสดงผล</span>
                  <input
                    type="number"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                    defaultValue={photoSpot?.display_order ?? ""}
                    name="displayOrder"
                  />
                </label>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="พิกัด (Location)" icon={MapPinLine}>
            <div className="grid gap-5">
              <FormInput
                label="Latitude"
                defaultValue={photoSpot?.latitude ?? ""}
                name="latitude"
                type="number"
                step="0.0000001"
                placeholder="เช่น 6.5233"
                error={fe("latitude")}
              />
              <FormInput
                label="Longitude"
                defaultValue={photoSpot?.longitude ?? ""}
                name="longitude"
                type="number"
                step="0.0000001"
                placeholder="เช่น 101.281"
                error={fe("longitude")}
              />
              <FormInput
                label="รูปภาพตัวอย่าง (URL)"
                defaultValue={photoSpot?.sample_image_path ?? ""}
                name="sampleImagePath"
                placeholder="https://..."
              />
            </div>
          </AdminFormSection>

          <AdminReadinessPanel title="ความพร้อมจุดถ่ายภาพ" items={readiness} />

          <AdminHelpPanel title="ขั้นตอนการดำเนินงาน" tone="info">
            <div className="space-y-2">
              <p>จุดถ่ายภาพ → รหัสเช็คอิน → หน้า QR → ใบประกาศนียบัตร</p>
              <p>
                ใช้ QR เดียวต่อจุดถ่ายภาพ ระบบจะตรวจจับผู้ใช้ LINE ภาษา และบริบทการเยี่ยมชมโดยอัตโนมัติ
              </p>
            </div>
          </AdminHelpPanel>

          <AdminHelpPanel title="หลังจากบันทึก" tone="success">
            <ul className="list-disc space-y-1 pl-5">
              <li>สร้างรหัสเช็คอินสำหรับจุดนี้</li>
              <li>ทดสอบ /c/[code] ก่อนพิมพ์ QR</li>
              <li>ตรวจสอบรูปภาพของสถานที่เพื่อให้หน้าเช็คอินสมบูรณ์</li>
            </ul>
          </AdminHelpPanel>
        </div>
      </div>

      <AdminSaveBar cancelHref="/admin/photo-spots" isPending={isPending} submitLabel={submitLabel} />
    </form>
  );
}

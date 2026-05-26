"use client";

import { useActionState, useMemo, useState } from "react";
import { createPhotoSpotAction, updatePhotoSpotAction } from "@/lib/actions/admin-photo-spots.actions";
import { AdminPhotoSpotRow } from "@/lib/repositories/photo-spot.repository";
import { ArrowLeft, FileText, ImageSquare, List, MapPinLine, QrCode } from "@phosphor-icons/react";
import { AdminSelectOption } from "@/components/admin/attractions/AttractionForm";
import {
  AdminFormErrorSummary,
  AdminHelpPanel,
  AdminReadinessPanel,
  AdminSaveBar,
} from "@/components/admin/forms/AdminFormUX";
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

  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

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
        title={isEditing ? "Photo spot updated" : "Photo spot created"}
        description={`${photoSpotLabel || "This photo spot"} is now linked to ${selectedAttraction?.label || "the selected attraction"}. Next, create or test the QR entry point that opens the tourist certificate flow.`}
        actions={[
          {
            label: "Create QR check-in code",
            href: `/admin/checkin-codes/new?attraction_id=${attractionId}${photoSpotId ? `&photo_spot_id=${photoSpotId}` : ""}`,
            icon: QrCode,
            primary: true,
          },
          {
            label: "Manage attraction media",
            href: `/admin/attractions/${attractionId}/media`,
            icon: ImageSquare,
          },
          {
            label: "Return to attraction",
            href: `/admin/attractions/${attractionId}/edit`,
            icon: ArrowLeft,
          },
          {
            label: "View photo spots",
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

  function fieldError(name: string) {
    return state?.fieldErrors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="space-y-8">
      {photoSpot?.photo_spot_id ? <input name="photoSpotId" type="hidden" value={photoSpot.photo_spot_id} /> : null}

      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-7 space-y-8">
          
          <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText size={20} className="text-ink" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">ข้อมูลหลัก (Basic Info)</h2>
              </div>
            </div>
            <div className="p-6 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">แหล่งท่องเที่ยว *</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
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
                {fieldError("attractionId") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("attractionId")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อจุดถ่ายภาพ (TH) *</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  value={spotNameTh}
                  onChange={(event) => setSpotNameTh(event.target.value)}
                  maxLength={255}
                  name="spotNameTh"
                  required
                />
                {fieldError("spotNameTh") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("spotNameTh")}</span> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">ชื่อจุดถ่ายภาพ (EN)</span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={photoSpot?.spot_name_en ?? ""}
                  maxLength={255}
                  name="spotNameEn"
                />
              </label>
              
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">รายละเอียด (TH)</span>
                <textarea
                  className="mt-2 w-full min-h-[100px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={photoSpot?.description_th ?? ""}
                  name="descriptionTh"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">รายละเอียด (EN)</span>
                <textarea
                  className="mt-2 w-full min-h-[100px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  defaultValue={photoSpot?.description_en ?? ""}
                  name="descriptionEn"
                />
              </label>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 lg:h-max lg:self-start">
          
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
                <input
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  name="isActive"
                  type="checkbox"
                  value="true"
                  className="h-4 w-4 accent-teal"
                />
              </label>
              
              <label className="block mt-4">
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">ลำดับการแสดงผล</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all"
                  defaultValue={photoSpot?.display_order ?? ""}
                  name="displayOrder"
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPinLine size={20} className="text-ink" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">พิกัดตัวอย่าง (Location)</h2>
              </div>
            </div>
            <div className="p-6 grid gap-5">
              <label className="block">
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">Latitude</span>
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={photoSpot?.latitude ?? ""} name="latitude" type="number" step="0.0000001" placeholder="เช่น 6.5233" />
                {fieldError("latitude") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("latitude")}</span> : null}
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">Longitude</span>
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={photoSpot?.longitude ?? ""} name="longitude" type="number" step="0.0000001" placeholder="เช่น 101.281" />
                {fieldError("longitude") ? <span className="mt-1 block text-xs font-bold text-rose-600">{fieldError("longitude")}</span> : null}
              </label>
              
              <label className="block">
                <span className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider block">รูปภาพตัวอย่าง (URL)</span>
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/10 transition-all" defaultValue={photoSpot?.sample_image_path ?? ""} name="sampleImagePath" placeholder="https://..." />
              </label>
            </div>
          </section>

          <AdminReadinessPanel title="Photo spot readiness" items={readiness} />

          <AdminHelpPanel title="Operational flow" tone="info">
            <div className="space-y-2">
              <p>Photo Spot -&gt; Check-in Code -&gt; QR Landing -&gt; Certificate Context.</p>
              <p>
                Use one neutral QR per physical point. The tourist page detects guest, LINE, language, and visit context after
                opening.
              </p>
            </div>
          </AdminHelpPanel>

          <AdminHelpPanel title="After saving" tone="success">
            <ul className="list-disc space-y-1 pl-5">
              <li>Create a check-in code for this point.</li>
              <li>Open and test /c/[code] before printing the QR.</li>
              <li>Check attraction media so the landing and certificate context feel complete.</li>
            </ul>
          </AdminHelpPanel>

        </div>
      </div>

      <AdminSaveBar cancelHref="/admin/photo-spots" isPending={isPending} submitLabel={submitLabel} />
    </form>
  );
}

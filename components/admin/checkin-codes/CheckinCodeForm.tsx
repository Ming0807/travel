"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowSquareOut, Copy, ImageSquare, List, Plus, QrCode } from "@phosphor-icons/react";
import { createCheckinCodeAction, updateCheckinCodeAction } from "@/app/actions/admin-checkin-code-actions";
import type { AdminCheckinCodeRow } from "@/lib/repositories/admin-checkin-code.repository";
import { DownloadQrAction } from "@/components/admin/checkin-codes/DownloadQrAction";
import {
  AdminFormErrorSummary,
  AdminFormSection,
  AdminHelpPanel,
  AdminReadinessPanel,
  AdminSaveBar,
} from "@/components/admin/forms/AdminFormUX";
import { SuccessNextSteps } from "@/components/admin/SuccessNextSteps";

interface CheckinCodeFormProps {
  initialData?: AdminCheckinCodeRow | null;
  attractions: { attraction_id: number; name_th: string; is_active?: boolean | null; is_published?: boolean | null }[];
  photoSpots: { photo_spot_id: number; attraction_id: number; spot_name_th: string }[];
  defaultAttractionId?: number | null;
  defaultPhotoSpotId?: number | null;
}

const FIELD_LABELS = {
  code: "QR code",
  attractionId: "Attraction",
  photoSpotId: "Photo spot",
  label: "Internal label",
  startsAt: "Start date",
  endsAt: "End date",
};

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function toLocalDateTimeInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function getScheduleStatus(isActive: boolean, startsAt: string, endsAt: string) {
  if (!isActive) return { label: "Inactive", help: "The QR landing should not be printed while inactive.", ready: false };

  const now = Date.now();
  const startTime = startsAt ? new Date(startsAt).getTime() : null;
  const endTime = endsAt ? new Date(endsAt).getTime() : null;

  if (startTime && startTime > now) {
    return { label: "Scheduled", help: "The QR will be active after the configured start time.", ready: true };
  }

  if (endTime && endTime <= now) {
    return { label: "Expired", help: "The QR is past its end time and should not be printed.", ready: false };
  }

  return { label: "Active", help: "The QR can be tested and used after saving.", ready: true };
}

export function CheckinCodeForm({
  initialData,
  attractions,
  photoSpots,
  defaultAttractionId,
  defaultPhotoSpotId,
}: CheckinCodeFormProps) {
  const isEditing = !!initialData;
  const action = isEditing ? updateCheckinCodeAction.bind(null, initialData.checkin_code_id) : createCheckinCodeAction;
  const [code, setCode] = useState(initialData?.code ?? "");
  const [selectedAttractionId, setSelectedAttractionId] = useState<number | "">(initialData?.attraction_id ?? defaultAttractionId ?? "");
  const [selectedPhotoSpotId, setSelectedPhotoSpotId] = useState<number | "">(initialData?.photo_spot_id ?? defaultPhotoSpotId ?? "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [startsAt, setStartsAt] = useState(toLocalDateTimeInput(initialData?.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalDateTimeInput(initialData?.ends_at));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const filteredSpots = useMemo(
    () => photoSpots.filter((spot) => spot.attraction_id === Number(selectedAttractionId)),
    [photoSpots, selectedAttractionId]
  );

  const selectedAttraction = useMemo(
    () => attractions.find((attraction) => attraction.attraction_id === Number(selectedAttractionId)),
    [attractions, selectedAttractionId]
  );

  const selectedPhotoSpot = useMemo(
    () => photoSpots.find((spot) => spot.photo_spot_id === Number(selectedPhotoSpotId)),
    [photoSpots, selectedPhotoSpotId]
  );

  useEffect(() => {
    if (selectedPhotoSpotId && !filteredSpots.some((spot) => spot.photo_spot_id === Number(selectedPhotoSpotId))) {
      setSelectedPhotoSpotId("");
    }
  }, [filteredSpots, selectedPhotoSpotId]);

  if (state?.success) {
    const newCode = state.data?.code || code;
    const attractionId = state.data?.attractionId ?? selectedAttractionId;

    return (
      <SuccessNextSteps
        title={isEditing ? "อัปเดตรหัสเช็คอินสำเร็จ" : "สร้างรหัสเช็คอินสำเร็จ"}
        description={`URL สาธารณะ /c/${newCode} พร้อมทดสอบแล้ว กรุณาตรวจสอบว่าหน้าเช็คอินแสดงสถานที่ จุดถ่ายภาพ และบริบทใบประกาศที่ถูกต้องก่อนพิมพ์ QR`}
        actions={[
          { label: "ทดสอบหน้า QR", href: `/c/${newCode}`, primary: true, icon: ArrowSquareOut },
          { label: "จัดการรูปภาพของสถานที่", href: `/admin/attractions/${attractionId}/media`, icon: ImageSquare },
          { label: "กลับไปที่สถานที่", href: `/admin/attractions/${attractionId}/edit`, icon: ArrowLeft },
          { label: "สร้าง QR อีกอัน", href: "/admin/checkin-codes/new", icon: Plus },
          { label: "ดูรายการรหัสเช็คอิน", href: "/admin/checkin-codes", icon: List },
        ]}
      />
    );
  }

  const publicPath = code ? `/c/${code}` : "/c/your-code";
  const scheduleStatus = getScheduleStatus(isActive, startsAt, endsAt);
  const photoSpotMatchesAttraction = !selectedPhotoSpot || selectedPhotoSpot.attraction_id === Number(selectedAttractionId);
  const hasAttractionStatus = typeof selectedAttraction?.is_active === "boolean" || typeof selectedAttraction?.is_published === "boolean";
  const attractionPublicReady = !!selectedAttraction && selectedAttraction.is_active !== false && selectedAttraction.is_published !== false;
  const attractionStatusHelp = !selectedAttraction
    ? "Select the attraction that this QR should represent."
    : selectedAttraction.is_active === false
      ? "This attraction is inactive. Activate it before printing this QR."
      : selectedAttraction.is_published === false
        ? "This attraction is still a draft. Publish it before printing this QR."
        : "The linked attraction is active and published.";
  const readiness = [
    {
      label: "URL-safe code",
      complete: /^[a-z0-9_-]{3,100}$/.test(code),
      help: "Use lowercase letters, numbers, hyphen, or underscore.",
    },
    {
      label: "Attraction selected",
      complete: !!selectedAttractionId,
      help: "The QR landing needs one attraction source of truth.",
    },
    {
      label: "Attraction is public-ready",
      complete: attractionPublicReady,
      help: attractionStatusHelp,
    },
    {
      label: "Photo spot relationship valid",
      complete: photoSpotMatchesAttraction,
      help: "If a photo spot is selected, it must belong to the selected attraction.",
    },
    {
      label: `Operational status: ${scheduleStatus.label}`,
      complete: scheduleStatus.ready,
      help: scheduleStatus.help,
    },
  ];

  return (
    <form action={formAction} className="space-y-6">
      <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} fieldLabels={FIELD_LABELS} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <AdminFormSection
            title="QR identity"
            description="Set the short public code tourists will open, for example /c/aiyerweng-01."
            icon={QrCode}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-black text-slate-700">QR / Check-in code *</span>
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(event) => setCode(normalizeCode(event.target.value))}
                  required
                  title="URL-safe characters only"
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  placeholder="aiyerweng-skywalk-01"
                />
                <p className="mt-1 text-xs font-bold text-slate-500">Public tourist URL: {publicPath}</p>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-black text-slate-700">Internal label</span>
                <input
                  type="text"
                  name="label"
                  defaultValue={initialData?.label ?? ""}
                  placeholder="Front viewpoint, entrance, main photo zone"
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </AdminFormSection>            <AdminFormSection
            title="สถานที่และจุดถ่ายภาพ"
            description="QR เดียวต้องชี้ไปยังสถานที่ท่องเที่ยวหนึ่งแห่ง โดยมีจุดถ่ายภาพเป็นตัวเลือกเสริมเพื่อบริบทใบประกาศที่แม่นยำยิ่งขึ้น"
            icon={QrCode}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-slate-700">Attraction *</span>
                <select
                  name="attractionId"
                  value={selectedAttractionId}
                  onChange={(event) => setSelectedAttractionId(event.target.value === "" ? "" : Number(event.target.value))}
                  required
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                >
                  <option value="" disabled>
                    Select attraction
                  </option>
                  {attractions.map((attraction) => (
                    <option key={attraction.attraction_id} value={attraction.attraction_id}>
                      {attraction.name_th}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Photo spot</span>
                <select
                  name="photoSpotId"
                  value={selectedPhotoSpotId}
                  onChange={(event) => setSelectedPhotoSpotId(event.target.value === "" ? "" : Number(event.target.value))}
                  disabled={!selectedAttractionId || filteredSpots.length === 0}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">No specific photo spot</option>
                  {filteredSpots.map((spot) => (
                    <option key={spot.photo_spot_id} value={spot.photo_spot_id}>
                      {spot.spot_name_th}
                    </option>
                  ))}
                </select>
                {selectedAttractionId && filteredSpots.length === 0 ? (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    This attraction has no photo spot yet. The QR can still work, but the certificate context will be broader.
                  </p>
                ) : null}
              </label>
            </div>
          </AdminFormSection>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:col-span-4">
          <AdminReadinessPanel title="QR readiness" items={readiness} />

          <AdminHelpPanel title="Preview and test" tone="success">
            <div className="rounded-lg bg-white/70 p-3 font-mono text-xs text-[#073F37]">{publicPath}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(publicPath)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#073F37] px-3 py-2 text-xs font-black text-white transition hover:bg-[#0A6B62]"
              >
                <Copy size={15} weight="bold" />
                Copy URL
              </button>
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0A6B62]/30 bg-white px-3 py-2 text-xs font-black text-[#073F37] transition hover:bg-[#E6F4EF]"
              >
                <ArrowSquareOut size={15} weight="bold" />
                Open test page
              </a>
              <DownloadQrAction
                code={code}
                label={selectedPhotoSpot?.spot_name_th || selectedAttraction?.name_th || code}
                showLabel
                buttonLabel="Download QR"
                disabled={!/^[a-z0-9_-]{3,100}$/.test(code)}
              />
            </div>
          </AdminHelpPanel>

          {hasAttractionStatus && !attractionPublicReady ? (
            <AdminHelpPanel title="Check before printing" tone="warning">
              <p>{attractionStatusHelp}</p>
            </AdminHelpPanel>
          ) : null}

          <AdminHelpPanel title="Certificate context" tone="info">
            <div className="space-y-2">
              <p>Attraction: {selectedAttraction?.name_th || "Select an attraction"}</p>
              <p>Photo spot: {selectedPhotoSpot?.spot_name_th || "No specific photo spot selected"}</p>
              <p>This QR is for all tourists. Do not create separate QR codes for guest, LINE, foreign, or email users.</p>
            </div>
          </AdminHelpPanel>

          <AdminFormSection title="Status and schedule" description="Control when this QR should be used in the field.">
            <div className="space-y-4">
              <input type="hidden" name="isActive" value="false" />
              <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700 has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#E6F4EF]">
                Active
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 accent-[#0A6B62]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Starts at</span>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Ends at</span>
                <input
                  type="datetime-local"
                  name="endsAt"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                />
              </label>
            </div>
          </AdminFormSection>
        </div>
      </div>

      <AdminSaveBar
        cancelHref="/admin/checkin-codes"
        isPending={isPending}
        submitLabel={isEditing ? "บันทึกการเปลี่ยนแปลง QR" : "สร้าง QR เช็คอิน"}
      />
    </form>
  );
}

"use client";

import { useActionState, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowSquareOut, Copy, ImageSquare, List, Plus, QrCode } from "@phosphor-icons/react";
import { QRCodeCanvas } from "qrcode.react";
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
import {
  bangkokDateTimeInputToIso,
  isoToBangkokDateTimeInput,
} from "@/lib/utils/bangkok-datetime";

interface CheckinCodeFormProps {
  initialData?: AdminCheckinCodeRow | null;
  attractions: { attraction_id: number; name_th: string; is_active?: boolean | null; is_published?: boolean | null }[];
  photoSpots: {
    photo_spot_id: number;
    attraction_id: number;
    spot_name_th: string;
    is_active: boolean;
  }[];
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

type CheckinCodeFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: {
    id?: number;
    code?: string;
    attractionId?: number;
  };
};

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function buildSuggestedCode(attractionId: number | "", photoSpotId: number | "") {
  const scope = photoSpotId ? `spot-${photoSpotId}` : attractionId ? `attraction-${attractionId}` : "checkin";
  const suffix = Math.random().toString(36).slice(2, 6);
  return normalizeCode(`${scope}-${suffix}`);
}

function subscribeOrigin(_onStoreChange: () => void) {
  void _onStoreChange;
  return () => undefined;
}

function getBrowserOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

function getScheduleStatus(isActive: boolean, startsAt: string, endsAt: string) {
  if (!isActive) return { label: "Inactive", help: "The QR landing should not be printed while inactive.", ready: false };

  const now = Date.now();
  const startTime = startsAt ? new Date(bangkokDateTimeInputToIso(startsAt)).getTime() : null;
  const endTime = endsAt ? new Date(bangkokDateTimeInputToIso(endsAt)).getTime() : null;

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
  const [startsAt, setStartsAt] = useState(isoToBangkokDateTimeInput(initialData?.starts_at));
  const [endsAt, setEndsAt] = useState(isoToBangkokDateTimeInput(initialData?.ends_at));
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribeOrigin, getBrowserOrigin, () => "");

  const [state, formAction, isPending] = useActionState<CheckinCodeFormState, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const filteredSpots = useMemo(
    () =>
      photoSpots.filter(
        (spot) =>
          spot.attraction_id === Number(selectedAttractionId) &&
          (spot.is_active || spot.photo_spot_id === Number(selectedPhotoSpotId))
      ),
    [photoSpots, selectedAttractionId, selectedPhotoSpotId]
  );

  const selectedAttraction = useMemo(
    () => attractions.find((attraction) => attraction.attraction_id === Number(selectedAttractionId)),
    [attractions, selectedAttractionId]
  );

  const selectedPhotoSpot = useMemo(
    () => photoSpots.find((spot) => spot.photo_spot_id === Number(selectedPhotoSpotId)),
    [photoSpots, selectedPhotoSpotId]
  );

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
  const publicUrl = origin && code ? `${origin}${publicPath}` : publicPath;
  const codeIsValid = /^[a-z0-9_-]{3,100}$/.test(code);
  const scheduleStatus = getScheduleStatus(isActive, startsAt, endsAt);
  const photoSpotMatchesAttraction = !selectedPhotoSpot || selectedPhotoSpot.attraction_id === Number(selectedAttractionId);
  const photoSpotReady = !selectedPhotoSpot || selectedPhotoSpot.is_active || !isActive;
  const hasAttractionStatus = typeof selectedAttraction?.is_active === "boolean" || typeof selectedAttraction?.is_published === "boolean";
  const attractionPublicReady = !!selectedAttraction && selectedAttraction.is_active !== false && selectedAttraction.is_published !== false;
  const attractionStatusHelp = !selectedAttraction
    ? "เลือกสถานที่ท่องเที่ยวที่ต้องการผูกกับ QR นี้"
    : selectedAttraction.is_active === false
      ? "สถานที่นี้ยังไม่เปิดใช้งาน กรุณาเปิดใช้งานสถานที่ก่อนนำ QR ไปใช้จริง"
      : selectedAttraction.is_published === false
        ? "สถานที่นี้ยังเป็นแบบร่าง กรุณาเผยแพร่สถานที่ก่อนนำ QR ไปใช้จริง"
        : "สถานที่ที่เลือกพร้อมใช้งานและเผยแพร่แล้ว";
  const readiness = [
    {
      label: "รหัส QR ปลอดภัย",
      complete: /^[a-z0-9_-]{3,100}$/.test(code),
      help: "ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข ยัติภังค์ (-) หรือขีดล่าง (_) เท่านั้น",
    },
    {
      label: "เลือกสถานที่แล้ว",
      complete: !!selectedAttractionId,
      help: "QR ต้องผูกกับสถานที่ท่องเที่ยวหลักหนึ่งแห่ง",
    },
    {
      label: "สถานที่พร้อมเผยแพร่",
      complete: attractionPublicReady,
      help: attractionStatusHelp,
    },
    {
      label: "ความสัมพันธ์จุดถ่ายภาพถูกต้อง",
      complete: photoSpotMatchesAttraction && photoSpotReady,
      help: selectedPhotoSpot?.is_active === false
        ? "จุดถ่ายภาพนี้ปิดใช้งานอยู่ จึงต้องเปิดจุดถ่ายภาพหรือปิดใช้งาน QR นี้ก่อนบันทึก"
        : "ถ้าเลือกจุดถ่ายภาพ จุดถ่ายภาพนั้นต้องอยู่ภายใต้สถานที่ที่เลือก",
    },
    {
      label: `สถานะการทำงาน: ${scheduleStatus.label}`,
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
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    name="code"
                    value={code}
                    onChange={(event) => setCode(normalizeCode(event.target.value))}
                    required
                    title="URL-safe characters only"
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                    placeholder="aiyerweng-skywalk-01"
                  />
                  <button
                    type="button"
                    onClick={() => setCode(buildSuggestedCode(selectedAttractionId, selectedPhotoSpotId))}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[#0A6B62]/30 bg-white px-4 py-2 text-sm font-black text-[#073F37] transition hover:bg-[#E6F4EF]"
                  >
                    สร้างรหัสอัตโนมัติ
                  </button>
                </div>
                <p className="mt-1 break-all text-xs font-bold text-slate-500">Public tourist URL: {publicUrl}</p>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-black text-slate-700">ชื่ออ้างอิงภายใน (Internal label)</span>
                <input
                  type="text"
                  name="label"
                  defaultValue={initialData?.label ?? ""}
                  placeholder="เช่น จุดชมวิวสกายวอล์ค, ประตูทางเข้าหลัก"
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
                  onChange={(event) => {
                    setSelectedAttractionId(event.target.value === "" ? "" : Number(event.target.value));
                    setSelectedPhotoSpotId("");
                  }}
                  required
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                >
                  <option value="" disabled>
                    เลือกสถานที่ท่องเที่ยว
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
                  <option value="">ไม่มีจุดถ่ายภาพเฉพาะ</option>
                  {filteredSpots.map((spot) => (
                    <option key={spot.photo_spot_id} value={spot.photo_spot_id}>
                      {spot.spot_name_th}{spot.is_active ? "" : " (ปิดใช้งาน)"}
                    </option>
                  ))}
                </select>
                {selectedAttractionId && filteredSpots.length === 0 ? (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    สถานที่นี้ยังไม่มีจุดถ่ายภาพ QR จะเชื่อมกับสถานที่หลักโดยตรง และใบประกาศจะแสดงรูปภาพหลักของสถานที่
                  </p>
                ) : null}
              </label>
            </div>
          </AdminFormSection>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:col-span-4">
          <AdminReadinessPanel title="ความพร้อมใช้งาน" items={readiness} />

          <AdminHelpPanel title="ทดสอบและดูตัวอย่าง" tone="success">
            <div className="rounded-lg bg-white/70 p-3 font-mono text-xs text-[#073F37] break-all">{publicUrl}</div>
            <div className="mt-3 rounded-lg border border-[#0A6B62]/15 bg-white p-4 text-center">
              {codeIsValid ? (
                <div className="inline-flex flex-col items-center gap-3">
                  <QRCodeCanvas value={publicUrl} size={156} level="H" marginSize={2} />
                  <p className="break-all font-mono text-[11px] font-bold text-slate-500">{publicPath}</p>
                </div>
              ) : (
                <div className="flex min-h-[188px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 text-center">
                  กรอกรหัสอย่างน้อย 3 ตัวเพื่อดู QR preview
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(publicUrl);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                }}
                disabled={!codeIsValid || !origin}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#073F37] px-3 py-2 text-xs font-black text-white transition hover:bg-[#0A6B62]"
              >
                <Copy size={15} weight="bold" />
                {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
              </button>
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0A6B62]/30 bg-white px-3 py-2 text-xs font-black text-[#073F37] transition hover:bg-[#E6F4EF]"
              >
                <ArrowSquareOut size={15} weight="bold" />
                เปิดหน้าทดสอบ
              </a>
              <DownloadQrAction
                code={code}
                label={selectedPhotoSpot?.spot_name_th || selectedAttraction?.name_th || code}
                showLabel
                buttonLabel="โหลดรูป QR"
                disabled={!codeIsValid}
              />
            </div>
          </AdminHelpPanel>

          {hasAttractionStatus && !attractionPublicReady ? (
            <AdminHelpPanel title="ตรวจสอบก่อนพิมพ์" tone="warning">
              <p>{attractionStatusHelp}</p>
            </AdminHelpPanel>
          ) : null}

          <AdminHelpPanel title="ข้อมูลที่จะแสดงบนใบประกาศ" tone="info">
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold">สถานที่:</span> {selectedAttraction?.name_th || "ยังไม่ได้เลือกสถานที่"}</p>
              <p><span className="font-semibold">จุดถ่ายภาพ:</span> {selectedPhotoSpot?.spot_name_th || "ไม่ได้ระบุเฉพาะจุด"}</p>
              <p className="mt-2 pt-2 border-t border-slate-200 text-xs leading-5">
                QR นี้สามารถใช้งานร่วมกันได้ทั้งหมด ไม่ต้องแยก QR สำหรับนักท่องเที่ยวที่เข้าสู่ระบบแบบผู้เยี่ยมชม, LINE, หรืออีเมล
              </p>
            </div>
          </AdminHelpPanel>

          <AdminFormSection title="สถานะและระยะเวลา" description="กำหนดการเปิดใช้งาน QR สำหรับนักท่องเที่ยว">
            <div className="space-y-4">
              <input type="hidden" name="isActive" value="false" />
              <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700 has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#E6F4EF]">
                เปิดใช้งาน (Active)
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

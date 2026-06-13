"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle,
  Image as ImageIcon,
  PencilSimple,
  Plus,
  UploadSimple,
  WarningCircle,
  X,
  Images,
} from "@phosphor-icons/react";
import { createMediaAction, deleteMediaAction, updateMediaAction } from "@/app/actions/admin-media-actions";
import type { AdminMediaRow } from "@/lib/repositories/admin-media.repository";
import type { AdminMediaEntityType } from "@/lib/validation/media";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type MediaType = "image" | "panorama" | "video360" | "embed" | "external_url";

interface MediaManagerProps {
  entityId: number;
  entityType: AdminMediaEntityType;
  initialMedia: AdminMediaRow[];
}

const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string; help: string; needsUpload: boolean; needsAlt: boolean }[] = [
  {
    value: "image",
    label: "รูปภาพทั่วไป",
    help: "ใช้เป็นภาพหน้าปก การ์ดหน้าเว็บ หรือแกลเลอรี",
    needsUpload: true,
    needsAlt: true,
  },
  {
    value: "panorama",
    label: "ภาพพาโนรามา / 360",
    help: "ใช้กับภาพมุมกว้างหรือภาพ 360 ที่เป็นไฟล์รูป",
    needsUpload: true,
    needsAlt: true,
  },
  {
    value: "video360",
    label: "วิดีโอ 360",
    help: "ใช้ URL ของวิดีโอ 360 จากผู้ให้บริการภายนอก",
    needsUpload: false,
    needsAlt: false,
  },
  {
    value: "embed",
    label: "Embed",
    help: "ใช้ iframe หรือ embed code เช่น virtual tour",
    needsUpload: false,
    needsAlt: false,
  },
  {
    value: "external_url",
    label: "ลิงก์ภายนอก",
    help: "ใช้ URL รูปหรือสื่อที่ถูกโฮสต์ไว้ภายนอก",
    needsUpload: false,
    needsAlt: true,
  },
];

const MEDIA_TYPE_LABELS: Record<string, string> = {
  image: "รูปภาพ",
  panorama: "พาโนรามา",
  video360: "วิดีโอ 360",
  embed: "Embed",
  external_url: "ลิงก์ภายนอก",
};

const FIELD_LABELS: Record<string, string> = {
  mediaType: "ประเภทสื่อ",
  storagePath: "ไฟล์หรือ URL",
  altTextTh: "Alt text ภาษาไทย",
  altTextEn: "Alt text ภาษาอังกฤษ",
  captionTh: "คำบรรยายภาษาไทย",
  captionEn: "คำบรรยายภาษาอังกฤษ",
  displayOrder: "ลำดับการแสดงผล",
};

function mediaPreviewUrl(storagePath: string) {
  if (!storagePath) return "";
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  if (storagePath.startsWith("cloudinary:")) return `/api/media/image?path=${encodeURIComponent(storagePath)}`;
  return `/site-media/${storagePath}`;
}

function getMediaTypeOption(value: string) {
  return MEDIA_TYPE_OPTIONS.find((option) => option.value === value) ?? MEDIA_TYPE_OPTIONS[0];
}

function readableFieldErrors(fieldErrors?: Record<string, string[] | undefined>) {
  if (!fieldErrors) return [];

  return Object.entries(fieldErrors).flatMap(([field, errors]) => {
    if (!errors?.length) return [];
    return errors.map((error) => `${FIELD_LABELS[field] ?? field}: ${error}`);
  });
}

type MediaReference = {
  entityType: string;
  entityId: number | null;
  name: string;
};

function EntityTypeLabel({ type }: { type: string }) {
  const labelMap: Record<string, { label: string; badge: string }> = {
    attraction: { label: "สถานที่", badge: "bg-blue-50 text-blue-700" },
    restaurant: { label: "ร้านอาหาร", badge: "bg-rose-50 text-rose-700" },
    accommodation: { label: "ที่พัก", badge: "bg-purple-50 text-purple-700" },
    story: { label: "บทความ", badge: "bg-amber-50 text-amber-700" },
    route: { label: "เส้นทาง", badge: "bg-emerald-50 text-emerald-700" },
  };
  const info = labelMap[type] ?? { label: type, badge: "bg-slate-50 text-slate-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${info.badge}`}>{info.label}</span>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MediaManager({ entityId, entityType, initialMedia }: MediaManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveCandidate, setArchiveCandidate] = useState<AdminMediaRow | null>(null);
  const [archiveReferences, setArchiveReferences] = useState<MediaReference[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const mediaSummary = useMemo(() => {
    const activeMedia = initialMedia.filter((media) => media.is_active);
    const coverCount = initialMedia.filter((media) => media.is_cover && media.is_active).length;
    const missingAltCount = initialMedia.filter((media) =>
      media.is_active &&
      (media.media_type === "image" || media.media_type === "panorama") &&
      !media.alt_text_th &&
      !media.alt_text_en
    ).length;

    return {
      total: initialMedia.length,
      active: activeMedia.length,
      coverCount,
      missingAltCount,
    };
  }, [initialMedia]);

  const handleArchiveClick = async (media: AdminMediaRow) => {
    setArchiveCandidate(media);
    setArchiveReferences([]);
    setIsArchiving(false);
    setLoadingReferences(true);

    // Fetch used-in references before showing the confirmation.
    // MediaManager works with content_media IDs, so lookup references by storage path.
    try {
      const url = `/api/admin/media/references?storagePath=${encodeURIComponent(media.storage_path)}`;
      const response = await fetch(url, { method: "GET" });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.references) {
        setArchiveReferences(data.references);
      }
    } catch {
      // Silently fail — references will just be empty
    } finally {
      setLoadingReferences(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveCandidate) return;
    setIsArchiving(true);
    setDeleteError(null);

    const result = await deleteMediaAction(archiveCandidate.media_id);
    if (result.success) {
      setIsArchiving(false);
      setArchiveCandidate(null);
      setArchiveReferences([]);
      router.refresh();
      return;
    }

    setDeleteError(result.error || "ไม่สามารถ archive สื่อนี้ได้");
    setIsArchiving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-[#0A6B62]/20 bg-[#E6F4EF] p-4 text-sm leading-6 text-[#073F37] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black">ขั้นตอนการจัดการสื่อ</p>
          <p className="mt-0.5">
            อัปโหลดไฟล์ก่อน แล้วระบบจะสร้าง path ให้อัตโนมัติ แอดมินไม่ต้องกรอก storage path เอง ยกเว้นกรณีใช้ URL หรือ embed ภายนอก
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingId("new")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-black text-white transition hover:bg-[#075049]"
        >
          <Plus size={18} weight="bold" />
          เพิ่มสื่อ
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total media", value: mediaSummary.total, tone: "text-slate-900" },
          { label: "Active", value: mediaSummary.active, tone: "text-[#073F37]" },
          { label: "Cover images", value: mediaSummary.coverCount, tone: mediaSummary.coverCount ? "text-[#073F37]" : "text-amber-700" },
          { label: "Missing alt", value: mediaSummary.missingAltCount, tone: mediaSummary.missingAltCount ? "text-amber-700" : "text-[#073F37]" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold text-slate-500">{item.label}</p>
            <p className={`mt-1 text-xl font-black ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {deleteError ? (
        <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
          <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
          {deleteError}
        </div>
      ) : null}

      {editingId === "new" ? (
        <MediaForm entityId={entityId} entityType={entityType} onClose={() => setEditingId(null)} />
      ) : null}

      {initialMedia.length === 0 && editingId !== "new" ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <ImageIcon className="mx-auto text-slate-300" size={42} weight="duotone" />
          <p className="mt-3 text-sm font-black text-slate-700">ยังไม่มีสื่อสำหรับรายการนี้</p>
          <p className="mt-1 text-sm text-slate-500">เพิ่มภาพ cover ก่อน เพื่อให้หน้า public, homepage card และ preview ดูสมบูรณ์</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {initialMedia.map((media) => {
          const isVisual = media.media_type === "image" || media.media_type === "panorama";
          const hasAltText = Boolean(media.alt_text_th || media.alt_text_en);
          const readinessItems = [
            { label: "ใช้งานอยู่", complete: media.is_active },
            { label: "มี alt text", complete: !isVisual || hasAltText },
            { label: "เป็นภาพหน้าปก", complete: !isVisual || media.is_cover },
          ];
          return (
            <article key={media.media_id} className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${editingId === media.media_id ? 'col-span-full' : ''}`}>
              {editingId === media.media_id ? (
                <MediaForm
                  entityId={entityId}
                  entityType={entityType}
                  initialData={media}
                  onClose={() => setEditingId(null)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden rounded-lg bg-slate-100">
                    {isVisual ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaPreviewUrl(media.storage_path)}
                        alt={media.alt_text_th || media.alt_text_en || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center px-4 text-center text-sm text-slate-500">
                        <ImageIcon size={28} weight="duotone" />
                        <span className="mt-2 font-bold">{MEDIA_TYPE_LABELS[media.media_type] ?? media.media_type}</span>
                        <span className="mt-1 line-clamp-2 text-xs">{media.storage_path}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {MEDIA_TYPE_LABELS[media.media_type] ?? media.media_type}
                        </span>
                        {media.is_active && media.is_cover ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                            หน้าปก
                          </span>
                        ) : media.is_active ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            แกลเลอรี
                          </span>
                        ) : null}
                        {!media.is_active ? (
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                            ฉบับร่าง / ไม่ทำงาน
                          </span>
                        ) : null}
                        {isVisual && media.is_active && !hasAltText ? (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                            ไม่มี alt
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-800">
                        {media.alt_text_th || media.alt_text_en || "ยังไม่มี alt text"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">ลำดับ: {media.display_order ?? "-"}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(media.media_id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
                        aria-label="แก้ไขสื่อ"
                      >
                        <PencilSimple size={17} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchiveClick(media)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-700 transition hover:bg-amber-50 hover:text-amber-800"
                        aria-label="Archive สื่อ"
                      >
                        <Archive size={17} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-black uppercase text-slate-500">ความพร้อมแสดงผล</p>
                    <div className="mt-2 grid gap-2">
                      {readinessItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          {item.complete ? (
                            <CheckCircle className="shrink-0 text-[#0A6B62]" size={15} weight="fill" />
                          ) : (
                            <WarningCircle className="shrink-0 text-amber-600" size={15} weight="fill" />
                          )}
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {archiveCandidate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Archive media confirmation"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setArchiveCandidate(null);
              setArchiveReferences([]);
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex gap-3">
              <Archive className="mt-0.5 shrink-0 text-amber-600" size={24} weight="fill" />
              <div>
                <h2 className="text-base font-black text-slate-900">Archive สื่อนี้?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  จะซ่อนไฟล์นี้จาก Media Library และตัวเลือกสื่อใน CMS ไฟล์และฐานข้อมูลยังคงอยู่เพื่อให้กู้คืนได้ภายหลัง
                </p>
                {archiveCandidate.storage_path ? (
                  <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                    {archiveCandidate.storage_path}
                  </p>
                ) : null}

                {archiveCandidate.created_at ? (
                  <p className="mt-2 text-xs text-slate-500">สร้าง: {formatDate(archiveCandidate.created_at)}</p>
                ) : null}

                {loadingReferences ? (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#0A6B62]" />
                    กำลังตรวจสอบว่าสื่อนี้ถูกใช้ที่ไหนบ้าง...
                  </div>
                ) : archiveReferences.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-amber-700">สื่อนี้ถูกใช้ในเนื้อหาเหล่านี้:</p>
                    <div className="mt-2 space-y-1.5">
                      {archiveReferences.map((ref, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs">
                          <EntityTypeLabel type={ref.entityType} />
                          <span className="font-bold text-amber-900">{ref.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-amber-800">
                      สื่อที่ถูก archive แล้วจะยังคงแสดงในหน้าสาธารณะเดิม แต่จะไม่ปรากฏในตัวเลือกสำหรับการเพิ่มสื่อใหม่
                      หากต้องการเปลี่ยนภาพ ควรอัปโหลดภาพใหม่และตั้งเป็น active ก่อน archive
                    </p>
                  </div>
                ) : !loadingReferences ? (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    สื่อนี้ไม่ได้ถูกอ้างอิงในเนื้อหาใด ๆ การ archive จะมีผลกับ Media Library และตัวเลือกสื่อเท่านั้น
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setArchiveCandidate(null);
                  setArchiveReferences([]);
                }}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                {archiveReferences.length > 0 ? "ปิด" : "ยกเลิก"}
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                className="min-h-11 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-black text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {isArchiving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Archive size={16} weight="bold" />
                )}
                {isArchiving ? "กำลัง Archive..." : "Archive สื่อนี้"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MediaForm({
  entityId,
  entityType,
  initialData,
  onClose,
}: {
  entityId: number;
  entityType: AdminMediaEntityType;
  initialData?: AdminMediaRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateMediaAction.bind(null, initialData.media_id) : createMediaAction;
  const [mediaType, setMediaType] = useState<MediaType>((initialData?.media_type as MediaType) || "image");
  const [storagePath, setStoragePath] = useState(initialData?.storage_path || "");
  const [altTextTh, setAltTextTh] = useState(initialData?.alt_text_th || "");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  const selectedMediaType = useMemo(() => getMediaTypeOption(mediaType), [mediaType]);
  const fieldErrors = readableFieldErrors(state?.fieldErrors);
  const canSubmit = !uploadingFile && !isPending && storagePath.trim().length > 0;
  const isVisual = mediaType === "image" || mediaType === "panorama";
  const missingAltWarning = isVisual && altTextTh.trim().length === 0;

  useEffect(() => {
    if (state?.success) {
      onClose();
      router.refresh();
    }
  }, [state?.success, onClose, router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("ไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน 10MB");
      event.target.value = "";
      return;
    }

    setUploadingFile(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("entityId", String(entityId));
      body.append("entityType", entityType);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setUploadError(result.error || "อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      setStoragePath(result.storagePath);
      setUploadSuccess(true);
    } catch {
      setUploadError("เชื่อมต่อไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่");
    } finally {
      setUploadingFile(false);
      event.target.value = "";
    }
  };

  return (
    <form action={formAction} className="col-span-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="storagePath" value={storagePath} />
      <input type="hidden" name="isCover" value="false" />
      <input type="hidden" name="isActive" value="false" />

      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-[#073F37]">{isEditing ? "แก้ไขสื่อ" : "เพิ่มสื่อใหม่"}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            เลือกประเภทสื่อก่อน ระบบจะแสดงเฉพาะช่องที่จำเป็น ลดการกรอกผิดและกันปัญหา path หาย
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="ปิดฟอร์ม"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {state?.error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <div className="flex gap-2 font-black">
            <WarningCircle className="mt-0.5 shrink-0" size={18} weight="fill" />
            {state.error}
          </div>
          {fieldErrors.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-7 text-xs font-bold">
              {fieldErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-6 items-start">
        <div className="flex-1 basis-[360px] space-y-6">
          <label className="block">
            <span className="text-sm font-black text-slate-700">ประเภทสื่อ</span>
            <select
              name="mediaType"
              value={mediaType}
              aria-describedby="media-type-help"
              onChange={(event) => {
                setMediaType(event.target.value as MediaType);
                setUploadError(null);
                setUploadSuccess(false);
              }}
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
            >
              {MEDIA_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span id="media-type-help" className="mt-1.5 block text-xs leading-5 text-slate-500">{selectedMediaType.help}</span>
          </label>

          {selectedMediaType.needsUpload ? (
            <div>
              <span className="text-sm font-black text-slate-700">ไฟล์รูปภาพ</span>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-[#0A6B62] hover:bg-[#E6F4EF]">
                <UploadSimple className="text-[#0A6B62]" size={30} weight="bold" />
                <span className="mt-2 text-sm font-black text-slate-800">
                  {uploadingFile ? "กำลังอัปโหลด..." : storagePath ? "เปลี่ยนไฟล์" : "อัปโหลดไฟล์"}
                </span>
                <span className="mt-1 text-xs text-slate-500">รองรับ JPG, PNG, WebP ขนาดไม่เกิน 10MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="sr-only"
                />
              </label>
              {uploadError ? (
                <p className="mt-2 flex gap-2 text-xs font-bold text-rose-600">
                  <WarningCircle className="shrink-0" size={15} weight="fill" />
                  {uploadError}
                </p>
              ) : null}
              {uploadSuccess ? (
                <p className="mt-2 flex gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle className="shrink-0" size={15} weight="fill" />
                  อัปโหลดสำเร็จ ระบบเติม path ให้แล้ว
                </p>
              ) : null}
            </div>
          ) : (
            <div className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-700">
                  {mediaType === "embed" ? "Embed code / iframe" : "URL ของสื่อ / Path"}
                </span>
                {mediaType !== "embed" ? (
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0A6B62] hover:text-[#075049] transition-colors bg-[#E6F4EF] hover:bg-[#c9ebe1] px-2.5 py-1 rounded-md"
                  >
                    <Images size={14} weight="bold" /> เลือกจากคลังภาพ (Media Library)
                  </button>
                ) : null}
              </div>

              {mediaType === "embed" ? (
                <textarea
                  name="storagePath"
                  value={storagePath}
                  onChange={(event) => setStoragePath(event.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  placeholder="<iframe ...></iframe>"
                />
              ) : (
                <input
                  name="storagePath"
                  type="text"
                  value={storagePath}
                  onChange={(event) => setStoragePath(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  placeholder="https://... หรือ /path/to/image.jpg"
                />
              )}
            </div>
          )}

          {storagePath ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-black text-slate-700">Storage / URL</p>
              <p className="mt-1 break-all font-mono">{storagePath}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {selectedMediaType.needsAlt ? (
            <div className="space-y-4">
              <div className={`rounded-lg border p-4 ${missingAltWarning ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Metadata</p>
                  {missingAltWarning && (
                    <span className="flex items-center gap-1 text-xs font-black text-rose-600">
                      <WarningCircle size={12} weight="fill" />
                      MISSING ALT
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-xs leading-5 ${missingAltWarning ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>Alt text is required for public images. Caption shows below the image on public pages.</p>
                <div className="mt-5 flex flex-col gap-5">
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Alt text (ภาษาไทย) <span className="text-rose-500">*</span></span>
                    <input
                      name="altTextTh"
                      value={altTextTh}
                      aria-label="Alt text ภาษาไทย"
                      onChange={(e) => setAltTextTh(e.target.value)}
                      className={`mt-2 min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${missingAltWarning ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-300 bg-white focus:border-[#0A6B62] focus:ring-[#0A6B62]/15'}`}
                      placeholder="อธิบายภาพเพื่อ accessibility"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Alt text (English)</span>
                    <input
                      name="altTextEn"
                      defaultValue={initialData?.alt_text_en ?? ""}
                      className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                      placeholder="Short image description"
                    />
                  </label>
                  <div className="h-px bg-slate-100" />
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Caption ภาษาไทย</span>
                    <input
                      name="captionTh"
                      defaultValue={initialData?.caption_th ?? ""}
                      className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                      placeholder="ข้อความใต้ภาพ"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Caption ภาษาอังกฤษ</span>
                    <input
                      name="captionEn"
                      defaultValue={initialData?.caption_en ?? ""}
                      className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                      placeholder="Image subtitle"
                    />
                  </label>
                </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Attribution & licensing</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Credit the source for public-facing images. Optional but recommended for third-party images.</p>
                  <div className="mt-5 flex flex-col gap-5">
                    <label className="block">
                      <span className="text-sm font-black text-slate-700">Credit / Source name</span>
                      <input
                        name="creditText"
                        defaultValue={initialData?.credit_text ?? ""}
                        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                        placeholder="เช่น ช่างภาพ: สมชาย ใจดี"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-black text-slate-700">Source URL</span>
                      <input
                        name="sourceUrl"
                        defaultValue={initialData?.source_url ?? ""}
                        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                        placeholder="https://..."
                      />
                    </label>
                    <div className="h-px bg-slate-100" />
                    <label className="block">
                      <span className="text-sm font-black text-slate-700">License type</span>
                      <input
                        name="licenseType"
                        defaultValue={initialData?.license_type ?? ""}
                        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                        placeholder="เช่น CC BY 4.0, Royalty-free"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-black text-slate-700">Usage notes</span>
                      <input
                        name="usageNotes"
                        defaultValue={initialData?.usage_notes ?? ""}
                        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                        placeholder="ข้อความภายใน (ไม่แสดงสาธารณะ)"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : null}
        </div>

        <aside className="w-full shrink-0 basis-[300px] flex-grow space-y-4 md:max-w-[320px]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="aspect-video bg-slate-100">
              {storagePath && (mediaType === "image" || mediaType === "panorama" || mediaType === "external_url") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaPreviewUrl(storagePath)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center text-sm text-slate-500">
                  <ImageIcon size={32} weight="duotone" />
                  <span className="mt-2 font-bold">{storagePath ? selectedMediaType.label : "ยังไม่มีไฟล์หรือ URL"}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <label className="block">
                <span className="text-sm font-black text-slate-700">ลำดับการแสดงผล</span>
                <input
                  type="number"
                  name="displayOrder"
                  defaultValue={initialData?.display_order ?? ""}
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  placeholder="เช่น 1"
                />
              </label>

              <fieldset className="space-y-3">
                <legend className="text-sm font-black text-slate-700">ตัวเลือกสื่อ</legend>
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-amber-950 has-[:checked]:border-amber-300 has-[:checked]:bg-amber-50">
                  ตั้งเป็นภาพ cover
                  <input type="checkbox" name="isCover" defaultChecked={initialData?.is_cover ?? false} className="h-4 w-4 accent-[#F3704C]" value="true" />
                </label>
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 has-[:checked]:border-[#0A6B62] has-[:checked]:bg-[#E6F4EF]">
                  เปิดใช้งาน
                  <input type="checkbox" name="isActive" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4 accent-[#0A6B62]" value="true" />
                </label>
              </fieldset>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <p className="font-black">ก่อน publish</p>
            <p className="mt-1">ภาพ official ควรมี alt text และควรใช้ไฟล์ที่มีสิทธิ์ใช้งานชัดเจน โดยเฉพาะภาพที่ขึ้นหน้าแรกหรือหน้า attraction</p>
          </div>
        </aside>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="min-h-11 rounded-lg bg-[#073F37] px-5 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : storagePath ? "บันทึกสื่อ" : "อัปโหลดหรือใส่ URL ก่อน"}
        </button>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setStoragePath(url)}
      />
    </form>
  );
}

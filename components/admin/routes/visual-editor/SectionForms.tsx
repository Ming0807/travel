"use client";

import { useActionState, useEffect, useState } from "react";
import { updateRouteAction } from "@/app/actions/admin-route-actions";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";

type SectionFormProps = {
  route: AdminRouteRow;
  onClose: () => void;
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  onCoverChange?: (mediaId: number | null, mediaUrl: string | null) => void;
};

function toFiniteMediaId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function HeaderForm({ route, onClose }: SectionFormProps) {
  const action = updateRouteAction.bind(null, route.route_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

        {/* Hidden fields to preserve other data */}
        <input type="hidden" name="descriptionTh" value={route.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={route.description_en ?? ""} />
        <input type="hidden" name="isPublished" value={route.is_published ? "true" : "false"} />
        <input type="hidden" name="isActive" value={route.is_active ? "true" : "false"} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อเส้นทางภาษาไทย *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={route.name_th ?? ""}
              name="nameTh"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อเส้นทางภาษาอังกฤษ</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={route.name_en ?? ""}
              name="nameEn"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug (สำหรับ URL) *</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono"
              defaultValue={route.slug ?? ""}
              name="slug"
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              placeholder="e.g. betong-mist-wellness-route"
            />
            <p className="mt-1 text-xs leading-5 text-slate-500">ใช้เป็น public URL เช่น /routes/betong-mist-wellness-route</p>
          </label>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
        <AdminSaveBar
          cancelHref="#"
          isPending={isPending}
          onCancel={onClose}
          submitLabel="บันทึกข้อมูลหลัก"
        />
      </div>
    </form>
  );
}

export function ContentForm({ route, onClose }: SectionFormProps) {
  const action = updateRouteAction.bind(null, route.route_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

        {/* Hidden fields */}
        <input type="hidden" name="nameTh" value={route.name_th} />
        <input type="hidden" name="slug" value={route.slug} />
        <input type="hidden" name="nameEn" value={route.name_en ?? ""} />
        <input type="hidden" name="isPublished" value={route.is_published ? "true" : "false"} />
        <input type="hidden" name="isActive" value={route.is_active ? "true" : "false"} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">รายละเอียดเส้นทาง (TH)</span>
            <textarea
              className="mt-2 min-h-[200px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={route.description_th ?? ""}
              name="descriptionTh"
              rows={6}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">รายละเอียดเส้นทาง (EN)</span>
            <textarea
              className="mt-2 min-h-[150px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={route.description_en ?? ""}
              name="descriptionEn"
              rows={4}
            />
          </label>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
        <AdminSaveBar
          cancelHref="#"
          isPending={isPending}
          onCancel={onClose}
          submitLabel="บันทึกเนื้อหา"
        />
      </div>
    </form>
  );
}

export function SettingsForm({ route, onClose }: SectionFormProps) {
  const action = updateRouteAction.bind(null, route.route_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

        {/* Hidden fields */}
        <input type="hidden" name="nameTh" value={route.name_th} />
        <input type="hidden" name="slug" value={route.slug} />
        <input type="hidden" name="nameEn" value={route.name_en ?? ""} />
        <input type="hidden" name="descriptionTh" value={route.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={route.description_en ?? ""} />

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-800">
              เปิดใช้งาน (Active)
              <input
                defaultChecked={route.is_active}
                name="isActive"
                type="checkbox"
                value="true"
                className="h-4 w-4 accent-teal-600"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 has-[:checked]:border-[#F3704C] has-[:checked]:bg-orange-50 has-[:checked]:text-orange-800">
              เผยแพร่ (Published)
              <input
                defaultChecked={route.is_published}
                name="isPublished"
                type="checkbox"
                value="true"
                className="h-4 w-4 accent-[#F3704C]"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Readiness</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block h-2 w-2 rounded-full ${route.name_th?.trim() ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className="font-semibold text-slate-600">Name</span>
                <span className="text-slate-400">{route.name_th?.trim() ? "พร้อม" : "ยังไม่ตั้งชื่อ"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block h-2 w-2 rounded-full ${route.slug ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className="font-semibold text-slate-600">Slug</span>
                <span className="text-slate-400">{route.slug ? route.slug : "ยังไม่กำหนด"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block h-2 w-2 rounded-full ${route.description_th ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className="font-semibold text-slate-600">Description</span>
                <span className="text-slate-400">{route.description_th ? "มีคำอธิบาย" : "ยังไม่มีคำอธิบาย"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
        <AdminSaveBar
          cancelHref="#"
          isPending={isPending}
          onCancel={onClose}
          submitLabel="บันทึกการตั้งค่า"
        />
      </div>
    </form>
  );
}

export function CoverForm({ route, onClose, coverMediaId: cmId, coverMediaUrl: cmUrl, onCoverChange }: SectionFormProps) {
  const action = updateRouteAction.bind(null, route.route_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cmUrl ?? "");
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(() => toFiniteMediaId(cmId));
  const [coverMediaAction, setCoverMediaAction] = useState<"none" | "set" | "clear">("none");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      if (onCoverChange) onCoverChange(currentMediaId, imagePreviewUrl || null);
      onClose();
    }
  }, [currentMediaId, imagePreviewUrl, onClose, onCoverChange, state?.success]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />

        {/* Hidden fields */}
        <input type="hidden" name="nameTh" value={route.name_th} />
        <input type="hidden" name="slug" value={route.slug} />
        <input type="hidden" name="nameEn" value={route.name_en ?? ""} />
        <input type="hidden" name="descriptionTh" value={route.description_th ?? ""} />
        <input type="hidden" name="descriptionEn" value={route.description_en ?? ""} />
        <input type="hidden" name="isPublished" value={route.is_published ? "true" : "false"} />
        <input type="hidden" name="isActive" value={route.is_active ? "true" : "false"} />

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="aspect-video bg-slate-100">
              {imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreviewUrl}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                  ยังไม่ได้เลือกรูปภาพ
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 p-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="min-h-10 flex-1 rounded-lg bg-[#073F37] px-3 py-2 text-sm font-black text-white transition hover:bg-[#0A6B62]"
              >
                เลือกจาก Media Library
              </button>
              {imagePreviewUrl ? (
                <button
                  type="button"
                  onClick={() => {
                     setImagePreviewUrl("");
                     setCurrentMediaId(null);
                     setCoverMediaAction("clear");
                   }}
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  เอาออก
                </button>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            ใช้ปุ่ม &ldquo;เลือกจาก Media Library&rdquo; ด้านบนเพื่อเลือกรูปภาพ การวาง URL ด้วยตนเองไม่รองรับในระบบปัจจุบัน
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
        <AdminSaveBar
          cancelHref="#"
          isPending={isPending}
          onCancel={onClose}
          submitLabel="บันทึกรูปภาพ"
        />
      </div>

      <input type="hidden" name="coverMediaId" value={currentMediaId ? String(currentMediaId) : ""} />
      <input type="hidden" name="coverMediaAction" value={coverMediaAction} />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const mediaId = toFiniteMediaId(asset.id);
          if (!mediaId) return;
          setCurrentMediaId(mediaId);
          setImagePreviewUrl(asset.url);
          setCoverMediaAction("set");
        }}
        onSelect={() => {}}
        title="เลือกภาพปกเส้นทาง"
      />
    </form>
  );
}

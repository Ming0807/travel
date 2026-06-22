"use client";

import { useActionState, useEffect, useState } from "react";
import { updateStoryAction } from "@/app/actions/admin-story-actions";
import { AdminFormErrorSummary, AdminSaveBar, type AdminFormActionState } from "@/components/admin/forms/AdminFormUX";
import { FormRichText } from "@/components/admin/forms/FormRichText";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

type SectionFormProps = {
  story: AdminStoryRow;
  onClose: () => void;
  provinces?: { province_id: number; province_name_th: string }[];
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  onCoverChange?: (mediaId: number | null, mediaUrl: string | null) => void;
};

function toFiniteMediaId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function HeaderForm({ story, onClose }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number; slug: string }>, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden required fields */}
        <input type="hidden" name="provinceId" value={story.province_id ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
        <input type="hidden" name="status" value={story.status} />
        <input type="hidden" name="category" value={story.category ?? ""} />
        <input type="hidden" name="content" value={story.content ?? ""} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อบทความ *</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.title ?? ""} name="title" required />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">เกริ่นนำ (Excerpt)</span>
            <textarea className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.excerpt ?? ""} name="excerpt" rows={3} />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug *</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.slug ?? ""} name="slug" required />
          </label>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกข้อมูลหลัก" />
      </div>
    </form>
  );
}

export function ContentForm({ story, onClose }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number; slug: string }>, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden required fields */}
        <input type="hidden" name="title" value={story.title ?? ""} />
        <input type="hidden" name="slug" value={story.slug ?? ""} />
        <input type="hidden" name="excerpt" value={story.excerpt ?? ""} />
        <input type="hidden" name="provinceId" value={story.province_id ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
        <input type="hidden" name="status" value={story.status} />
        <input type="hidden" name="category" value={story.category ?? ""} />

        <div className="space-y-4">
          <FormRichText label="เนื้อหาฉบับเต็ม" name="content" defaultValue={story.content ?? ""} minHeight={400} placeholder="เริ่มเขียนเนื้อหาบทความ..." />
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกเนื้อหา" />
      </div>
    </form>
  );
}

export function SettingsForm({ story, provinces = [], onClose }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number; slug: string }>, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden fields */}
        <input type="hidden" name="title" value={story.title ?? ""} />
        <input type="hidden" name="slug" value={story.slug ?? ""} />
        <input type="hidden" name="excerpt" value={story.excerpt ?? ""} />
        <input type="hidden" name="content" value={story.content ?? ""} />

        <div className="space-y-6">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">สถานะ *</span>
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.status} name="status">
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />

          <label className="block">
            <span className="text-sm font-bold text-slate-700">หมวดหมู่</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.category ?? ""} name="category" placeholder="e.g. วัฒนธรรม, ธรรมชาติ" />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัดที่เกี่ยวข้อง</span>
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.province_id ?? ""} name="provinceId">
              <option value="">-- ไม่ระบุ --</option>
              {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name_th}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกการตั้งค่า" />
      </div>
    </form>
  );
}

export function CoverForm({ story, onClose, coverMediaId: cmId, coverMediaUrl: cmUrl, onCoverChange }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number; slug: string }>, FormData>(action, { success: false });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cmUrl ?? "");
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(() => toFiniteMediaId(cmId));
  const [coverMediaAction, setCoverMediaAction] = useState<"none" | "set" | "clear">("none");
  const [coverStoragePath, setCoverStoragePath] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isDirty = currentMediaId !== toFiniteMediaId(cmId) || imagePreviewUrl !== (cmUrl ?? "");

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
        
        {isDirty ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </div>
        ) : null}

        {/* Hidden fields */}
        <input type="hidden" name="title" value={story.title ?? ""} />
        <input type="hidden" name="slug" value={story.slug ?? ""} />
        <input type="hidden" name="excerpt" value={story.excerpt ?? ""} />
        <input type="hidden" name="content" value={story.content ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
        <input type="hidden" name="status" value={story.status} />
        <input type="hidden" name="category" value={story.category ?? ""} />
        <input type="hidden" name="provinceId" value={story.province_id ?? ""} />

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="aspect-video bg-slate-100">
              {imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreviewUrl} alt="Cover preview" className="h-full w-full object-cover" />
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
                    setCoverStoragePath("");
                  }}
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  เอาออก
                </button>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            ใช้ปุ่ม &ldquo;เลือกจาก Media Library&rdquo; ด้านบนเพื่อเลือกรูปภาพที่อัปโหลดไว้แล้ว หรืออัปโหลดรูปใหม่ผ่าน Media Library โดยตรง การวาง URL ด้วยตนเองไม่รองรับในระบบปัจจุบัน
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกรูปภาพ" />
      </div>

      <input type="hidden" name="coverMediaId" value={currentMediaId ? String(currentMediaId) : ""} />
      <input type="hidden" name="coverMediaAction" value={coverMediaAction} />
      <input type="hidden" name="coverStoragePath" value={coverStoragePath} />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const mediaId = toFiniteMediaId(asset.id);
          setCurrentMediaId(mediaId);
          setImagePreviewUrl(asset.url);
          setCoverStoragePath(asset.storage_path);
          setCoverMediaAction("set");
        }}
        onSelect={() => {}}
        title="เลือกรูปภาพปกเรื่องราว"
      />
    </form>
  );
}

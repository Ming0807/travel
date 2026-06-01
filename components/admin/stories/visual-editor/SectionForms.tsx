"use client";

import { useActionState, useEffect, useState } from "react";
import { updateStoryAction } from "@/app/actions/admin-story-actions";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
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

export function HeaderForm({ story, onClose }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden required fields */}
        <input type="hidden" name="provinceId" value={story.province_id ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
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
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกข้อมูลหลัก" />
      </div>
    </form>
  );
}

export function ContentForm({ story, onClose }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden required fields */}
        <input type="hidden" name="title" value={story.title ?? ""} />
        <input type="hidden" name="slug" value={story.slug ?? ""} />
        <input type="hidden" name="excerpt" value={story.excerpt ?? ""} />
        <input type="hidden" name="provinceId" value={story.province_id ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
        <input type="hidden" name="category" value={story.category ?? ""} />

        <div className="space-y-4">
          <FormRichText label="เนื้อหาฉบับเต็ม" name="content" defaultValue={story.content ?? ""} minHeight={400} placeholder="เริ่มเขียนเนื้อหาบทความ..." />
        </div>
      </div>
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกเนื้อหา" />
      </div>
    </form>
  );
}

export function SettingsForm({ story, provinces = [], onClose }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, { success: false });

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden fields */}
        <input type="hidden" name="title" value={story.title ?? ""} />
        <input type="hidden" name="slug" value={story.slug ?? ""} />
        <input type="hidden" name="excerpt" value={story.excerpt ?? ""} />
        <input type="hidden" name="content" value={story.content ?? ""} />

        <div className="space-y-6">
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            เผยแพร่สู่สาธารณะ
            <input defaultChecked={story.is_published} name="isPublished" type="checkbox" value="true" className="h-4 w-4 accent-[#F3704C]" />
          </label>

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
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกการตั้งค่า" />
      </div>
    </form>
  );
}

export function CoverForm({ story, onClose, coverMediaId: cmId, coverMediaUrl: cmUrl, onCoverChange }: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, { success: false });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cmUrl ?? "");
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(cmId ?? null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => { if (state?.success) onClose(); }, [state?.success, onClose]);

  return (
    <form action={formAction} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={state?.error} fieldErrors={state?.fieldErrors} />
        
        {/* Hidden fields */}
        <input type="hidden" name="title" value={story.title ?? ""} />
        <input type="hidden" name="slug" value={story.slug ?? ""} />
        <input type="hidden" name="excerpt" value={story.excerpt ?? ""} />
        <input type="hidden" name="content" value={story.content ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
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
                  onClick={() => setImagePreviewUrl("")}
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  เอาออก
                </button>
              ) : null}
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">หรือป้อน URL โดยตรง</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={imagePreviewUrl}
              onChange={(e) => {
                setImagePreviewUrl(e.target.value);
                if (onCoverChange) onCoverChange(null, e.target.value);
              }}
              name="coverMediaId"
              placeholder="https://..."
            />
          </label>
        </div>
      </div>
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกรูปภาพ" />
      </div>

      <input type="hidden" name="coverMediaId" value={currentMediaId ?? ""} />

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectAsset={(asset) => {
          const mediaId = Number(asset.id);
          setCurrentMediaId(mediaId);
          setImagePreviewUrl(asset.url);
          if (onCoverChange) onCoverChange(mediaId, asset.url);
        }}
        onSelect={(url) => setImagePreviewUrl(url)}
        title="เลือกรูปภาพปกเรื่องราว"
      />
    </form>
  );
}

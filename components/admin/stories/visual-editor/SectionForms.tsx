"use client";

import { useActionState, useEffect } from "react";
import { updateStoryAction } from "@/app/actions/admin-story-actions";
import { AdminFormErrorSummary, AdminSaveBar } from "@/components/admin/forms/AdminFormUX";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

type SectionFormProps = {
  story: AdminStoryRow;
  onClose: () => void;
  provinces?: { province_id: number; province_name_th: string }[];
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
        <input type="hidden" name="imageUrl" value={story.image_url ?? ""} />
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
        <input type="hidden" name="imageUrl" value={story.image_url ?? ""} />
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
        <input type="hidden" name="category" value={story.category ?? ""} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">เนื้อหาฉบับเต็ม</span>
            <textarea className="mt-2 min-h-[300px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.content ?? ""} name="content" />
          </label>
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
        <input type="hidden" name="imageUrl" value={story.image_url ?? ""} />

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

export function CoverForm({ story, onClose }: SectionFormProps) {
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
        <input type="hidden" name="isPublished" value={story.is_published ? "true" : "false"} />
        <input type="hidden" name="category" value={story.category ?? ""} />
        <input type="hidden" name="provinceId" value={story.province_id ?? ""} />

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">รูปภาพปก (URL)</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={story.image_url ?? ""} name="imageUrl" placeholder="https://..." />
          </label>
        </div>
      </div>
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <AdminSaveBar cancelHref="#" isPending={isPending} onCancel={onClose} submitLabel="บันทึกรูปภาพ" />
      </div>
    </form>
  );
}

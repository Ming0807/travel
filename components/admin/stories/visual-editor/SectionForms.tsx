"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { saveStoryEditorialChangeAction, updateStoryAction } from "@/app/actions/admin-story-actions";
import { AdminFormErrorSummary, AdminSaveBar, type AdminFormActionState } from "@/components/admin/forms/AdminFormUX";
import { FormRichText } from "@/components/admin/forms/FormRichText";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import { storyDocumentSchema, type StoryDocument } from "@/lib/content/story-document";
import {
  parseStoryDraftRecovery,
  shouldOfferStoryDraftRecovery,
  storyDraftRecoveryKey,
  type StoryDraftRecovery,
} from "@/lib/content/story-draft-recovery";

type SectionFormProps = {
  story: AdminStoryRow;
  onClose: () => void;
  provinces?: { province_id: number; province_name_th: string }[];
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  onCoverChange?: (mediaId: number | null, mediaUrl: string | null) => void;
  onContentSaved?: (html: string, document: StoryDocument) => void;
  onDirtyChange?: (isDirty: boolean) => void;
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

function readingMinutesFromHtml(html: string): number | null {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return Math.max(1, Math.min(120, Math.ceil(text.split(" ").length / 220)));
}

export function ContentForm({ story, onClose, onContentSaved, onDirtyChange }: SectionFormProps) {
  const parsedDocument = storyDocumentSchema.safeParse(story.content_document);
  const initialDocument = parsedDocument.success ? parsedDocument.data as StoryDocument : null;
  const initialHtml = story.content ?? "";
  const initialVersion = story.updated_at ?? story.created_at;
  const [html, setHtml] = useState(initialHtml);
  const [document, setDocument] = useState<StoryDocument | null>(initialDocument);
  const [savedHtml, setSavedHtml] = useState(initialHtml);
  const [savedDocument, setSavedDocument] = useState<StoryDocument | null>(initialDocument);
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(initialVersion);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<StoryDraftRecovery | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const editorInitializedRef = useRef(false);
  const isDirty = html !== savedHtml || JSON.stringify(document) !== JSON.stringify(savedDocument);
  const storageKey = storyDraftRecoveryKey(story.story_id);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const candidate = parseStoryDraftRecovery(localStorage.getItem(storageKey));
        if (shouldOfferStoryDraftRecovery(candidate, {
          storyId: story.story_id,
          updatedAt: initialVersion,
          html: initialHtml,
        })) setRecovery(candidate);
      } catch {
        // Local recovery is optional; storage failures must not block editing.
      }
    });
  }, [initialHtml, initialVersion, storageKey, story.story_id]);

  useEffect(() => {
    if (!isDirty || !document) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          storyId: story.story_id,
          baseUpdatedAt: expectedUpdatedAt,
          html,
          document,
          savedAt: new Date().toISOString(),
        }));
      } catch {
        // The server save remains available when browser storage is unavailable.
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [document, expectedUpdatedAt, html, isDirty, storageKey, story.story_id]);

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeLeave = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [isDirty]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
    return () => onDirtyChange?.(false);
  }, [isDirty, onDirtyChange]);

  const handleEditorChange = useCallback((value: { html: string; document: StoryDocument | null }) => {
    if (!editorInitializedRef.current) {
      editorInitializedRef.current = true;
      setHtml(value.html);
      setDocument(value.document);
      if (!initialDocument) {
        setSavedHtml(value.html);
        setSavedDocument(value.document);
      }
      return;
    }
    setHtml(value.html);
    setDocument(value.document);
    setError(null);
  }, [initialDocument]);

  const discardRecovery = () => {
    try { localStorage.removeItem(storageKey); } catch { /* optional browser storage */ }
    setRecovery(null);
  };

  const handleSave = async () => {
    if (!document || !isDirty) return;
    setIsPending(true);
    setError(null);
    const result = await saveStoryEditorialChangeAction({
      storyId: story.story_id,
      expectedUpdatedAt,
      change: {
        legacyContent: html,
        contentDocument: document,
        contentSchemaVersion: 1,
        readingMinutes: readingMinutesFromHtml(html),
        changeSummary: "แก้ไขเนื้อหาบทความ",
      },
    });
    setIsPending(false);
    if (!result.success || !result.data) {
      setError(result.error ?? "ยังบันทึกเนื้อหาไม่ได้ กรุณาลองอีกครั้ง");
      return;
    }
    setExpectedUpdatedAt(result.data.updatedAt);
    setSavedHtml(html);
    setSavedDocument(document);
    discardRecovery();
    onContentSaved?.(html, document);
    onClose();
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่")) return;
    onClose();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
        <AdminFormErrorSummary error={error} />
        {recovery ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-black">พบเนื้อหาที่กู้คืนได้จากเครื่องนี้</p>
            <p className="mt-1 leading-6">บันทึกอัตโนมัติเมื่อ {new Date(recovery.savedAt).toLocaleString("th-TH")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setHtml(recovery.html);
                  setDocument(recovery.document);
                  setEditorKey((value) => value + 1);
                  setRecovery(null);
                }}
                className="min-h-11 rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800"
              >
                กู้คืนเนื้อหา
              </button>
              <button type="button" onClick={discardRecovery} className="min-h-11 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-950 hover:bg-amber-100">
                ใช้ฉบับบนเซิร์ฟเวอร์
              </button>
            </div>
          </div>
        ) : null}
        {isDirty ? <p className="text-sm font-bold text-amber-800">มีการแก้ไขที่ยังไม่ได้บันทึก</p> : null}
        <FormRichText
          key={editorKey}
          label="เนื้อหาฉบับเต็ม"
          name="content"
          defaultValue={html}
          defaultDocument={document}
          documentName="contentDocument"
          minHeight={400}
          placeholder="เริ่มเขียนเนื้อหาบทความ..."
          onValueChange={handleEditorChange}
        />
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4">
        <AdminSaveBar
          isPending={isPending}
          disabled={!isDirty || !document}
          onCancel={handleCancel}
          onSubmit={handleSave}
          submitLabel="บันทึกเนื้อหา"
          secondary={<span className="text-xs font-semibold text-slate-500">บันทึกแต่ละครั้งจะสร้างประวัติการแก้ไข</span>}
        />
      </div>
    </div>
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

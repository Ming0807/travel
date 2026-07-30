"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { saveStoryEditorialChangeAction, updateStoryAction } from "@/app/actions/admin-story-actions";
import { AdminFormErrorSummary, AdminSaveBar, type AdminFormActionState } from "@/components/admin/forms/AdminFormUX";
import { FormRichText } from "@/components/admin/forms/FormRichText";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import { storyDocumentSchema, type StoryDocument } from "@/lib/content/story-document";
import { getStoryStatusPresentation } from "@/lib/content/story-library";
import {
  getAllowedStoryTransitions,
  normalizeLegacyStoryStatus,
  type StoryStatus,
} from "@/lib/content/story-workflow";
import {
  parseStoryDraftRecovery,
  shouldOfferStoryDraftRecovery,
  storyDraftRecoveryKey,
  type StoryDraftRecovery,
} from "@/lib/content/story-draft-recovery";

type SectionFormProps = {
  story: AdminStoryRow;
  onClose: () => void;
  expectedUpdatedAt?: string;
  provinces?: { province_id: number; province_name_th: string }[];
  topics?: {
    id: number;
    key: string;
    nameTh: string;
    nameEn: string | null;
  }[];
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
  onCoverChange?: (mediaId: number | null, mediaUrl: string | null) => void;
  onContentSaved?: (html: string, document: StoryDocument) => void;
  onEditorialSaved?: (result: {
    updatedAt: string;
    revisionNumber: number;
    patch: Partial<AdminStoryRow>;
  }) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

function toFiniteMediaId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function HeaderForm({
  story,
  onClose,
  expectedUpdatedAt = story.updated_at ?? story.created_at,
  onEditorialSaved,
}: SectionFormProps) {
  const [title, setTitle] = useState(story.title ?? "");
  const [excerpt, setExcerpt] = useState(story.excerpt ?? "");
  const [slug, setSlug] = useState(story.slug ?? "");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDirty =
    title !== (story.title ?? "") ||
    excerpt !== (story.excerpt ?? "") ||
    slug !== (story.slug ?? "");

  const handleSave = async () => {
    if (!isDirty || !title.trim() || !slug.trim()) return;
    setIsPending(true);
    setError(null);
    const result = await saveStoryEditorialChangeAction({
      storyId: story.story_id,
      expectedUpdatedAt,
      change: {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        changeSummary: "แก้ไขข้อมูลหลักของบทความ",
      },
    });
    setIsPending(false);
    if (!result.success || !result.data) {
      setError(result.error ?? "ยังบันทึกข้อมูลหลักไม่ได้ กรุณาลองอีกครั้ง");
      return;
    }
    onEditorialSaved?.({
      ...result.data,
      patch: {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        updated_at: result.data.updatedAt,
      },
    });
    onClose();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
        <AdminFormErrorSummary error={error} />
        {isDirty ? <p className="text-sm font-bold text-amber-800">มีการแก้ไขที่ยังไม่ได้บันทึก</p> : null}

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อบทความ *</span>
            <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">เกริ่นนำ</span>
            <textarea className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={4} maxLength={2000} />
            <span className="mt-1 block text-xs text-slate-500">{excerpt.length}/2,000 ตัวอักษร</span>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Slug *</span>
            <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
            <span className="mt-1 block text-xs leading-5 text-slate-500">ใช้ตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลาง เช่น pattani-old-town</span>
          </label>
        </div>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4">
        <AdminSaveBar isPending={isPending} disabled={!isDirty || !title.trim() || !slug.trim()} onCancel={onClose} onSubmit={handleSave} submitLabel="บันทึกข้อมูลหลัก" />
      </div>
    </div>
  );
}

function readingMinutesFromHtml(html: string): number | null {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return Math.max(1, Math.min(120, Math.ceil(text.split(" ").length / 220)));
}

export function ContentForm({
  story,
  onClose,
  onContentSaved,
  onDirtyChange,
  onEditorialSaved,
  expectedUpdatedAt = story.updated_at ?? story.created_at,
}: SectionFormProps) {
  const parsedDocument = storyDocumentSchema.safeParse(story.content_document);
  const initialDocument = parsedDocument.success ? parsedDocument.data as StoryDocument : null;
  const initialHtml = story.content ?? "";
  const initialVersion = expectedUpdatedAt;
  const [html, setHtml] = useState(initialHtml);
  const [document, setDocument] = useState<StoryDocument | null>(initialDocument);
  const [savedHtml, setSavedHtml] = useState(initialHtml);
  const [savedDocument, setSavedDocument] = useState<StoryDocument | null>(initialDocument);
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
          baseUpdatedAt: initialVersion,
          html,
          document,
          savedAt: new Date().toISOString(),
        }));
      } catch {
        // The server save remains available when browser storage is unavailable.
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [document, html, initialVersion, isDirty, storageKey, story.story_id]);

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
      expectedUpdatedAt: initialVersion,
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
    setSavedHtml(html);
    setSavedDocument(document);
    discardRecovery();
    onContentSaved?.(html, document);
    onEditorialSaved?.({
      ...result.data,
      patch: {
        content: html,
        content_document: document,
        content_schema_version: 1,
        reading_minutes: readingMinutesFromHtml(html),
        updated_at: result.data.updatedAt,
      },
    });
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

function toLocalDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const workflowActionLabels: Record<StoryStatus, string> = {
  draft: "กลับเป็นฉบับร่าง",
  submitted: "ส่งตรวจอีกครั้ง",
  in_review: "ส่งตรวจ",
  changes_requested: "ขอข้อมูลเพิ่ม",
  approved: "อนุมัติ",
  scheduled: "ตั้งเวลาเผยแพร่",
  published: "เผยแพร่",
  rejected: "ไม่อนุมัติ",
  archived: "เก็บถาวร",
};

export function SettingsForm({
  story,
  provinces = [],
  topics = [],
  onClose,
  expectedUpdatedAt = story.updated_at ?? story.created_at,
  onEditorialSaved,
}: SectionFormProps) {
  const initialTopicIds = story.topic_ids ?? [];
  const [geographicScope, setGeographicScope] = useState<"province" | "cross_province">(story.geographic_scope ?? "province");
  const [provinceId, setProvinceId] = useState(story.province_id?.toString() ?? "");
  const [topicIds, setTopicIds] = useState<number[]>(initialTopicIds);
  const [primaryLanguage, setPrimaryLanguage] = useState<"th" | "en" | "ms">(story.primary_language ?? "th");
  const [seoTitle, setSeoTitle] = useState(story.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(story.seo_description ?? "");
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTime(story.scheduled_at));
  const [isPending, setIsPending] = useState(false);
  const [workflowPendingTarget, setWorkflowPendingTarget] = useState<StoryStatus | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const status = getStoryStatusPresentation(story.status);
  const authorType = story.author_type === "tourist" ? "tourist" : "admin";
  const currentStatus = normalizeLegacyStoryStatus(authorType, story.status);
  const allowedTransitions = getAllowedStoryTransitions(authorType, currentStatus);
  const needsReviewNote =
    authorType === "tourist" &&
    currentStatus === "in_review";
  const comparable = JSON.stringify({
    geographicScope,
    provinceId: geographicScope === "cross_province" ? "" : provinceId,
    topicIds: [...topicIds].sort((a, b) => a - b),
    primaryLanguage,
    seoTitle,
    seoDescription,
    scheduledAt,
  });
  const initialComparable = JSON.stringify({
    geographicScope: story.geographic_scope ?? "province",
    provinceId: (story.geographic_scope ?? "province") === "cross_province" ? "" : story.province_id?.toString() ?? "",
    topicIds: [...initialTopicIds].sort((a, b) => a - b),
    primaryLanguage: story.primary_language ?? "th",
    seoTitle: story.seo_title ?? "",
    seoDescription: story.seo_description ?? "",
    scheduledAt: toLocalDateTime(story.scheduled_at),
  });
  const isDirty = comparable !== initialComparable;

  const handleSave = async () => {
    if (!isDirty) return;
    setIsPending(true);
    setError(null);
    const normalizedProvinceId =
      geographicScope === "cross_province" || !provinceId ? null : Number(provinceId);
    const normalizedScheduledAt = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    const result = await saveStoryEditorialChangeAction({
      storyId: story.story_id,
      expectedUpdatedAt,
      change: {
        provinceId: normalizedProvinceId,
        geographicScope,
        topicIds,
        primaryLanguage,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        scheduledAt: normalizedScheduledAt,
        changeSummary: "แก้ไขข้อมูลประกอบและ SEO",
      },
    });
    setIsPending(false);
    if (!result.success || !result.data) {
      setError(result.error ?? "ยังบันทึกข้อมูลประกอบไม่ได้ กรุณาลองอีกครั้ง");
      return;
    }
    onEditorialSaved?.({
      ...result.data,
      patch: {
        province_id: normalizedProvinceId,
        geographic_scope: geographicScope,
        topic_ids: [...topicIds],
        primary_language: primaryLanguage,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        scheduled_at: normalizedScheduledAt,
        updated_at: result.data.updatedAt,
      },
    });
    onClose();
  };

  const handleWorkflowTransition = async (targetStatus: StoryStatus) => {
    if (isDirty) {
      setError("บันทึกข้อมูลประกอบที่แก้ไขก่อนเปลี่ยนสถานะ");
      return;
    }
    const requiresNote =
      authorType === "tourist" &&
      (targetStatus === "changes_requested" || targetStatus === "rejected");
    if (requiresNote && !reviewNote.trim()) return;
    if (targetStatus === "scheduled" && !scheduledAt) {
      setError("กำหนดวันและเวลาก่อนตั้งเวลาเผยแพร่");
      return;
    }
    if (
      (targetStatus === "published" || targetStatus === "archived") &&
      !window.confirm(
        targetStatus === "published"
          ? "ยืนยันเผยแพร่บทความนี้ต่อสาธารณะหรือไม่"
          : "ยืนยันเก็บบทความนี้ไว้ในคลังถาวรหรือไม่"
      )
    ) {
      return;
    }

    setWorkflowPendingTarget(targetStatus);
    setError(null);
    const targetPresentation = getStoryStatusPresentation(targetStatus);
    const result = await saveStoryEditorialChangeAction({
      storyId: story.story_id,
      expectedUpdatedAt,
      change: {
        targetStatus,
        reviewNote: requiresNote ? reviewNote.trim() : null,
        ...(targetStatus === "scheduled"
          ? { scheduledAt: new Date(scheduledAt).toISOString() }
          : {}),
        changeSummary: `เปลี่ยนสถานะเป็น ${targetPresentation.label}`,
      },
    });
    setWorkflowPendingTarget(null);
    if (!result.success || !result.data) {
      setError(result.error ?? "ยังเปลี่ยนสถานะไม่ได้ กรุณาตรวจความพร้อมแล้วลองอีกครั้ง");
      return;
    }
    onEditorialSaved?.({
      ...result.data,
      patch: {
        status: targetStatus,
        is_published: targetStatus === "published",
        updated_at: result.data.updatedAt,
      },
    });
    onClose();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-6">
        <AdminFormErrorSummary error={error} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500">สถานะเวิร์กโฟลว์</p>
          <p className="mt-1 font-black text-[#073F37]">{status.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">การส่งตรวจ อนุมัติ ตั้งเวลา และเผยแพร่ใช้ปุ่มเวิร์กโฟลว์โดยเฉพาะ เพื่อป้องกันการข้ามขั้นตอน</p>
          {needsReviewNote ? (
            <label className="mt-4 block">
              <span className="text-xs font-bold text-slate-700">เหตุผลประกอบการตรวจ</span>
              <textarea
                aria-label="เหตุผลประกอบการตรวจ"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="ระบุสิ่งที่ต้องแก้ไขหรือเหตุผลที่ไม่อนุมัติ"
              />
            </label>
          ) : null}
          {allowedTransitions.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {allowedTransitions.map((targetStatus) => {
                const requiresNote =
                  authorType === "tourist" &&
                  (targetStatus === "changes_requested" ||
                    targetStatus === "rejected");
                const disabled =
                  isPending ||
                  workflowPendingTarget !== null ||
                  isDirty ||
                  (requiresNote && !reviewNote.trim()) ||
                  (targetStatus === "scheduled" && !scheduledAt);
                return (
                  <button
                    key={targetStatus}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleWorkflowTransition(targetStatus)}
                    className={`min-h-11 rounded-lg px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      targetStatus === "published"
                        ? "bg-[#073F37] text-white hover:bg-[#0A6B62]"
                        : targetStatus === "rejected" ||
                            targetStatus === "archived"
                          ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {workflowPendingTarget === targetStatus
                      ? "กำลังเปลี่ยนสถานะ..."
                      : workflowActionLabels[targetStatus]}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs font-bold text-slate-500">
              สถานะนี้ไม่มีขั้นตอนถัดไป
            </p>
          )}
          {isDirty ? (
            <p className="mt-3 text-xs font-bold text-amber-800">
              บันทึกข้อมูลประกอบก่อนใช้คำสั่งเวิร์กโฟลว์
            </p>
          ) : null}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-black text-slate-800">ขอบเขตพื้นที่</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["province", "จังหวัดเดียว"],
              ["cross_province", "หลายจังหวัด"],
            ] as const).map(([value, label]) => (
              <label key={value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-bold ${geographicScope === value ? "border-[#0A6B62] bg-[#E6F4EF] text-[#073F37]" : "border-slate-200 bg-white text-slate-600"}`}>
                <input className="sr-only" type="radio" name="geographicScope" value={value} checked={geographicScope === value} onChange={() => setGeographicScope(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {geographicScope === "province" ? (
          <label className="block">
            <span className="text-sm font-bold text-slate-700">จังหวัดหลัก</span>
            <select aria-label="จังหวัดหลัก" className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={provinceId} onChange={(event) => setProvinceId(event.target.value)}>
              <option value="">ยังไม่ระบุ</option>
              {provinces.map((province) => <option key={province.province_id} value={province.province_id}>{province.province_name_th}</option>)}
            </select>
          </label>
        ) : null}

        <fieldset>
          <legend className="text-sm font-black text-slate-800">หัวข้อเนื้อหา</legend>
          <p className="mt-1 text-xs leading-5 text-slate-500">เลือกได้หลายหัวข้อ เพื่อช่วยค้นหาและแนะนำบทความที่เกี่ยวข้อง</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {topics.length ? topics.map((topic) => (
              <label key={topic.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={topicIds.includes(topic.id)}
                  onChange={(event) => setTopicIds((current) => event.target.checked ? [...current, topic.id] : current.filter((id) => id !== topic.id))}
                  className="h-4 w-4 accent-[#0A6B62]"
                />
                {topic.nameTh}
              </label>
            )) : <p className="text-sm text-amber-800">ยังไม่มีหัวข้อที่เปิดใช้งาน</p>}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">ภาษาหลัก</span>
          <select className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={primaryLanguage} onChange={(event) => setPrimaryLanguage(event.target.value as "th" | "en" | "ms")}>
            <option value="th">ไทย</option>
            <option value="en">อังกฤษ</option>
            <option value="ms">มลายู</option>
          </select>
        </label>

        <div className="space-y-4 border-t border-slate-200 pt-6">
          <div>
            <h3 className="text-sm font-black text-slate-800">ข้อมูลสำหรับการค้นหา</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">ข้อความนี้ใช้กับ search engine และการแชร์ลิงก์ ไม่เปลี่ยนเนื้อหาบนหน้าบทความ</p>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">ชื่อสำหรับผลการค้นหา</span>
            <input aria-label="ชื่อสำหรับผลการค้นหา" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} maxLength={255} placeholder={story.title} />
            <span className="mt-1 block text-xs text-slate-500">{seoTitle.length}/255 ตัวอักษร</span>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">คำอธิบายสำหรับผลการค้นหา</span>
            <textarea aria-label="คำอธิบายสำหรับผลการค้นหา" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} rows={4} maxLength={500} />
            <span className="mt-1 block text-xs text-slate-500">{seoDescription.length}/500 ตัวอักษร</span>
          </label>
        </div>

        <label className="block border-t border-slate-200 pt-6">
          <span className="text-sm font-bold text-slate-700">เวลาที่ต้องการเผยแพร่</span>
          <input type="datetime-local" className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
          <span className="mt-1 block text-xs leading-5 text-slate-500">การกำหนดเวลานี้ยังไม่เปลี่ยนสถานะ ต้องใช้คำสั่ง “ตั้งเวลาเผยแพร่” ในขั้นตอนเวิร์กโฟลว์</span>
        </label>
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4">
        <AdminSaveBar isPending={isPending} disabled={!isDirty} onCancel={onClose} onSubmit={handleSave} submitLabel="บันทึกข้อมูลประกอบ" />
      </div>
    </div>
  );
}

export function CoverForm({
  story,
  onClose,
  coverMediaId: cmId,
  coverMediaUrl: cmUrl,
  onCoverChange,
  onEditorialSaved,
}: SectionFormProps) {
  const action = updateStoryAction.bind(null, story.story_id);
  const [state, formAction, isPending] = useActionState<AdminFormActionState<{ id: number; slug: string; updatedAt?: string }>, FormData>(action, { success: false });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(cmUrl ?? "");
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(() => toFiniteMediaId(cmId));
  const [coverMediaAction, setCoverMediaAction] = useState<"none" | "set" | "clear">("none");
  const [coverStoragePath, setCoverStoragePath] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isDirty = currentMediaId !== toFiniteMediaId(cmId) || imagePreviewUrl !== (cmUrl ?? "");

  useEffect(() => {
    if (state?.success) {
      if (onCoverChange) onCoverChange(currentMediaId, imagePreviewUrl || null);
      if (state.data?.updatedAt) {
        onEditorialSaved?.({
          updatedAt: state.data.updatedAt,
          revisionNumber: 0,
          patch: { updated_at: state.data.updatedAt },
        });
      }
      onClose();
    }
  }, [currentMediaId, imagePreviewUrl, onClose, onCoverChange, onEditorialSaved, state.data?.updatedAt, state?.success]);

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

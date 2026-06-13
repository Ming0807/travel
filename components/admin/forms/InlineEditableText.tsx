"use client";

import type { CSSProperties, KeyboardEvent, Ref } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Check, Spinner, X } from "@phosphor-icons/react";
import { updateAttractionFieldAction } from "@/app/actions/admin-attraction-actions";

type InlineEditableTextProps = {
  value: string;
  fieldName: string;
  attractionId: number;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  className?: string;
  inputClassName?: string;
  whiteSpace?: CSSProperties["whiteSpace"];
  onSave?: (fieldName: string, newValue: string) => void;
  undoTimeout?: number;
};

export function InlineEditableText({
  value,
  fieldName,
  attractionId,
  placeholder = "คลิกเพื่อแก้ไข",
  multiline = false,
  maxLength,
  className = "",
  inputClassName = "",
  whiteSpace = "pre-wrap",
  onSave,
  undoTimeout = 10000,
}: InlineEditableTextProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const undoDataRef = useRef<{ previousValue: string } | null>(null);
  const undoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentValue(value);
     
    if (!isEditing) setDraft(value);
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      if (undoDismissTimerRef.current) clearTimeout(undoDismissTimerRef.current);
    };
  }, []);

  const flashSaved = useCallback(
    (undoMs: number) => {
      setSaved(true);
      setUndoAvailable(true);
      if (undoDismissTimerRef.current) clearTimeout(undoDismissTimerRef.current);
      undoDismissTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setUndoAvailable(false);
        setSaved(false);
        undoDataRef.current = null;
      }, undoMs);
    },
    []
  );

  const dismissUndo = useCallback(() => {
    setUndoAvailable(false);
    undoDataRef.current = null;
    if (undoDismissTimerRef.current) clearTimeout(undoDismissTimerRef.current);
  }, []);

  const saveValue = useCallback(
    async (nextValue: string, previousValue: string, undoMs: number) => {
      setIsSaving(true);
      setError(null);

      try {
        const result = await updateAttractionFieldAction(attractionId, fieldName, nextValue);
        if (!isMountedRef.current) return false;

        if (!result.success) {
          setError(result.error ?? "ยังบันทึกไม่ได้ กรุณาลองอีกครั้ง");
          return false;
        }

        setCurrentValue(nextValue);
        setDraft(nextValue);
        setIsEditing(false);
        undoDataRef.current = { previousValue };
        flashSaved(undoMs);
        onSave?.(fieldName, nextValue);
        return true;
      } catch {
        if (isMountedRef.current) {
          setError("เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง");
        }
        return false;
      } finally {
        if (isMountedRef.current) setIsSaving(false);
      }
    },
    [attractionId, fieldName, flashSaved, onSave]
  );

  const handleSave = useCallback(async () => {
    const trimmed = draft.trim();
    if (trimmed === currentValue) {
      setIsEditing(false);
      return;
    }

    await saveValue(trimmed, currentValue, undoTimeout);
  }, [currentValue, draft, saveValue, undoTimeout]);

  const handleUndo = useCallback(async () => {
    const undoEntry = undoDataRef.current;
    if (!undoEntry) return;

    const valueBeforeUndo = currentValue;
    dismissUndo();
    setSaved(false);
    await saveValue(undoEntry.previousValue, valueBeforeUndo, 1500);
  }, [currentValue, dismissUndo, saveValue]);

  const handleCancel = useCallback(() => {
    setDraft(currentValue);
    setIsEditing(false);
    setError(null);
  }, [currentValue]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
        return;
      }

      if (event.key === "Enter") {
        if (multiline && event.shiftKey) return;
        event.preventDefault();
        if (!isSaving) void handleSave();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        handleCancel();
      }
    },
    [handleCancel, handleSave, isSaving, multiline]
  );

  useEffect(() => {
    if (isEditing) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && undoAvailable && undoDataRef.current) {
        event.preventDefault();
        void handleUndo();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, isEditing, undoAvailable]);

  const scheduleBlurSave = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      if (!isSaving) void handleSave();
    }, 200);
  };

  if (isEditing) {
    const inputBaseClass =
      "w-full rounded-xl border-2 border-[#0A6B62] bg-white px-3 py-2 text-sm outline-none ring-4 ring-[#0A6B62]/10 transition-all";

    return (
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as Ref<HTMLTextAreaElement>}
            className={`${inputBaseClass} min-h-[80px] resize-y ${inputClassName}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={scheduleBlurSave}
            maxLength={maxLength}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as Ref<HTMLInputElement>}
            className={`${inputBaseClass} ${inputClassName}`}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={scheduleBlurSave}
            maxLength={maxLength}
            placeholder={placeholder}
          />
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A6B62] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#085A52] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Spinner size={14} className="animate-spin" weight="bold" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Check size={14} weight="bold" />
                บันทึก
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={14} weight="bold" />
            ยกเลิก
          </button>
          <span className="text-xs text-slate-400">
            {maxLength ? `${draft.length}/${maxLength} - ` : ""}
            {multiline ? "Enter บันทึก - Shift+Enter ขึ้นบรรทัดใหม่ - Escape ยกเลิก" : "Enter บันทึก - Escape ยกเลิก"}
          </span>
        </div>

        {error ? <p className="mt-1.5 text-xs font-bold text-rose-600">{error}</p> : null}
      </div>
    );
  }

  const isEmpty = !currentValue;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => {
          setDraft(currentValue);
          setIsEditing(true);
        }}
        className={`block w-full cursor-pointer text-left transition-all ${isEmpty ? "italic text-slate-400" : ""} ${className}`}
        style={{ whiteSpace }}
        title="คลิกเพื่อแก้ไข"
      >
        {currentValue || placeholder}
      </button>

      <div className="absolute right-0 top-0 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {saved && !undoAvailable ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            <Check size={12} weight="bold" />
            บันทึกแล้ว
          </span>
        ) : null}

        {undoAvailable ? (
          <button
            type="button"
            onClick={() => void handleUndo()}
            disabled={isSaving}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:opacity-50"
            title="ย้อนกลับการแก้ไขนี้"
          >
            <ArrowCounterClockwise size={12} weight="bold" />
            {isSaving ? "กำลังย้อนกลับ..." : "ย้อนกลับ"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

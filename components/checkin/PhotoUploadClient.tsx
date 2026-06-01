"use client";

import { useActionState, useState, useRef } from "react";
import { uploadVisitPhoto, type PhotoUploadState } from "@/app/actions/photo-actions";
import { Camera, Spinner, Image as ImageIcon, Trash } from "@phosphor-icons/react/dist/ssr";

const initialFormState: PhotoUploadState = {};

export function PhotoUploadClient({ visitId }: { visitId: string }) {
  const [state, formAction, isPending] = useActionState(uploadVisitPhoto.bind(null, visitId), initialFormState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น");
        return;
      }
      // Validate size
      if (file.size > 10 * 1024 * 1024) {
        alert("รูปภาพต้องมีขนาดไม่เกิน 10MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form action={formAction} className="w-full space-y-6">
      <input type="hidden" name="visitId" value={visitId} />

      {/* Error Summary */}
      {state?.message && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
          {state.message}
        </div>
      )}
      {state?.errors?._form && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
          {state.errors._form[0]}
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/10 bg-ink/[0.02] p-8 transition-all hover:border-coral/40 hover:bg-coral/[0.02]"
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Photo preview"
              className="max-h-64 w-full rounded-lg object-cover shadow-sm"
            />
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
              >
                <Trash size={14} />
                ลบรูป
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:bg-ink/5"
              >
                <ImageIcon size={14} />
                เปลี่ยนรูป
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-coral">
              <Camera size={32} weight="fill" />
            </div>
            <p className="text-base font-bold text-ink">แตะเพื่ออัปโหลดรูป</p>
            <p className="mt-1 text-xs text-muted">รูป JPEG, PNG หรือ WebP ขนาดไม่เกิน 10MB</p>
            <p className="mt-3 text-[11px] font-medium text-ink/40">หรือถ่ายรูปจากกล้องของคุณ</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {state?.errors?.photo && (
        <p className="text-xs font-medium text-red-500">{state.errors.photo[0]}</p>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-teal/5 border border-teal/10 p-4">
        <h4 className="text-sm font-bold text-teal mb-2">เคล็ดลับรูปสวย</h4>
        <ul className="space-y-1 text-xs text-ink/70">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-teal/50" />
            ใช้รูปที่ใบหน้าชัดเจน
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-teal/50" />
            หลีกเลี่ยงแสงย้อนหรือภาพมืด
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-teal/50" />
            รูปจะถูกแสดงบนใบประกาศดิจิทัลของคุณ
          </li>
        </ul>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedFile || isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Spinner className="animate-spin" size={20} />
            กำลังอัปโหลด...
          </>
        ) : (
          <>
            <ImageIcon weight="bold" size={22} />
            {selectedFile ? "อัปโหลดและไปต่อ" : "เลือกรูปก่อน"}
          </>
        )}
      </button>

      {/* Skip option */}
      <div className="text-center">
        <a
          href={`/visit/${visitId}/certificate/preview`}
          className="text-sm font-bold text-muted hover:text-coral transition-colors"
        >
          ข้ามขั้นตอนนี้ (ใบประกาศไม่มีรูป)
        </a>
      </div>
    </form>
  );
}

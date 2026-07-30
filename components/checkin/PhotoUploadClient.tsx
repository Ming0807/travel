"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatPhotoBytes,
  prepareVisitPhotoForUpload,
  validateVisitPhotoSource,
  type PreparedVisitPhoto,
} from "@/lib/media/client-photo-compression";
import { Camera, Spinner, Image as ImageIcon, Trash, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function PhotoUploadClient({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparedPhoto, setPreparedPhoto] = useState<PreparedVisitPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "preparing" | "uploading">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isBusy = stage !== "idle";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateVisitPhotoSource(file);
      if (validationError) {
        setError(validationError);
        e.currentTarget.value = "";
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setError(null);
      setPreparedPhoto(null);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setPreparedPhoto(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || isBusy) return;

    setError(null);
    setStage("preparing");

    try {
      const prepared = await prepareVisitPhotoForUpload(selectedFile);
      setPreparedPhoto(prepared);
      setStage("uploading");

      const formData = new FormData();
      formData.set("visitId", visitId);
      formData.set("file", prepared.file);

      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      if (response.status === 413) {
        throw new Error("รูปยังมีขนาดใหญ่เกินไปสำหรับการอัปโหลด กรุณาเลือกรูปอื่นหรือถ่ายใหม่ด้วยโหมดปกติ");
      }

      const payload = await response.json().catch(() => null) as { photoId?: string; error?: string } | null;
      if (!response.ok || !payload?.photoId) {
        throw new Error(payload?.error || "อัปโหลดรูปไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
      }

      router.push(`/visit/${visitId}/certificate/preview?photoId=${payload.photoId}`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
      setStage("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">

      {/* Upload Area */}
      <div
        onClick={() => !previewUrl && !isBusy && fileInputRef.current?.click()}
        className="relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/10 bg-ink/[0.02] p-6 transition-colors hover:border-coral/40 hover:bg-coral/[0.02] focus-within:border-coral"
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
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                <Trash size={14} />
                ลบรูป
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink/5 disabled:opacity-50"
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
            <p className="mt-1 text-sm text-muted">JPG, PNG, WebP หรือ HEIC สูงสุด 50MB</p>
            <p className="mt-2 text-xs font-medium text-ink/50">ระบบจะย่อรูปก่อนส่ง ช่วยประหยัดเน็ตและอัปโหลดเร็วขึ้น</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
              >
                <Camera size={18} weight="fill" /> ถ่ายรูป
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-bold text-ink"
              >
                <ImageIcon size={18} /> เลือกจากคลังรูปหรือไฟล์
              </button>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="photo"
          aria-label="เลือกจากคลังรูปหรือแอปไฟล์"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          aria-label="ถ่ายรูปด้วยกล้อง"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{selectedFile.name}</p>
            <p className="text-xs text-muted">
              ต้นฉบับ {formatPhotoBytes(selectedFile.size)}
              {preparedPhoto ? ` · เตรียมส่ง ${formatPhotoBytes(preparedPhoto.uploadBytes)}` : " · จะย่อก่อนอัปโหลด"}
            </p>
          </div>
          {stage !== "idle" && <Spinner className="shrink-0 animate-spin text-teal" size={20} aria-hidden="true" />}
        </div>
      )}

      {stage !== "idle" && (
        <p role="status" aria-live="polite" className="text-center text-sm font-medium text-teal">
          {stage === "preparing" ? "กำลังปรับขนาดรูปบนอุปกรณ์ของคุณ..." : "กำลังอัปโหลดรูปที่ปรับขนาดแล้ว..."}
        </p>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          <p>{error}</p>
        </div>
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
        disabled={!selectedFile || isBusy}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isBusy ? (
          <>
            <Spinner className="animate-spin" size={20} />
            {stage === "preparing" ? "กำลังปรับขนาดรูป..." : "กำลังอัปโหลด..."}
          </>
        ) : (
          <>
            <ImageIcon weight="bold" size={22} />
            {selectedFile ? "อัปโหลดและไปต่อ" : "เลือกรูปก่อน"}
          </>
        )}
      </button>

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

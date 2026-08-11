"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Image as ImageIcon,
  Spinner,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

import { CameraCaptureDialog } from "@/components/checkin/CameraCaptureDialog";
import {
  formatPhotoBytes,
  prepareVisitPhotoForUpload,
  validateVisitPhotoSource,
  type PreparedVisitPhoto,
} from "@/lib/media/client-photo-compression";

export function PhotoUploadClient({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparedPhoto, setPreparedPhoto] = useState<PreparedVisitPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "preparing" | "uploading">("idle");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const isBusy = stage !== "idle";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectFile = (file: File) => {
    const validationError = validateVisitPhotoSource(file);
    if (validationError) {
      setError(validationError);
      return false;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError(null);
    setPreparedPhoto(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !selectFile(file)) event.currentTarget.value = "";
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setPreparedPhoto(null);
    setError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = "";
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

      const payload = await response.json().catch(() => null) as {
        photoId?: string;
        error?: string;
      } | null;
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
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-lg font-black text-ink">เลือกรูปด้วยวิธีที่สะดวก</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          ปุ่มถ่ายรูปจะขอสิทธิ์กล้อง ส่วนปุ่มคลังรูปจะไม่เปิดกล้อง
        </p>
      </div>

      <div className="rounded-lg border border-teal/20 bg-teal/5 p-3">
        <Link
          href={`/visit/${visitId}/certificate/preview`}
          className="flex min-h-11 w-full items-center justify-center rounded-md border border-teal/30 bg-white px-4 py-2.5 text-sm font-bold text-teal transition-colors hover:border-teal"
        >
          ข้ามรูปภาพและสร้างใบประกาศ
        </Link>
        <p className="mt-2 text-center text-xs leading-5 text-slate-600">
          ใบประกาศไม่มีรูปส่วนตัว และตราประทับยังได้รับตามปกติ
        </p>
      </div>

      {previewUrl ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="ตัวอย่างรูปสำหรับใบประกาศ" className="max-h-80 w-full object-contain" />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Camera aria-hidden="true" size={18} weight="fill" />
              ถ่ายใหม่
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-ink disabled:opacity-50"
            >
              <ImageIcon aria-hidden="true" size={18} />
              เปลี่ยนจากคลัง
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={handleRemove}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 disabled:opacity-50"
            >
              <Trash aria-hidden="true" size={18} />
              ลบรูป
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-label="ถ่ายรูป"
              onClick={() => setIsCameraOpen(true)}
              className="flex min-h-24 items-center gap-4 rounded-md bg-ink px-5 py-4 text-left text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white/10">
                <Camera aria-hidden="true" size={24} weight="fill" />
              </span>
              <span>
                <span className="block font-black">ถ่ายรูป</span>
                <span className="mt-1 block text-xs leading-5 text-white/75">เปิดกล้องเมื่อคุณกดเท่านั้น</span>
              </span>
            </button>
            <button
              type="button"
              aria-label="เลือกจากคลังรูปหรือไฟล์"
              onClick={() => galleryInputRef.current?.click()}
              className="flex min-h-24 items-center gap-4 rounded-md border border-slate-300 bg-white px-5 py-4 text-left text-ink transition-colors hover:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
                <ImageIcon aria-hidden="true" size={24} weight="fill" />
              </span>
              <span>
                <span className="block font-black">เลือกจากคลังรูปหรือไฟล์</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">ไม่ขอสิทธิ์ใช้กล้อง</span>
              </span>
            </button>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            รองรับ JPG, PNG, WebP, HEIC และ HEIF สูงสุด 50MB ระบบจะย่อรูปบนอุปกรณ์ก่อนอัปโหลด
          </p>
        </div>
      )}

      <input
        ref={galleryInputRef}
        type="file"
        name="photo"
        aria-label="เลือกจากคลังรูปหรือแอปไฟล์"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileChange}
        className="sr-only"
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        aria-label="ถ่ายรูปด้วยกล้อง"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between gap-4 border-y border-slate-200 py-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">
              ต้นฉบับ {formatPhotoBytes(selectedFile.size)}
              {preparedPhoto
                ? ` · เตรียมส่ง ${formatPhotoBytes(preparedPhoto.uploadBytes)}`
                : " · จะย่อก่อนอัปโหลด"}
            </p>
          </div>
          {stage !== "idle" ? <Spinner className="shrink-0 animate-spin text-teal" size={20} aria-hidden="true" /> : null}
        </div>
      ) : null}

      {stage !== "idle" ? (
        <p role="status" aria-live="polite" className="text-center text-sm font-medium text-teal">
          {stage === "preparing" ? "กำลังปรับขนาดรูปบนอุปกรณ์ของคุณ..." : "กำลังอัปโหลดรูปที่ปรับขนาดแล้ว..."}
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          <WarningCircle aria-hidden="true" className="mt-0.5 shrink-0" size={20} weight="fill" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-bold text-teal">รูปที่เหมาะกับใบประกาศ</h3>
        <ul className="mt-2 grid gap-1 text-xs leading-5 text-slate-600 sm:grid-cols-2">
          <li>• ใบหน้าหรือจุดเด่นของภาพมองเห็นชัด</li>
          <li>• หลีกเลี่ยงภาพมืดหรือแสงย้อนมากเกินไป</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={!selectedFile || isBusy}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-4 text-base font-bold text-white transition-colors hover:bg-teal disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isBusy ? (
          <>
            <Spinner aria-hidden="true" className="animate-spin" size={20} />
            {stage === "preparing" ? "กำลังปรับขนาดรูป..." : "กำลังอัปโหลด..."}
          </>
        ) : (
          <>
            <ImageIcon aria-hidden="true" weight="bold" size={22} />
            {selectedFile ? "อัปโหลดรูปและสร้างใบประกาศ" : "เลือกรูปก่อน"}
          </>
        )}
      </button>

      {isCameraOpen ? (
        <CameraCaptureDialog
          onCapture={selectFile}
          onClose={() => setIsCameraOpen(false)}
          onNativeFallback={() => nativeCameraInputRef.current?.click()}
        />
      ) : null}
    </form>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadSimple, Image as ImageIcon, WarningCircle, CheckCircle, FileArrowDown } from "@phosphor-icons/react/dist/ssr";

export function PhotoUploadForm({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const validateFile = (selected: File): boolean => {
    setError(null);
    if (!selected) return false;

    if (selected.size > 5 * 1024 * 1024) {
      setError("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
      return false;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selected.type) && !selected.name.match(/\.(jpeg|jpg|png|webp)$/i)) {
      setError("รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น");
      return false;
    }

    return true;
  };

  const handleFile = (selected: File) => {
    if (!validateFile(selected)) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("visitId", visitId);

      const res = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Proceed to preview page
      router.push(`/visit/${visitId}/certificate/preview?photoId=${data.photoId}&previewUrl=${encodeURIComponent(data.previewUrl)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ กรุณาลองใหม่";
      setError(msg);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center animate-in fade-in duration-500 delay-100 fill-mode-both">
        <h3 className="text-xl font-bold text-ink">อัปโหลดรูปความทรงจำ</h3>
        <p className="text-sm text-ink-light mt-2">
          ใช้รูปนี้เฉพาะเพื่อสร้างใบประกาศ ไม่บังคับเปิดเผยสาธารณะ
        </p>
      </div>

      {!preview ? (
        <label
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-teal bg-teal/5 scale-[1.02] shadow-lg"
              : "border-gray-300 hover:border-coral hover:bg-cream/50 hover:scale-[1.01]"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 transition-transform duration-300">
            <div className={`mb-3 transition-all duration-300 ${isDragOver ? "scale-110 text-teal" : "text-gray-400"}`}>
              {isDragOver ? (
                <FileArrowDown size={48} weight="duotone" className="animate-bounce" />
              ) : (
                <UploadSimple size={48} />
              )}
            </div>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP (สูงสุด 5MB)</p>
          </div>
          <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-100 group animate-in fade-in zoom-in-95 duration-500">
          <Image src={preview} alt="Preview" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <label className="bg-white text-ink px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer flex items-center gap-2 shadow-lg hover:bg-cream transition-colors">
              <ImageIcon weight="fill" size={18} /> เปลี่ยนรูป
              <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            </label>
          </div>
          {/* Success indicator */}
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
            <CheckCircle size={18} weight="fill" />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full py-4 rounded-full bg-coral text-white font-bold text-base shadow-sm hover:bg-coral/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-2 transition-all"
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            กำลังอัปโหลด...
          </span>
        ) : (
          <>
            <CheckCircle weight="fill" size={20} /> ยืนยันรูปภาพ
          </>
        )}
      </button>
    </div>
  );
}

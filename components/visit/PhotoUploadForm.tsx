"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadSimple, Image as ImageIcon, WarningCircle, CheckCircle } from "@phosphor-icons/react";

export function PhotoUploadForm({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', { size: selected.size, type: selected.type, name: selected.name });

    if (selected.size > 5 * 1024 * 1024) {
      setError("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) && !selected.name.endsWith('.png')) {
      setError("รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
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
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-ink">อัปโหลดรูปความทรงจำ</h3>
        <p className="text-sm text-ink-light mt-2">
          ใช้รูปนี้เฉพาะเพื่อสร้างใบประกาศ ไม่บังคับเปิดเผยสาธารณะ
        </p>
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadSimple size={48} className="text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP (สูงสุด 5MB)</p>
          </div>
          <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-100">
          <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <label className="bg-white text-ink px-4 py-2 rounded-full font-medium cursor-pointer flex items-center gap-2">
              <ImageIcon weight="fill" /> เปลี่ยนรูป
              <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            </label>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
          <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full py-4 rounded-full bg-[#E18868] text-white font-bold text-base shadow-sm hover:bg-[#D07757] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all"
      >
        {isUploading ? (
          <>กำลังอัปโหลด...</>
        ) : (
          <>
            <CheckCircle weight="fill" size={20} /> ยืนยันรูปภาพ
          </>
        )}
      </button>
    </div>
  );
}

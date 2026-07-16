"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, UploadSimple, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

export function TemplateFormClient() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/admin/templates/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "ไม่สามารถอัปโหลดเทมเพลตได้");
      }

      await response.json();
      
      router.push("/admin/certificate-templates");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ไม่สามารถอัปโหลดเทมเพลตได้");
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link 
          href="/admin/certificate-templates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft weight="bold" />
          กลับไปหน้าเทมเพลต
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h1 className="text-lg font-bold text-slate-800">เพิ่มเทมเพลตเกียรติบัตร</h1>
          <p className="text-sm text-slate-500">อัปโหลดภาพพื้นหลังและกำหนดรูปแบบพื้นฐาน</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              ชื่อเทมเพลต
            </label>
            <input
              type="text"
              name="template_name"
              required
              className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
              placeholder="เช่น เทมเพลตความทรงจำจังหวัดยะลา"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                ภาษา
              </label>
              <select
                name="language"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
              >
                <option value="th">ภาษาไทย</option>
                <option value="en">ภาษาอังกฤษ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                ชุดสี
              </label>
              <select
                name="theme"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
              >
                <option value="emerald-gold">เขียวมรกตและทอง</option>
                <option value="blue-silver">น้ำเงินและเงิน</option>
                <option value="coral-white">คอรัลและขาว</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ภาพพื้นหลังแนวนอนความละเอียดสูง
            </label>
            <div className="relative flex justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 transition-colors hover:border-[#0A6B62]">
              <div className="text-center">
                {previewUrl ? (
                  <div className="relative mb-4 aspect-[1.414/1] w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-sm border border-slate-200">
                    <Image src={previewUrl} alt="ตัวอย่างภาพพื้นหลังเกียรติบัตร" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                )}
                <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white px-2 py-1 font-semibold text-[#0A6B62] hover:text-[#075049] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0A6B62] focus-within:ring-offset-2"
                  >
                    <span>เลือกไฟล์ภาพ</span>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      required
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs leading-5 text-slate-500">รองรับ PNG, JPG หรือ WebP สูงสุด 10MB ระบบจะปรับขนาดและแปลงไฟล์ก่อนบันทึก</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>กำลังบันทึก...</>
              ) : (
                <>
                  <UploadSimple weight="bold" />
                  บันทึกเทมเพลต
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

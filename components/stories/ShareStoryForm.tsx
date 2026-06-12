"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitTouristStoryAction } from "@/app/actions/tourist-story-actions";
import { CheckCircle, PaperPlaneRight, Warning } from "@phosphor-icons/react";
import { TiptapEditor } from "./TiptapEditor";

export function ShareStoryForm({
  provinces,
}: {
  provinces: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contentHtml, setContentHtml] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitTouristStoryAction(formData);

      if (result.success) {
        setSuccess(true);
        // Refresh page after a short delay
        setTimeout(() => {
          router.push("/stories");
          router.refresh();
        }, 3000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-slate-50 p-12 text-center border border-ink/10">
        <CheckCircle
          size={48}
          weight="fill"
          className="mx-auto text-ink mb-6"
        />
        <h3 className="text-2xl font-black text-ink mb-3">ส่งเรื่องราวเรียบร้อยแล้ว!</h3>
        <p className="text-ink/70 mb-8 max-w-sm mx-auto text-lg">
          ขอบคุณที่ร่วมแบ่งปันประสบการณ์การเดินทางของคุณ เรื่องราวของคุณถูกส่งไปตรวจสอบและจะได้รับการเผยแพร่เร็วๆ นี้
        </p>
        <p className="text-sm font-bold text-ink/50 uppercase tracking-widest">
          กำลังพากลับไปหน้าเรื่องราว...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 p-4 text-red-600 border border-red-100">
          <Warning size={20} weight="fill" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-bold text-ink uppercase tracking-widest mb-3"
        >
          หัวข้อเรื่องราว
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={100}
          placeholder="เช่น วันหยุดสุดสัปดาห์ที่เบตง"
          className="w-full border-b border-ink/20 bg-transparent px-0 py-4 text-2xl font-medium text-ink placeholder:text-ink/20 focus:border-ink focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="provinceId"
          className="block text-sm font-bold text-ink uppercase tracking-widest mb-3"
        >
          สถานที่ (จังหวัด)
        </label>
        <div className="relative">
          <select
            id="provinceId"
            name="provinceId"
            required
            className="w-full appearance-none border-b border-ink/20 bg-transparent px-0 py-4 text-lg font-medium text-ink focus:border-ink focus:outline-none transition-colors cursor-pointer rounded-none"
          >
            <option value="" disabled hidden>
              เลือกจังหวัด...
            </option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ink">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-bold text-ink uppercase tracking-widest mb-3"
        >
          เรื่องราวของคุณ
        </label>
        
        {/* Hidden textarea to capture HTML content for FormData */}
        <textarea
          id="content"
          name="content"
          required
          hidden
          readOnly
          value={contentHtml}
        />
        
        <TiptapEditor 
          content={contentHtml} 
          onChange={setContentHtml} 
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex w-full items-center justify-center gap-3 bg-ink py-5 text-sm font-bold text-white transition-all hover:bg-ink/80 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
      >
        {isSubmitting ? (
          "กำลังส่งข้อมูล..."
        ) : (
          <>
            ส่งเรื่องราวของคุณ{" "}
            <PaperPlaneRight
              size={18}
              weight="fill"
              className="transition-transform duration-300 ease-out group-hover:translate-x-1"
            />
          </>
        )}
      </button>
    </form>
  );
}

"use client";

import { useActionState, useState, useRef } from "react";
import { initiateCheckin, type MinimalFormState } from "@/app/actions/checkin-actions";
import { Spinner, Camera, CheckCircle } from "@phosphor-icons/react/dist/ssr";

const initialFormState: MinimalFormState = {};

export function MinimalForm({ checkinCode }: { checkinCode: string }) {
  const [state, formAction, isPending] = useActionState(initiateCheckin.bind(null, checkinCode), initialFormState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <form action={formAction} className="w-full space-y-6 animate-fade-in-up delay-200">
      {/* Error Summary */}
      {state?.message && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
          {state.message}
        </div>
      )}

      {/* Photo Upload */}
      <div className="bg-white rounded-2xl border border-ink/5 p-6 shadow-sm">
        <label className="text-sm font-bold text-ink mb-3 block">รูปถ่ายของคุณ <span className="text-muted font-normal">(ไม่บังคับ)</span></label>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/10 bg-ink/[0.02] p-8 transition-colors hover:border-coral/40 hover:bg-coral/[0.02]"
        >
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-3 text-xs font-bold text-red-500 hover:underline"
              >
                ลบรูป
              </button>
            </>
          ) : (
            <>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cream text-coral">
                <Camera size={28} weight="fill" />
              </div>
              <p className="text-sm font-bold text-ink">แตะเพื่ออัปโหลดรูป</p>
              <p className="mt-1 text-xs text-muted">รูป JPEG หรือ PNG ขนาดไม่เกิน 10MB</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-bold text-ink">
          ชื่อของคุณ <span className="text-coral">*</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="เช่น สมชาย ใจดี"
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3.5 text-sm text-ink outline-none transition-colors focus:border-coral/50 focus:ring-2 focus:ring-coral/10"
          required
        />
        {state?.errors?.displayName && (
          <p className="text-xs font-medium text-red-500">{state.errors.displayName[0]}</p>
        )}
      </div>

      {/* Origin */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="originCountry" className="text-sm font-bold text-ink">
            ประเทศ
          </label>
          <input
            id="originCountry"
            name="originCountry"
            type="text"
            defaultValue="Thailand"
            placeholder="ประเทศ"
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3.5 text-sm text-ink outline-none transition-colors focus:border-coral/50 focus:ring-2 focus:ring-coral/10"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="originProvince" className="text-sm font-bold text-ink">
            จังหวัดต้นทาง
          </label>
          <input
            id="originProvince"
            name="originProvince"
            type="text"
            placeholder="กรุงเทพ, เชียงใหม่..."
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3.5 text-sm text-ink outline-none transition-colors focus:border-coral/50 focus:ring-2 focus:ring-coral/10"
          />
        </div>
      </div>

      {/* Age Group */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-ink">ช่วงอายุ</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {[
            { value: "0-15", label: "0-15" },
            { value: "16-24", label: "16-24" },
            { value: "25-34", label: "25-34" },
            { value: "35-44", label: "35-44" },
            { value: "45-54", label: "45-54" },
            { value: "55-64", label: "55-64" },
            { value: "65+", label: "65+" },
          ].map((age) => (
            <label
              key={age.value}
              className="flex cursor-pointer flex-col items-center rounded-xl border border-ink/10 bg-white p-2 text-center text-xs font-semibold text-ink transition-colors has-[:checked]:border-coral has-[:checked]:bg-coral/5 has-[:checked]:text-coral hover:border-ink/20"
            >
              <input type="radio" name="ageGroup" value={age.value} className="sr-only" />
              {age.label}
            </label>
          ))}
        </div>
      </div>

      {/* Consent */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white border border-ink/5 p-4 transition-colors hover:border-ink/10">
        <input
          type="checkbox"
          name="hasConsented"
          value="true"
          className="mt-0.5 h-5 w-5 rounded-lg border-2 border-ink/20 text-coral focus:ring-coral/20"
          required
        />
        <div>
          <span className="text-sm font-medium text-ink">
            ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลตามนโยบายความเป็นส่วนตัว <span className="text-coral">*</span>
          </span>
          <p className="mt-1 text-xs text-muted">
            ข้อมูลของคุณจะถูกใช้เพื่อสร้างใบประกาศดิจิทัล และวิเคราะห์การท่องเที่ยวเท่านั้น
          </p>
        </div>
      </label>
      {state?.errors?.hasConsented && (
        <p className="text-xs font-medium text-red-500">{state.errors.hasConsented[0]}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-base font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Spinner className="animate-spin" size={20} />
            กำลังดำเนินการ...
          </>
        ) : (
          <>
            <CheckCircle weight="bold" size={22} />
            ยืนยันและสร้างใบประกาศ
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted font-medium">
        ใช้เวลาเพียง 1-2 นาที • ข้อมูลของคุณปลอดภัย
      </p>
    </form>
  );
}

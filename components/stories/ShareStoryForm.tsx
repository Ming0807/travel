"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Article,
  CheckCircle,
  Info,
  PaperPlaneRight,
  ShieldCheck,
  Warning,
} from "@phosphor-icons/react";
import { submitTouristStoryAction } from "@/app/actions/tourist-story-actions";

type ProvinceOption = { id: number; name: string };

export function ShareStoryForm({ provinces }: { provinces: ProvinceOption[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitTouristStoryAction(new FormData(event.currentTarget));
      if (result.success) {
        setSuccess(true);
        return;
      }
      setError(result.error || "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง");
    } catch {
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="border border-teal/20 bg-teal/5 px-6 py-10 text-center sm:px-10"
      >
        <CheckCircle size={48} weight="fill" className="mx-auto mb-5 text-teal" />
        <p className="mb-2 text-xs font-bold uppercase text-teal">รับเรื่องแล้ว</p>
        <h2 className="mb-3 text-2xl font-black text-ink">ส่งให้ทีมตรวจสอบแล้ว</h2>
        <p className="mx-auto mb-8 max-w-lg text-base leading-7 text-muted">
          เรื่องราวยังไม่เผยแพร่ทันที ทีมงานจะตรวจความเหมาะสมและความถูกต้องก่อนนำขึ้นหน้าเรื่องราว
        </p>
        <Link
          href="/stories"
          className="inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-6 text-sm font-bold text-white transition-colors hover:bg-white hover:text-ink"
        >
          กลับไปหน้าเรื่องราว
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate={false}>
      <div className="grid gap-3 border-y border-ink/10 py-5 sm:grid-cols-2">
        <div className="flex gap-3">
          <Article size={22} weight="duotone" className="mt-0.5 shrink-0 text-coral" />
          <div>
            <p className="font-bold text-ink">ส่งได้เฉพาะข้อความ</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              รูปจากใบประกาศหรือโปรไฟล์จะไม่ถูกแนบมากับเรื่องราวโดยอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShieldCheck size={22} weight="duotone" className="mt-0.5 shrink-0 text-teal" />
          <div>
            <p className="font-bold text-ink">ตรวจสอบก่อนแสดงผล</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              ทีมงานจะตรวจสอบก่อนเผยแพร่ และจะไม่แสดงชื่อบัญชีของคุณต่อสาธารณะ
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-red-700">
          <Warning size={20} weight="fill" className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold leading-6">{error}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-bold text-ink">
          หัวข้อเรื่องราว <span aria-hidden="true" className="text-coral">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={200}
          autoComplete="off"
          placeholder="เช่น เช้าวันฝนพรำที่ยะลา"
          className="min-h-12 w-full border border-ink/20 bg-white px-4 text-base font-medium text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink focus:ring-2 focus:ring-coral/20"
        />
        <p className="mt-2 text-xs text-muted">ตั้งชื่อให้ผู้อ่านเข้าใจว่าคุณพบอะไรจากการเดินทาง</p>
      </div>

      <div>
        <label htmlFor="provinceId" className="mb-2 block text-sm font-bold text-ink">
          จังหวัดของเรื่องราว <span aria-hidden="true" className="text-coral">*</span>
        </label>
        <select
          id="provinceId"
          name="provinceId"
          required
          defaultValue=""
          className="min-h-12 w-full border border-ink/20 bg-white px-4 text-base font-medium text-ink outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-coral/20"
        >
          <option value="" disabled>เลือกจังหวัด</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>{province.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-bold text-ink">
          เรื่องราวของคุณ <span aria-hidden="true" className="text-coral">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          maxLength={10000}
          rows={12}
          placeholder="เล่าบรรยากาศ สิ่งที่ค้นพบ หรือคำแนะนำจากประสบการณ์จริงของคุณ..."
          className="w-full resize-y border border-ink/20 bg-white px-4 py-4 text-base leading-7 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink focus:ring-2 focus:ring-coral/20"
        />
        <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>หลีกเลี่ยงเบอร์โทร ที่อยู่ หรือข้อมูลส่วนตัวของบุคคลอื่น เนื้อหาจะถูกเก็บเป็นข้อความธรรมดา</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border border-ink/15 bg-slate-50 p-4">
        <input
          type="checkbox"
          name="rightsConfirmed"
          value="true"
          required
          className="mt-1 h-5 w-5 shrink-0 accent-coral"
        />
        <span className="text-sm leading-6 text-ink">
          ฉันเป็นเจ้าของหรือได้รับอนุญาตให้แบ่งปันเนื้อหานี้ และเนื้อหาไม่ละเมิดสิทธิหรือความเป็นส่วนตัวของผู้อื่น
          <span className="mt-1 block text-xs text-muted">
            อ่านรายละเอียดใน <Link href="/terms#content-rights" className="font-bold text-teal underline underline-offset-2">เงื่อนไขการใช้บริการ</Link>
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex min-h-12 w-full items-center justify-center gap-3 bg-coral px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#C95C3F] disabled:cursor-wait disabled:opacity-65"
      >
        {isSubmitting ? "กำลังส่งให้ทีมตรวจสอบ..." : "ส่งให้ทีมตรวจสอบ"}
        {!isSubmitting ? <PaperPlaneRight size={18} weight="fill" aria-hidden="true" /> : null}
      </button>
    </form>
  );
}

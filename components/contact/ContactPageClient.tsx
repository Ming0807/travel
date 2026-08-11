"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bug,
  CheckCircle,
  Handshake,
  MapPin,
  PaperPlaneRight,
  ShieldCheck,
  Spinner,
  WarningCircle,
} from "@phosphor-icons/react";

type ContactValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const EMPTY_VALUES: ContactValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const supportedTopics = [
  { icon: Bug, title: "แจ้งปัญหาการใช้งาน", detail: "เช่น QR, การอัปโหลดรูป, ใบประกาศ หรือพาสปอร์ต" },
  { icon: MapPin, title: "เสนอแก้ไขข้อมูลสถานที่", detail: "ระบุหน้าหรือชื่อสถานที่ พร้อมรายละเอียดที่ควรตรวจสอบ" },
  { icon: Handshake, title: "สอบถามความร่วมมือ", detail: "สำหรับสถานที่ ผู้ประกอบการ หน่วยงาน หรือผู้ร่วมทดสอบระบบ" },
] as const;

function apiMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : null;
  }
  return null;
}

export function ContactPageClient() {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const isPending = submitState.kind === "pending";

  const updateValue = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (submitState.kind !== "idle" && submitState.kind !== "pending") {
      setSubmitState({ kind: "idle" });
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    setSubmitState({ kind: "pending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok || !(payload as { success?: unknown } | null)?.success) {
        throw new Error(apiMessage(payload) ?? "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง");
      }

      setSubmitState({ kind: "success", message: "ส่งข้อความเรียบร้อยแล้ว ผู้ดูแลสามารถตรวจสอบข้อความในระบบหลังบ้าน" });
      setValues(EMPTY_VALUES);
    } catch (error) {
      setSubmitState({
        kind: "error",
        message: error instanceof Error ? error.message : "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8F6] text-ink">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <header className="max-w-3xl border-b border-ink/15 pb-8">
          <p className="text-xs font-black uppercase text-coral">Contact the project</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">ติดต่อโครงการ</h1>
          <p className="mt-4 text-base leading-8 text-slate-700">
            ใช้แบบฟอร์มนี้เพื่อแจ้งปัญหา เสนอแก้ไขข้อมูล หรือสอบถามความร่วมมือ
            ข้อความจะถูกบันทึกในระบบหลังบ้านเพื่อให้ผู้ดูแลติดตาม
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section id="contact-form" aria-labelledby="contact-form-heading" className="border border-ink/15 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="border-b border-ink/10 pb-5">
              <h2 id="contact-form-heading" className="text-2xl font-black">ส่งข้อความ</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">กรอกข้อมูลที่จำเป็นเพื่อให้ผู้ดูแลเข้าใจและตอบกลับทางอีเมลได้</p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={submit} aria-busy={isPending}>
              <label htmlFor="contact-name" className="block">
                <span className="mb-2 block text-sm font-bold">ชื่อสำหรับติดต่อ</span>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={values.name}
                  onChange={(event) => updateValue("name", event.currentTarget.value)}
                  className="min-h-12 w-full border border-ink/20 bg-white px-4 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
                  placeholder="ชื่อของคุณ"
                />
              </label>

              <label htmlFor="contact-email" className="block">
                <span className="mb-2 block text-sm font-bold">อีเมลสำหรับตอบกลับ</span>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  maxLength={320}
                  value={values.email}
                  onChange={(event) => updateValue("email", event.currentTarget.value)}
                  className="min-h-12 w-full border border-ink/20 bg-white px-4 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
                  placeholder="name@example.com"
                />
              </label>

              <label htmlFor="contact-subject" className="block">
                <span className="mb-2 block text-sm font-bold">หัวเรื่อง <span className="font-medium text-slate-500">(ไม่บังคับ)</span></span>
                <input
                  id="contact-subject"
                  name="subject"
                  maxLength={200}
                  value={values.subject}
                  onChange={(event) => updateValue("subject", event.currentTarget.value)}
                  className="min-h-12 w-full border border-ink/20 bg-white px-4 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
                  placeholder="เช่น QR ใช้งานไม่ได้ หรือขอแก้ไขข้อมูลสถานที่"
                />
              </label>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-bold">
                  รายละเอียด
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={6}
                  value={values.message}
                  onChange={(event) => updateValue("message", event.currentTarget.value)}
                  className="w-full resize-y border border-ink/20 bg-white px-4 py-3 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
                  placeholder="บอกสิ่งที่พบ หน้าที่เกี่ยวข้อง และรายละเอียดที่ช่วยให้ตรวจสอบได้"
                />
                <span className="mt-1 block text-right text-xs text-slate-500">{values.message.length}/2,000</span>
              </div>

              {submitState.kind === "error" ? (
                <div role="alert" className="flex gap-3 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
                  <WarningCircle aria-hidden="true" className="mt-0.5 shrink-0" size={20} weight="fill" />
                  {submitState.message}
                </div>
              ) : null}
              {submitState.kind === "success" ? (
                <div role="status" className="flex gap-3 border border-teal/25 bg-[#F2FAF8] p-4 text-sm font-semibold leading-6 text-teal">
                  <CheckCircle aria-hidden="true" className="mt-0.5 shrink-0" size={20} weight="fill" />
                  {submitState.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="flex min-h-12 w-full items-center justify-center gap-2 bg-coral px-6 font-black text-white transition-colors hover:bg-[#C8553A] disabled:cursor-wait disabled:opacity-60"
              >
                {isPending ? <><Spinner aria-hidden="true" className="animate-spin" size={19} /> กำลังส่งข้อความ...</> : <><PaperPlaneRight aria-hidden="true" size={19} weight="fill" /> ส่งข้อความ</>}
              </button>

              <p className="flex gap-2 text-xs leading-6 text-slate-600">
                <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-teal" size={17} weight="fill" />
                ข้อมูลจะใช้เพื่อดำเนินการกับข้อความนี้ โปรดอ่าน <Link href="/privacy" className="font-bold text-teal underline underline-offset-4">นโยบายความเป็นส่วนตัว</Link>
              </p>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="border-y border-ink/15 bg-white px-5 py-6">
              <h2 className="text-xl font-black">เรื่องที่ส่งผ่านช่องทางนี้ได้</h2>
              <div className="mt-4 divide-y divide-ink/10">
                {supportedTopics.map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="flex gap-3 py-4">
                    <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-coral" size={23} weight="duotone" />
                    <div>
                      <h3 className="text-sm font-black">{title}</h3>
                      <p className="mt-1 text-xs leading-6 text-slate-600">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-black text-amber-900">ก่อนส่งข้อความ</h2>
              <p className="mt-2 text-xs leading-6 text-amber-900/80">
                อย่าส่งรหัสผ่าน เลขบัตรประชาชน ข้อมูลการเงิน หรือข้อมูลสุขภาพ
                แบบฟอร์มนี้ไม่ใช่ช่องทางแจ้งเหตุฉุกเฉินและไม่ได้รับประกันเวลาตอบกลับ
              </p>
            </section>

            <Link href="/about" className="inline-flex min-h-11 items-center font-bold text-teal underline underline-offset-4">
              อ่านขอบเขตและเป้าหมายของโครงการ
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

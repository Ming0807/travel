"use client";

import Link from "next/link";
import {
  ArrowClockwise,
  ArrowLeft,
  ChatCircleText,
  Compass,
  WarningCircle,
} from "@phosphor-icons/react";

export type CheckinUnavailableStatus = "not_found" | "inactive" | "expired" | "unavailable";

const STATUS_COPY: Record<
  CheckinUnavailableStatus,
  { title: string; message: string; guidance: string }
> = {
  not_found: {
    title: "ไม่พบ QR Code นี้",
    message: "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ",
    guidance: "ลองสแกน QR ที่ป้ายอีกครั้ง โดยให้รหัสอยู่ครบภายในกรอบกล้อง",
  },
  inactive: {
    title: "QR Code ยังไม่เปิดใช้งาน",
    message: "รหัสนี้ยังไม่เปิดใช้งาน หรือถูกปิดใช้งานแล้ว",
    guidance: "สอบถามเจ้าหน้าที่ประจำสถานที่ หรือแจ้งปัญหาเพื่อให้ทีมงานตรวจสอบ",
  },
  expired: {
    title: "QR Code หมดอายุแล้ว",
    message: "ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป",
    guidance: "มองหาป้าย QR ล่าสุดที่จุดเช็กอิน หรือสอบถามเจ้าหน้าที่ประจำสถานที่",
  },
  unavailable: {
    title: "สถานที่ยังไม่เปิดให้เช็กอิน",
    message: "สถานที่นี้ถูกระงับหรือยังไม่พร้อมสำหรับการเช็กอิน",
    guidance: "คุณยังค้นหาสถานที่อื่นและวางแผนการเดินทางต่อได้จากหน้าหลัก",
  },
};

export function CheckinUnavailable({ status }: { status: CheckinUnavailableStatus }) {
  const copy = STATUS_COPY[status];
  const isNotFound = status === "not_found";

  return (
    <main className="min-h-[100dvh] bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-3 rounded-[var(--public-radius-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-teal)] focus-visible:ring-offset-2"
        >
          <span className="grid h-10 w-10 place-items-center rounded-[var(--public-radius-control)] bg-[var(--public-ink)] text-white">
            <Compass size={21} weight="fill" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-black leading-5">ท่องเที่ยวชายแดนใต้</span>
            <span className="block text-xs font-semibold text-black/55">Digital Passport</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center py-10 sm:py-16">
          <section
            aria-labelledby="checkin-unavailable-title"
            className="w-full border-y border-black/10 bg-white py-9 sm:border sm:p-10"
          >
            <div className="grid gap-7 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
              <span className="grid h-14 w-14 place-items-center rounded-[var(--public-radius-control)] bg-[#FFF2ED] text-[var(--public-coral)]">
                <WarningCircle size={30} weight="fill" aria-hidden="true" />
              </span>

              <div>
                <p className="text-sm font-black text-[var(--public-coral)]">QR CHECK-IN</p>
                <h1
                  id="checkin-unavailable-title"
                  className="mt-2 text-3xl font-black leading-tight text-balance sm:text-4xl"
                >
                  {copy.title}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-black/70">{copy.message}</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">{copy.guidance}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {isNotFound ? (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-ink)] px-5 text-sm font-black text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-teal)] focus-visible:ring-offset-2"
                    >
                      <ArrowClockwise size={18} weight="bold" aria-hidden="true" />
                      ตรวจสอบ QR อีกครั้ง
                    </button>
                  ) : null}
                  <Link
                    href="/"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--public-radius-control)] border border-black/15 bg-white px-5 text-sm font-black transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-teal)] focus-visible:ring-offset-2"
                  >
                    <ArrowLeft size={18} weight="bold" aria-hidden="true" />
                    กลับหน้าหลัก
                  </Link>
                </div>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-black/65 underline decoration-black/25 underline-offset-4 hover:text-[var(--public-coral)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-teal)] focus-visible:ring-offset-2"
                >
                  <ChatCircleText size={18} weight="bold" aria-hidden="true" />
                  แจ้งปัญหา QR
                </Link>
              </div>
            </div>
          </section>
        </div>

        <p className="text-center text-xs leading-5 text-black/50">
          หน้านี้ไม่เก็บข้อมูลส่วนบุคคล และยังไม่มีการบันทึกการเช็กอิน
        </p>
      </div>
    </main>
  );
}

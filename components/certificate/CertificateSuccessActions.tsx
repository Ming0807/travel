"use client";

import { ArrowRight, ClipboardText, DownloadSimple, ShareNetwork, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";

type StampStatus = "earned" | "already_earned" | "no_active_stamp_definition" | "none";

interface Props {
  visitId: string;
  certUrl: string;
  stampStatus: StampStatus;
}

export function CertificateSuccessActions({ visitId, certUrl, stampStatus }: Props) {
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(certUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `travel-memory-${visitId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(certUrl, "_blank");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Southern Border Travel Memory",
          text: "ดูใบประกาศการท่องเที่ยวชายแดนใต้ของฉัน",
          url: window.location.href
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {(stampStatus === "earned" || stampStatus === "already_earned") && (
        <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10">
            <Sparkle weight="fill" className="text-xl text-teal" />
          </div>
          <div>
            <h4 className="font-bold text-teal">
              {stampStatus === "earned" ? "ได้รับตราประทับใหม่!" : "คุณมีตราประทับนี้แล้ว"}
            </h4>
            <p className="mt-1 text-xs text-teal/80">
              {stampStatus === "earned"
                ? "พาสปอร์ตของคุณสะสมตราประทับเพิ่มอีก 1 ดวงแล้ว"
                : "การเยี่ยมชมครั้งนี้ยังถูกบันทึกไว้ แต่ระบบไม่ออกตราซ้ำสำหรับสถานที่เดิม"}
            </p>
          </div>
        </div>
      )}

      {stampStatus === "no_active_stamp_definition" && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-ink">
          ใบประกาศของคุณพร้อมแล้ว แต่สถานที่นี้ยังไม่มีตราประทับที่เปิดใช้งาน
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="flex flex-col items-center justify-center rounded-[1.5rem] border border-ink/5 bg-white py-4 shadow-sm transition-colors hover:border-[#E18868]/30 hover:bg-[#FAF3EE]"
        >
          <DownloadSimple size={28} className="mb-2 text-[#E18868]" />
          <span className="text-sm font-bold text-ink">บันทึกรูปภาพ</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center rounded-[1.5rem] border border-ink/5 bg-white py-4 shadow-sm transition-colors hover:border-[#E18868]/30 hover:bg-[#FAF3EE]"
        >
          <ShareNetwork size={28} className="mb-2 text-[#E18868]" />
          <span className="text-sm font-bold text-ink">{copied ? "คัดลอกลิงก์แล้ว" : "แชร์ให้เพื่อน"}</span>
        </button>
      </div>

      <p className="rounded-2xl bg-white/75 px-4 py-3 text-center text-xs font-semibold leading-5 text-muted">
        ดาวน์โหลดใบประกาศได้ทันที ไม่ต้องเชื่อม LINE หรือทำแบบสอบถามก่อน
      </p>

      <div className="mt-4 flex flex-col items-center rounded-[1.5rem] border border-ink/5 bg-white p-6 text-center shadow-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF3EE] text-[#E18868]">
          <ClipboardText size={24} weight="fill" />
        </div>
        <h3 className="mb-1 font-bold text-ink">แบบสอบถามสั้น ๆ (ไม่บังคับ)</h3>
        <p className="mb-4 text-sm text-muted">
          ช่วยพัฒนาการท่องเที่ยวในพื้นที่ ใช้เวลาประมาณ 1 นาที และคุณยังดาวน์โหลดใบประกาศได้ตามปกติ
        </p>
        <Link
          href={`/visit/${visitId}/survey`}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E18868] py-4 font-bold text-white shadow-sm transition-colors hover:bg-[#D07757]"
        >
          ตอบแบบสอบถามสั้น ๆ <ArrowRight weight="bold" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-sm font-bold text-ink">
        <Link href="/passport" className="rounded-full bg-white px-4 py-4 shadow-sm border border-ink/5 hover:bg-[#FAF8F5]">
          ดูพาสปอร์ต
        </Link>
        <Link href="/" className="rounded-full bg-white px-4 py-4 shadow-sm border border-ink/5 hover:bg-[#FAF8F5]">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

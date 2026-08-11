"use client";

import {
  ArrowRight,
  ClipboardText,
  DownloadSimple,
  ShareNetwork,
  Sparkle,
  Spinner,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";

type StampStatus = "earned" | "already_earned" | "no_active_stamp_definition" | "none";
type ActionState = "idle" | "downloading" | "sharing";

interface Props {
  visitId: string;
  certUrl: string;
  stampStatus: StampStatus;
}

function certificateFilename(visitId: string) {
  return `travel-memory-${visitId}.png`;
}

async function fetchCertificateFile(certUrl: string, visitId: string) {
  const response = await fetch(certUrl);
  if (!response.ok) {
    throw new Error("CERTIFICATE_DOWNLOAD_FAILED");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || blob.size === 0) {
    throw new Error("CERTIFICATE_FILE_INVALID");
  }

  return new File([blob], certificateFilename(visitId), {
    type: blob.type || "image/png",
  });
}

export function CertificateSuccessActions({ visitId, certUrl, stampStatus }: Props) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const hasCertificate = Boolean(certUrl);
  const isBusy = actionState !== "idle";

  const handleDownload = async () => {
    if (!hasCertificate || isBusy) return;
    setActionState("downloading");
    setMessage(null);

    try {
      const file = await fetchCertificateFile(certUrl, visitId);
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setMessage("บันทึกใบประกาศแล้ว หากไม่พบไฟล์ โปรดตรวจสอบโฟลเดอร์ดาวน์โหลด");
    } catch (error) {
      console.error("Certificate download failed:", error);
      setMessage("ดาวน์โหลดใบประกาศไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setActionState("idle");
    }
  };

  const handleShare = async () => {
    if (!hasCertificate || isBusy) return;
    setActionState("sharing");
    setMessage(null);

    try {
      const file = await fetchCertificateFile(certUrl, visitId);
      const shareData: ShareData = {
        files: [file],
        title: "ความทรงจำจากชายแดนใต้",
        text: "ใบประกาศการเดินทางจาก Southern Border Digital Passport",
      };

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData);
        setMessage("แชร์ใบประกาศเรียบร้อยแล้ว");
      } else {
        setMessage("อุปกรณ์นี้ยังแชร์ไฟล์โดยตรงไม่ได้ โปรดดาวน์โหลดใบประกาศจากปุ่มบันทึก แล้วแชร์รูปจากคลังภาพ");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Certificate share failed:", error);
      setMessage("แชร์ไฟล์ไม่สำเร็จ โปรดดาวน์โหลดใบประกาศจากปุ่มบันทึก แล้วแชร์รูปจากคลังภาพ");
    } finally {
      setActionState("idle");
    }
  };

  if (!hasCertificate) {
    return (
      <div className="w-full border border-amber-200 bg-amber-50 p-5 text-center">
        <h2 className="text-lg font-black text-ink">ยังไม่พบไฟล์ใบประกาศ</h2>
        <p className="mt-2 text-sm leading-6 text-ink-light">
          ไฟล์อาจยังสร้างไม่เสร็จหรือการเชื่อมต่อสะดุด กรุณากลับไปตรวจสอบและสร้างอีกครั้ง
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" disabled className="min-h-12 border border-ink/10 bg-white text-sm font-bold text-ink-light opacity-60">
            <DownloadSimple size={20} className="mx-auto mb-1" />
            บันทึกรูปภาพ
          </button>
          <button type="button" disabled className="min-h-12 border border-ink/10 bg-white text-sm font-bold text-ink-light opacity-60">
            <ShareNetwork size={20} className="mx-auto mb-1" />
            แชร์ให้เพื่อน
          </button>
        </div>
        <button
          type="button"
          onClick={() => window.location.assign(`/visit/${visitId}/certificate/preview`)}
          className="mt-4 min-h-12 w-full bg-[#E77455] px-5 py-3 font-bold text-white hover:bg-[#C8553A]"
        >
          ลองสร้างใบประกาศอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {(stampStatus === "earned" || stampStatus === "already_earned") && (
        <div className="flex items-start gap-3 border border-[#0A6B62]/20 bg-[#F0F8F6] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#0A6B62]/10">
            <Sparkle weight="fill" className="text-xl text-[#0A6B62]" />
          </div>
          <div>
            <h4 className="font-bold text-[#075049]">
              {stampStatus === "earned" ? "ได้รับตราประทับใหม่!" : "คุณมีตราประทับนี้แล้ว"}
            </h4>
            <p className="mt-1 text-xs leading-5 text-[#35665E]">
              {stampStatus === "earned"
                ? "พาสปอร์ตของคุณสะสมตราประทับเพิ่มอีก 1 ดวงแล้ว"
                : "การเยี่ยมชมครั้งนี้ถูกบันทึกไว้ โดยระบบจะไม่ออกตราซ้ำสำหรับสถานที่เดิม"}
            </p>
          </div>
        </div>
      )}

      {stampStatus === "no_active_stamp_definition" && (
        <div className="border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-ink">
          ใบประกาศของคุณพร้อมแล้ว แต่สถานที่นี้ยังไม่มีตราประทับที่เปิดใช้งาน
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isBusy}
          className="flex min-h-24 flex-col items-center justify-center border border-ink/10 bg-white px-3 py-4 transition-colors hover:border-[#E77455] hover:bg-[#FFF7F3] disabled:cursor-wait disabled:opacity-60"
        >
          {actionState === "downloading" ? <Spinner size={28} className="mb-2 animate-spin text-[#E77455]" /> : <DownloadSimple size={28} className="mb-2 text-[#E77455]" />}
          <span className="text-sm font-bold text-ink">บันทึกรูปภาพ</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          disabled={isBusy}
          className="flex min-h-24 flex-col items-center justify-center border border-ink/10 bg-white px-3 py-4 transition-colors hover:border-[#E77455] hover:bg-[#FFF7F3] disabled:cursor-wait disabled:opacity-60"
        >
          {actionState === "sharing" ? <Spinner size={28} className="mb-2 animate-spin text-[#E77455]" /> : <ShareNetwork size={28} className="mb-2 text-[#E77455]" />}
          <span className="text-sm font-bold text-ink">แชร์ไฟล์ใบประกาศ</span>
        </button>
      </div>

      {message ? (
        <p className="border border-[#E77455]/25 bg-[#FFF7F3] px-4 py-3 text-sm font-semibold leading-6 text-ink" role="status">
          {message}
        </p>
      ) : null}

      <p className="border border-ink/10 bg-white px-4 py-3 text-center text-xs font-semibold leading-5 text-muted">
        ดาวน์โหลดได้ทันที ไม่ต้องเชื่อม LINE และไม่ต้องตอบแบบสอบถามก่อน
      </p>

      <div className="mt-2 border border-ink/10 bg-white p-5 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center bg-[#FFF1EC] text-[#C8553A]">
          <ClipboardText size={23} weight="fill" />
        </div>
        <h3 className="mb-1 font-bold text-ink">แบบสอบถามสั้น ๆ (ไม่บังคับ)</h3>
        <p className="mb-4 text-sm leading-6 text-muted">
          ช่วยให้สถานที่ท่องเที่ยวเห็นสิ่งที่ควรพัฒนา ใช้เวลาประมาณ 1 นาที
        </p>
        <Link
          href={`/visit/${visitId}/survey`}
          className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#E77455] px-5 py-3 font-bold text-white transition-colors hover:bg-[#C8553A]"
        >
          ตอบแบบสอบถามสั้น ๆ <ArrowRight weight="bold" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-sm font-bold text-ink">
        <Link href="/passport" className="min-h-12 border border-ink/10 bg-white px-4 py-4 hover:bg-slate-50">
          ดูพาสปอร์ต
        </Link>
        <Link href="/" className="min-h-12 border border-ink/10 bg-white px-4 py-4 hover:bg-slate-50">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

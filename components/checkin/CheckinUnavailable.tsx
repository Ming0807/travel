"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface Props {
  status: "not_found" | "inactive" | "expired" | "unavailable";
}

export function CheckinUnavailable({ status }: { status: Props["status"] }) {
  let title = "เกิดข้อผิดพลาด";
  let message = "ไม่สามารถดำเนินการได้ในขณะนี้";

  if (status === "not_found") {
    title = "ไม่พบ QR Code นี้";
    message = "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ";
  } else if (status === "inactive") {
    title = "QR Code ยังไม่เปิดใช้งาน";
    message = "รหัสนี้ยังไม่เปิดใช้งาน หรือถูกปิดใช้งานแล้ว";
  } else if (status === "expired") {
    title = "QR Code หมดอายุแล้ว";
    message = "ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป";
  } else if (status === "unavailable") {
    title = "สถานที่ยังไม่เปิดให้เช็กอิน";
    message = "สถานที่นี้ถูกระงับหรือยังไม่พร้อมสำหรับการเช็กอิน";
  }

  const isNotFound = status === "not_found";

  return (
    <main className="flex min-h-[100dvh] flex-col bg-slate-50 relative pb-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-full h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[url('/noise.png')] opacity-30 mix-blend-overlay -z-10 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 text-center z-10 motion-safe:animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full shadow-card border border-white/50 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-red-50 text-red-500 shadow-md rotate-3 motion-safe:animate-scale-in delay-100">
            <WarningCircle size={40} weight="fill" className="-rotate-3" />
          </div>

          <h1 className="mt-8 text-2xl font-black text-ink mb-2 tracking-tight">{title}</h1>
          <p className="text-[15px] text-muted mb-8 font-medium leading-relaxed">{message}</p>
          
          <div className="space-y-3">
            {isNotFound && (
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center py-4 bg-ink text-white rounded-2xl font-bold hover:bg-ink/90 transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
              >
                ลองใหม่อีกครั้ง
              </button>
            )}
            <Link 
              href="/"
              className={`w-full flex items-center justify-center py-4 ${
                isNotFound 
                  ? "bg-slate-100 text-ink/80 hover:bg-slate-200" 
                  : "bg-ink text-white hover:bg-ink/90 shadow-sm"
              } rounded-2xl font-bold transition-all hover:-translate-y-1 active:scale-[0.98]`}
            >
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

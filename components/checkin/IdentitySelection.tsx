"use client";

import Link from "next/link";
import { ChatCircle, EnvelopeSimple, User } from "@phosphor-icons/react/dist/ssr";

export function IdentitySelection({ checkinCode }: { checkinCode: string }) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-[2rem] shadow-lg border border-ink/5 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-ink">เลือกวิธีเข้าสู่ระบบ</h2>
        <p className="text-sm text-muted font-medium">เพื่อบันทึกประวัติการท่องเที่ยวและสะสมตราประทับของคุณอย่างปลอดภัย</p>
      </div>

      <div className="space-y-4">
        {/* LINE Login */}
        <Link 
          href={`/checkin/${checkinCode}/start?identity=line`} 
          className="w-full flex items-center justify-between p-4 bg-[#00B900] hover:bg-[#00A000] text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ChatCircle weight="fill" size={24} />
            </div>
            <span>เข้าสู่ระบบด้วย LINE</span>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">แนะนำ</span>
        </Link>

        {/* Email Login */}
        <Link 
          href={`/checkin/${checkinCode}/start?identity=email`} 
          className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 hover:border-ink hover:bg-gray-50 text-ink rounded-2xl font-bold transition-all"
        >
          <div className="bg-gray-100 p-2 rounded-xl text-ink/70 group-hover:text-ink">
            <EnvelopeSimple weight="fill" size={24} />
          </div>
          <span>เข้าสู่ระบบด้วยอีเมล</span>
        </Link>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100 text-center">
        <p className="text-xs text-muted mb-4 font-medium">คุณสามารถเลือกไม่เข้าสู่ระบบได้ (ข้อมูลอาจสูญหายหากเปลี่ยนอุปกรณ์)</p>
        <Link 
          href={`/checkin/${checkinCode}/start`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-ink/80 rounded-full font-bold text-sm transition-colors"
        >
          <User weight="fill" size={18} />
          ดำเนินการต่อแบบไม่ใช้บัญชี (Guest)
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChatCircle, EnvelopeSimple, User } from "@phosphor-icons/react/dist/ssr";

export function IdentitySelection({ checkinCode }: { checkinCode: string }) {
  return (
    <div className="w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white p-6 md:p-8 animate-scale-in">
      <div className="space-y-4">
        {/* LINE Login */}
        <Link 
          href={`/checkin/${checkinCode}/start?identity=line`} 
          className="w-full flex items-center justify-between p-4 bg-[#00C300] hover:bg-[#00B000] text-white rounded-2xl font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,195,0,0.3)] shadow-sm group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <ChatCircle weight="fill" size={24} />
            </div>
            <span className="text-[17px]">เข้าสู่ระบบด้วย LINE</span>
          </div>
          <span className="text-xs bg-white/25 px-2.5 py-1 rounded-lg font-medium tracking-wide">แนะนำ</span>
        </Link>

        {/* Email Login */}
        <Link 
          href={`/checkin/${checkinCode}/start?identity=email`} 
          className="w-full flex items-center gap-3 p-4 bg-white border border-ink/10 hover:border-ink/30 hover:bg-ink/[0.02] text-ink rounded-2xl font-bold transition-all hover:-translate-y-1 hover:shadow-md group active:scale-[0.98]"
        >
          <div className="bg-ink/5 p-2 rounded-xl text-ink/70 group-hover:bg-ink group-hover:text-white transition-colors duration-300">
            <EnvelopeSimple weight="fill" size={24} />
          </div>
          <span className="text-[17px]">เข้าสู่ระบบด้วยอีเมล</span>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-ink/5 text-center">
        <p className="text-[13px] text-muted mb-4 font-medium px-4">
          คุณสามารถเลือกใช้งานแบบผู้เยี่ยมชมได้<br />
          <span className="text-ink/50 text-xs">(ข้อมูลอาจสูญหายหากเปลี่ยนอุปกรณ์)</span>
        </p>
        <Link 
          href={`/checkin/${checkinCode}/start`}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink/5 hover:bg-ink/10 text-ink/90 rounded-full font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <User weight="fill" size={18} className="text-ink/70" />
          ดำเนินการต่อแบบ (Guest)
        </Link>
      </div>
    </div>
  );
}

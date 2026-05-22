import type { PassportViewModel } from "@/lib/services/passport.service";
import { Compass, BookBookmark } from "@phosphor-icons/react/dist/ssr";

export function PassportSummary({ passport }: { passport: PassportViewModel }) {
  return (
    <section className="rounded-[2.5rem] bg-[#1a1c23] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10 group">
      {/* Leather texture / noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=600&auto=format&fit=crop')", backgroundSize: "cover" }}
      ></div>
      
      {/* Premium lighting effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E18868]/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E18868] shadow-inner">
            <Compass size={24} weight="duotone" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            <BookBookmark size={14} className="text-[#E18868]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              {passport.isGuest ? "GUEST MODE" : "LINKED ACCOUNT"}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E18868] mb-1">
            Official Travel Document
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            {passport.displayName || "นักเดินทาง"}
          </h1>
          {passport.isGuest && (
            <p className="mt-3 text-xs leading-relaxed text-white/50 max-w-sm">
              พาสปอร์ตนี้บันทึกอยู่บนอุปกรณ์ปัจจุบันเท่านั้น อย่าลืมลงทะเบียนเพื่อป้องกันข้อมูลสูญหาย
            </p>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md transition-all hover:bg-white/10">
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Compass size={80} weight="fill" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">Stamps Collected</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-black text-[#E18868]">{passport.totalStampsEarned}</p>
              <p className="text-sm font-bold text-white/30">/ {passport.totalStampTargets}</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E18868]/20 to-transparent border border-[#E18868]/30 p-5 backdrop-blur-md transition-all hover:border-[#E18868]/50">
            <p className="text-[10px] uppercase tracking-widest text-[#E18868]/80 font-bold mb-2">Milestone</p>
            <div className="w-full bg-black/40 rounded-full h-1.5 mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#E18868] to-[#f5a88c] h-1.5 rounded-full" 
                style={{ width: `${Math.max(5, (passport.totalStampsEarned / Math.max(1, passport.totalStampTargets)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-bold text-white/70 text-right">
              {Math.round((passport.totalStampsEarned / Math.max(1, passport.totalStampTargets)) * 100)}% Completed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

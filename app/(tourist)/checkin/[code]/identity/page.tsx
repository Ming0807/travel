import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { IdentitySelection } from "@/components/checkin/IdentitySelection";

export default async function IdentitySelectionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative pb-24 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-ink/90 to-slate-50">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay animate-scale-in" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50"></div>
      </div>
      
      <div className="relative z-10 pt-[10vh]">
        <div className="max-w-md mx-auto px-5 mb-8 flex flex-col items-center text-center text-ink animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-coral">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-[28px] font-black tracking-tight mb-1">เริ่มต้นเช็คอิน</h1>
            <p className="text-[15px] font-medium text-ink/70">เลือกช่องทางการเข้าใช้งานที่สะดวกที่สุด</p>
          </div>
        </div>

        <div className="px-4 max-w-md mx-auto animate-fade-in-up delay-100">
          <IdentitySelection checkinCode={code} />
        </div>
      </div>
    </div>
  );
}

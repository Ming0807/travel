import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { IdentitySelection } from "@/components/checkin/IdentitySelection";

export default async function IdentitySelectionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CheckinUnavailable status={context.status as any} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col relative pb-24">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-ink/90 to-[#FAF8F5]">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF8F5]/50 to-[#FAF8F5]"></div>
      </div>
      
      <div className="relative z-10 pt-[10vh]">
        <div className="max-w-5xl mx-auto px-4 mb-8 flex items-center justify-center md:justify-start gap-4 text-ink">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-coral">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black">ความปลอดภัย</h1>
            <p className="text-sm font-medium opacity-80">เราให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ</p>
          </div>
        </div>

        <div className="px-4">
          <IdentitySelection checkinCode={code} />
        </div>
      </div>
    </div>
  );
}

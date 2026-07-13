import Link from "next/link";
import { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { MapPin, Certificate, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export function CheckinLanding({ details }: { details: CheckinCodeDetails }) {
  const attraction = details.attraction!;
  
  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-center pb-12">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-ink/90 to-background">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto w-full px-4 pt-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          {/* Attraction Context */}
          <div className="inline-flex items-center gap-2 bg-white border border-ink/5 shadow-sm text-coral px-5 py-2 rounded-full text-sm font-bold animate-in fade-in zoom-in-95 duration-500 delay-300 fill-mode-both">
            <MapPin weight="fill" />
            <span>{attraction.province?.province_name_th || "สถานที่ท่องเที่ยว"}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-ink leading-tight drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            {details.photo_spot ? details.photo_spot.spot_name_th : attraction.name_th}
          </h1>
          
          {attraction.short_description_th && (
            <p className="text-ink/70 text-base leading-relaxed font-medium max-w-md mx-auto animate-in fade-in duration-700 delay-700 fill-mode-both">
              {attraction.short_description_th}
            </p>
          )}
        </div>

        {/* Certificate Teaser Card */}
        <div className="w-full bg-white p-8 rounded-2xl border border-ink/5 flex flex-col items-center text-center space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[900ms] fill-mode-both hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="h-20 w-20 bg-cream text-coral rounded-xl flex items-center justify-center mb-2 shadow-inner animate-in zoom-in-95 duration-500 delay-[1100ms] fill-mode-both">
            <Certificate size={40} weight="fill" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-ink mb-2">สร้างใบประกาศดิจิทัลฟรี</h2>
            <p className="text-sm text-muted leading-relaxed">เก็บความทรงจำการเดินทาง และสะสมตราประทับ ใช้เวลาไม่ถึง 1 นาที</p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="w-full space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[1300ms] fill-mode-both">
          <Link 
            href={`/checkin/${details.code}/start`}
            className="w-full flex items-center justify-center py-4 bg-coral text-white rounded-full font-bold text-lg shadow-sm hover:bg-coral/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            สร้างใบประกาศของฉัน
          </Link>
          <p className="text-xs text-center text-muted font-medium">ไม่ต้องใช้รหัสผ่าน หรือดาวน์โหลดแอป</p>
        </div>

        {/* Privacy Hint */}
        <div className="flex items-center gap-2 text-[11px] text-muted font-bold tracking-wide uppercase mt-8 bg-white shadow-sm border border-ink/5 px-5 py-3 rounded-full animate-in fade-in duration-700 delay-[1500ms] fill-mode-both">
          <ShieldCheck size={18} className="text-coral" />
          <span>ข้อมูลของคุณปลอดภัยและใช้สำหรับสถิติการท่องเที่ยวเท่านั้น</span>
        </div>
      </div>
    </div>
  );
}

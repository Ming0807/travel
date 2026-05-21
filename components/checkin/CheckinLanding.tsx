import Link from "next/link";
import { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { MapPin, Certificate, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export function CheckinLanding({ details }: { details: CheckinCodeDetails }) {
  const attraction = details.attraction!;
  
  return (
    <div className="flex flex-col items-center max-w-md mx-auto w-full px-6 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        {/* Attraction Context */}
        <div className="inline-flex items-center gap-2 bg-coral/10 text-coral px-4 py-1.5 rounded-full text-sm font-medium">
          <MapPin weight="fill" />
          <span>{attraction.province?.province_name_th || "สถานที่ท่องเที่ยว"}</span>
        </div>
        
        <h1 className="text-3xl font-semibold text-ink leading-tight">
          {details.photo_spot ? details.photo_spot.spot_name_th : attraction.name_th}
        </h1>
        
        {attraction.short_description_th && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {attraction.short_description_th}
          </p>
        )}
      </div>

      {/* Certificate Teaser Card */}
      <div className="w-full bg-white p-6 rounded-3xl shadow-card border border-sand-200 flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 bg-gold/20 text-gold rounded-2xl flex items-center justify-center mb-2">
          <Certificate size={32} weight="fill" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-ink mb-1">สร้างใบประกาศดิจิทัลฟรี</h2>
          <p className="text-sm text-gray-500">เก็บความทรงจำการเดินทาง และสะสมตราประทับ ใช้เวลาไม่ถึง 1 นาที</p>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="w-full space-y-3 pt-4">
        <Link 
          href={`/checkin/${details.code}/start`}
          className="w-full flex items-center justify-center py-4 bg-teal text-white rounded-2xl font-medium text-lg shadow-sm hover:bg-teal-hover transition-colors"
        >
          สร้างใบประกาศของฉัน
        </Link>
        <p className="text-xs text-center text-gray-400">ไม่ต้องใช้รหัสผ่าน หรือดาวน์โหลดแอป</p>
      </div>

      {/* Privacy Hint */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-8 bg-gray-50 px-4 py-2 rounded-full">
        <ShieldCheck size={16} />
        <span>ข้อมูลของคุณปลอดภัยและใช้สำหรับสถิติการท่องเที่ยวเท่านั้น</span>
      </div>
    </div>
  );
}

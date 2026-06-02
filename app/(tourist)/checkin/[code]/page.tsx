import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import Link from "next/link";
import { MapPin, Image as ImageIcon, Camera } from "@phosphor-icons/react/dist/ssr";

export default async function CheckinLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CheckinUnavailable status={context.status as any} />;
  }

  // Track QR scan + landing view in order
  await trackCheckinFunnelEvent("qr_scanned", context.details);
  await trackCheckinFunnelEvent("landing_viewed", context.details);

  const { attraction, photo_spot } = context.details;

  // Use attraction hero or fallback
  const heroImage = "https://images.unsplash.com/photo-1540202403-b7ca6c5c7865?q=80&w=2000&auto=format&fit=crop";

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col relative pb-24 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[55vh] bg-gradient-to-b from-ink/70 via-ink/30 to-slate-50 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60 motion-safe:animate-scale-in"
          style={{ backgroundImage: `url('${heroImage}')`, animationDuration: '1.2s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent bottom-0 h-2/3 mt-auto" />
      </div>

      <div className="relative z-10 pt-[28vh] px-5 flex flex-col items-center max-w-lg mx-auto w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full shadow-xl border border-white/50 text-center motion-safe:animate-fade-in-up delay-100">
          <div className="w-24 h-24 bg-gradient-to-br from-coral to-[#E05C3A] text-white rounded-xl rotate-3 flex items-center justify-center mx-auto -mt-16 shadow-md mb-6 border-[6px] border-white/90 backdrop-blur-sm motion-safe:animate-scale-in delay-200 transition-transform hover:rotate-0 duration-300">
            <Camera size={44} weight="fill" className="-rotate-3" />
          </div>

          <h1 className="text-3xl font-black text-ink mb-3 leading-tight motion-safe:animate-fade-in-up delay-200">
            {photo_spot ? photo_spot.spot_name_th : attraction?.name_th}
          </h1>

          {photo_spot && attraction && (
            <p className="text-muted text-[15px] font-medium flex items-center justify-center gap-2 mb-8 motion-safe:animate-fade-in-up delay-300">
              <MapPin weight="fill" className="text-coral" />
              {attraction.name_th}
            </p>
          )}

          <div className="space-y-4 mb-10 text-left bg-white/60 p-6 rounded-xl border border-ink/[0.03] shadow-sm motion-safe:animate-fade-in-up delay-400">
            <h3 className="font-bold text-ink text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal block"></span>
              สิ่งที่คุณจะได้รับ:
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-ink/80 font-medium">
                <div className="bg-teal/10 p-2 rounded-full text-teal">
                  <ImageIcon weight="fill" size={18} />
                </div>
                <span>ใบประกาศดิจิทัลพร้อมรูปถ่าย</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-ink/80 font-medium">
                <div className="bg-coral/10 p-2 rounded-full text-coral">
                  <MapPin weight="fill" size={18} />
                </div>
                <span>ตราประทับสะสมใน Passport</span>
              </li>
            </ul>
          </div>

          <div className="motion-safe:animate-fade-in-up delay-400">
            <Link
              href={`/checkin/${code}/identity`}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-ink text-white rounded-2xl font-bold text-lg hover:bg-ink/90 hover:-translate-y-1 hover:shadow-md transition-all active:scale-[0.98]"
            >
              เริ่มต้นเช็คอิน
            </Link>

            <p className="text-[13px] text-muted/80 mt-5 font-medium">
              ใช้เวลาเพียง 1-2 นาที • ไม่ต้องโหลดแอป
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

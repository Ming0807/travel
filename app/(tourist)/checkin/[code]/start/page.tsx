import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { MinimalForm } from "@/components/checkin/MinimalForm";
import { MapPin, Compass } from "@phosphor-icons/react/dist/ssr";

export default async function StartCheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    return <CheckinUnavailable status={context.status === "valid" ? "unavailable" : context.status} />;
  }

  const { attraction, photo_spot } = context.details;

  return (
    <main className="min-h-screen bg-slate-50 relative pb-24 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-full h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[url('/noise.png')] opacity-20 mix-blend-overlay -z-10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-8 md:pt-16">
        {/* Back Link */}
        <a
          href={`/checkin/${code}/identity`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-coral transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
          เปลี่ยนวิธีการเข้าใช้งาน
        </a>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur shadow-sm text-coral px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-white">
            <MapPin weight="fill" size={14} />
            <span>{photo_spot ? photo_spot.spot_name_th : attraction?.name_th}</span>
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tight">ข้อมูลของคุณ</h1>
          <p className="text-muted text-sm font-medium mt-2 max-w-xs mx-auto">
            กรอกข้อมูลสั้น ๆ เพื่อสร้างใบประกาศดิจิทัลและสะสมตราประทับ
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 animate-scale-in">
          <MinimalForm checkinCode={code} />
        </div>

        {/* Privacy Trust Cue */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-muted font-bold tracking-wide uppercase">
          <Compass size={14} weight="fill" className="text-coral" />
          <span>ท่องเที่ยวชายแดนใต้</span>
        </div>
      </div>
    </main>
  );
}

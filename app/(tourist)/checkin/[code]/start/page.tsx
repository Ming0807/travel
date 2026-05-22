import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { CheckinUnavailable } from "@/components/checkin/CheckinUnavailable";
import { MinimalProfileForm } from "@/components/checkin/MinimalProfileForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MinimalProfilePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  const context = await resolveAndValidateCheckinCode(code);

  if (context.status !== "valid" || !context.details) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <CheckinUnavailable status={context.status as any} />;
  }

  await trackCheckinFunnelEvent("certificate_started", context.details);

  const supabase = await createSupabaseServerClient();
  
  // Fetch countries and active provinces for the form
  const [{ data: countries }, { data: provinces }] = await Promise.all([
    supabase.from("countries").select("country_id, country_name_th").order("country_id"),
    supabase.from("provinces").select("province_id, province_name_th").order("province_name_th")
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col relative pb-24">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-ink/90 to-[#FAF8F5]">
        {/* Placeholder for balloons image, currently using a nice subtle gradient */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF8F5]/50 to-[#FAF8F5]"></div>
      </div>
      
      <div className="relative z-10 pt-[10vh]">
        <div className="max-w-5xl mx-auto px-4 mb-8 flex items-center justify-center md:justify-start gap-4 text-ink">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E18868]">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black">สร้างใบประกาศ</h1>
            <p className="text-sm font-medium opacity-80">ใช้เวลาเพียงเล็กน้อยเพื่อเริ่มเก็บความทรงจำ</p>
          </div>
        </div>

        <MinimalProfileForm 
          checkinCode={code} 
          countries={countries || []} 
          provinces={provinces || []} 
        />
      </div>
    </div>
  );
}

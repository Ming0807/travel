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
    <div className="min-h-screen bg-gray-50 flex flex-col pt-12 pb-24">
      <MinimalProfileForm 
        checkinCode={code} 
        countries={countries || []} 
        provinces={provinces || []} 
      />
    </div>
  );
}

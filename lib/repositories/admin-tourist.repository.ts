import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function getAdminTourists(limit = 100) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourists")
    .select(`
      tourist_id,
      display_name,
      countries (
        country_name_en,
        country_name_th
      ),
      provinces (
        province_name_en,
        province_name_th
      ),
      created_at,
      tourist_identities (
        provider
      ),
      visits (
        certificates (
          certificate_id
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getAdminTourists error:", error);
    throw new Error("Failed to fetch tourists");
  }

  // Hide PII if there were any, though this schema is already privacy-focused.
  // Aggregate stats
  return data.map(tourist => {
    const certificateCount = tourist.visits?.reduce(
      (count: number, visit: any) => count + (visit.certificates?.length || 0), 0
    ) || 0;

    return {
      id: tourist.tourist_id,
      name: tourist.display_name,
      location: ((tourist.provinces as any)?.[0]?.province_name_en || (tourist.provinces as any)?.province_name_en) ||
                ((tourist.countries as any)?.[0]?.country_name_en || (tourist.countries as any)?.country_name_en) ||
                "Unknown",
      joinedAt: tourist.created_at,
      providers: tourist.tourist_identities.map((i: any) => i.provider),
      certificateCount
    };
  });
}

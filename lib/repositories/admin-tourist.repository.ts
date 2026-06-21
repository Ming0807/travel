import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

type AdminTouristCountry = {
  country_name_en: string | null;
};

type AdminTouristProvince = {
  province_name_en: string | null;
};

type AdminTouristIdentity = {
  provider: string | null;
};

type AdminTouristVisit = {
  certificates?: { certificate_id: number }[] | null;
};

type AdminTouristQueryRow = {
  tourist_id: number;
  display_name: string | null;
  countries?: SupabaseJoin<AdminTouristCountry>;
  provinces?: SupabaseJoin<AdminTouristProvince>;
  created_at: string | null;
  tourist_identities?: AdminTouristIdentity[] | null;
  visits?: AdminTouristVisit[] | null;
};

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
  return (data as AdminTouristQueryRow[]).map(tourist => {
    const certificateCount = tourist.visits?.reduce(
      (count, visit) => count + (visit.certificates?.length || 0), 0
    ) || 0;
    const province = firstJoin(tourist.provinces);
    const country = firstJoin(tourist.countries);

    return {
      id: String(tourist.tourist_id),
      name: tourist.display_name || "Anonymous Guest",
      location: province?.province_name_en ||
                country?.country_name_en ||
                "Unknown",
      joinedAt: tourist.created_at || new Date(0).toISOString(),
      providers: (tourist.tourist_identities ?? []).map((i) => i.provider).filter((provider): provider is string => Boolean(provider)),
      certificateCount
    };
  });
}

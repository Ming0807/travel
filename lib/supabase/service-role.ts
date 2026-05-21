import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/config/public-env";
import { getServerEnv } from "@/lib/config/server-env";


export function createSupabaseServiceRoleClient() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export interface Role {
  role_id: number;
  role_name: string;
  description: string;
  is_active: boolean;
}

export async function getActiveRoles(): Promise<Role[]> {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("is_active", true)
    .order("role_id", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    throw new Error("Failed to fetch roles");
  }

  return data as Role[];
}

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export interface Permission {
  permission_id: number;
  permission_name: string;
  description: string;
}

export async function getAllPermissions(): Promise<Permission[]> {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("permission_name", { ascending: true });

  if (error) {
    console.error("Error fetching permissions:", error);
    throw new Error("Failed to fetch permissions");
  }

  return data as Permission[];
}

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function getAdminUsers() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select(`
      admin_id,
      email,
      display_name,
      is_active,
      last_login_at,
      created_at,
      admin_user_roles (
        role_id,
        roles (
          role_name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminUsers error:", error);
    throw new Error("Failed to fetch admin users");
  }

  return data.map(user => ({
    ...user,
    roles: user.admin_user_roles.map((r: any) => r.roles.role_name)
  }));
}

export async function toggleAdminUserStatus(adminId: string, isActive: boolean) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("admin_id", adminId);

  if (error) throw new Error("Failed to update admin user status");
  return true;
}

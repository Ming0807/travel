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

export async function getAdminUserById(adminId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select(`
      admin_id,
      email,
      display_name,
      is_active,
      admin_user_roles (
        role_id
      )
    `)
    .eq("admin_id", adminId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error("Failed to fetch admin user");
  }

  return {
    ...data,
    roleIds: data.admin_user_roles.map((r: any) => r.role_id)
  };
}

export async function inviteAdminUser(data: { email: string; displayName: string; roleIds: number[] }) {
  const supabase = createSupabaseServiceRoleClient();
  
  // 1. Invite via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(data.email);
  
  if (authError) {
    console.error("Auth Invite Error:", authError);
    throw new Error("Failed to invite user via Auth");
  }

  const authUserId = authData.user.id;

  // 2. Insert into admin_users (using auth.users id as admin_id or separate UUID?)
  // Wait, let's check schema. Is admin_id a UUID that is generated, or does it map to auth_user_id?
  // Our schema uses `admin_id UUID DEFAULT gen_random_uuid()` and `auth_user_id UUID`.
  // Let's insert and get the new admin_id.
  
  const { data: adminUser, error: insertError } = await supabase
    .from("admin_users")
    .insert({
      email: data.email,
      display_name: data.displayName,
      auth_user_id: authUserId,
      is_active: true
    })
    .select("admin_id")
    .single();

  if (insertError) {
    console.error("Admin User Insert Error:", insertError);
    throw new Error("Failed to create admin user record");
  }

  // 3. Assign roles
  if (data.roleIds.length > 0) {
    const roleInserts = data.roleIds.map(roleId => ({
      admin_id: adminUser.admin_id,
      role_id: roleId
    }));
    const { error: rolesError } = await supabase.from("admin_user_roles").insert(roleInserts);
    if (rolesError) throw new Error("Failed to assign roles");
  }

  return adminUser.admin_id;
}

export async function updateAdminUser(adminId: string, data: { displayName: string; roleIds: number[]; isActive: boolean }) {
  const supabase = createSupabaseServiceRoleClient();
  
  // 1. Update admin_users
  const { error: updateError } = await supabase
    .from("admin_users")
    .update({
      display_name: data.displayName,
      is_active: data.isActive,
      updated_at: new Date().toISOString()
    })
    .eq("admin_id", adminId);

  if (updateError) throw new Error("Failed to update admin user record");

  // 2. Sync roles atomically via RPC
  const { error: rpcError } = await supabase.rpc('sync_admin_user_roles', {
    p_admin_id: adminId,
    p_role_ids: data.roleIds
  });

  if (rpcError) {
    console.error("sync_admin_user_roles RPC error:", rpcError);
    throw new Error("Failed to update roles");
  }

  return true;
}

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

export async function getAllRolesWithPermissions() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("roles")
    .select(`
      *,
      role_permissions (
        permissions (
          permission_name
        )
      )
    `)
    .order("role_id");
  
  if (error) throw error;

  return data.map(role => ({
    ...role,
    permissions: role.role_permissions.map((rp: any) => rp.permissions.permission_name)
  }));
}

export async function getRoleById(roleId: number) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("roles")
    .select(`
      *,
      role_permissions (
        permission_id
      )
    `)
    .eq("role_id", roleId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error("Failed to fetch role");
  }

  return {
    ...data,
    permissionIds: data.role_permissions.map((rp: any) => rp.permission_id)
  };
}

export async function createRole(data: { roleName: string; description: string; isActive: boolean; permissionIds: number[] }) {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data: role, error: insertError } = await supabase
    .from("roles")
    .insert({
      role_name: data.roleName,
      description: data.description,
      is_active: data.isActive
    })
    .select("role_id")
    .single();

  if (insertError) throw new Error("Failed to create role: " + insertError.message);

  if (data.permissionIds.length > 0) {
    const permissionInserts = data.permissionIds.map(permId => ({
      role_id: role.role_id,
      permission_id: permId
    }));
    const { error: permError } = await supabase.from("role_permissions").insert(permissionInserts);
    if (permError) throw new Error("Failed to assign permissions to role");
  }

  return role.role_id;
}

export async function updateRole(roleId: number, data: { roleName: string; description: string; isActive: boolean; permissionIds: number[] }) {
  const supabase = createSupabaseServiceRoleClient();
  
  // Prevent renaming super_admin just in case
  const role = await getRoleById(roleId);
  if (!role) throw new Error("Role not found");
  if (role.role_name === "super_admin" && (data.roleName !== "super_admin" || data.isActive !== true)) {
    throw new Error("Cannot modify super_admin core properties");
  }

  const { error: updateError } = await supabase
    .from("roles")
    .update({
      role_name: data.roleName,
      description: data.description,
      is_active: data.isActive
    })
    .eq("role_id", roleId);

  if (updateError) throw new Error("Failed to update role");

  if (role.role_name !== "super_admin") {
    // Only sync permissions if it's not super_admin. super_admin has everything implicitly or via seed.
    await supabase.from("role_permissions").delete().eq("role_id", roleId);
    
    if (data.permissionIds.length > 0) {
      const permissionInserts = data.permissionIds.map(permId => ({
        role_id: roleId,
        permission_id: permId
      }));
      const { error: permError } = await supabase.from("role_permissions").insert(permissionInserts);
      if (permError) throw new Error("Failed to update permissions");
    }
  }

  return true;
}

export async function deleteRole(roleId: number) {
  const supabase = createSupabaseServiceRoleClient();
  
  const role = await getRoleById(roleId);
  if (!role) throw new Error("Role not found");
  
  const protectedRoles = ["super_admin", "admin", "province_admin", "attraction_manager", "viewer"];
  if (protectedRoles.includes(role.role_name)) {
    throw new Error("Cannot delete core system roles");
  }

  // Check if role is assigned to users
  const { count, error: countError } = await supabase
    .from("admin_user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role_id", roleId);

  if (countError) throw new Error("Failed to check role usage");
  if (count && count > 0) {
    throw new Error("Cannot delete role because it is assigned to users");
  }

  const { error } = await supabase.from("roles").delete().eq("role_id", roleId);
  if (error) throw new Error("Failed to delete role");
  
  return true;
}

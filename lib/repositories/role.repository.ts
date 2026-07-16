import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AdminRoleExportFilters,
  AdminRoleFilters,
} from "@/lib/validation/admin-role";

export interface Role {
  role_id: number;
  role_name: string;
  description: string;
  is_active: boolean;
}

type RolePermissionNameJoin = {
  permissions: { permission_name: string } | { permission_name: string }[];
};

type RolePermissionIdJoin = {
  permission_id: number;
};

type RoleDatabaseRow = {
  role_id: number;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  role_permissions: RolePermissionNameJoin[];
};

export type AdminRoleListItem = Omit<RoleDatabaseRow, "description" | "role_permissions"> & {
  description: string;
  permissions: string[];
};

type FilterableRoleQuery<T> = {
  eq(column: string, value: unknown): T;
  or(filters: string): T;
  order(column: string, options: { ascending: boolean }): T;
};

const ADMIN_ROLE_SELECT = `
  role_id,
  role_name,
  description,
  is_active,
  created_at,
  role_permissions (
    permissions (permission_name)
  )
`;

function getPermissionName(join: RolePermissionNameJoin): string | null {
  const permission = Array.isArray(join.permissions) ? join.permissions[0] : join.permissions;
  return permission?.permission_name ?? null;
}

function mapAdminRole(row: unknown): AdminRoleListItem {
  const role = row as RoleDatabaseRow;
  return {
    role_id: role.role_id,
    role_name: role.role_name,
    description: role.description ?? "",
    is_active: role.is_active,
    created_at: role.created_at,
    permissions: (role.role_permissions ?? [])
      .map(getPermissionName)
      .filter((permissionName): permissionName is string => Boolean(permissionName)),
  };
}

function quoteRoleSearchPattern(search: string): string {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

function applyRoleFiltersAndSort<T extends FilterableRoleQuery<T>>(
  query: T,
  filters: AdminRoleExportFilters
): T {
  let filtered = query;
  if (filters.search) {
    const pattern = quoteRoleSearchPattern(filters.search);
    filtered = filtered.or(`role_name.ilike.${pattern},description.ilike.${pattern}`);
  }
  if (filters.status) filtered = filtered.eq("is_active", filters.status === "active");

  if (filters.sort === "name_asc" || filters.sort === "name_desc") {
    filtered = filtered.order("role_name", { ascending: filters.sort === "name_asc" });
  } else {
    filtered = filtered.order("created_at", { ascending: filters.sort === "oldest" });
  }
  return filtered.order("role_id", { ascending: true });
}

export async function listAdminRoles(filters: AdminRoleFilters): Promise<{
  items: AdminRoleListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const { page: _page, pageSize: _pageSize, ...queryFilters } = filters;
  void _page;
  void _pageSize;

  let query = supabase.from("roles").select(ADMIN_ROLE_SELECT, { count: "exact" });
  query = applyRoleFiltersAndSort(query, queryFilters);
  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error("ADMIN_ROLE_LIST_FAILED");
  return {
    items: (data ?? []).map(mapAdminRole),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminRoles(
  filters: AdminRoleExportFilters,
  limit: number
): Promise<AdminRoleListItem[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("roles").select(ADMIN_ROLE_SELECT);
  query = applyRoleFiltersAndSort(query, filters);
  const { data, error } = await query.limit(limit);

  if (error) throw new Error("EXPORT_ROLES_FAILED");
  return (data ?? []).map(mapAdminRole);
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

  return data.map(mapAdminRole);
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
    permissionIds: (data.role_permissions as unknown as RolePermissionIdJoin[]).map((rp) => rp.permission_id)
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
    const { error: rpcError } = await supabase.rpc('sync_role_permissions', {
      p_role_id: roleId,
      p_permission_ids: data.permissionIds
    });

    if (rpcError) {
      console.error("sync_role_permissions RPC error:", rpcError);
      throw new Error("Failed to update permissions");
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

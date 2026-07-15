import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminUserFilters } from "@/lib/validation/admin-user";

type AdminUserRoleJoin = {
  role_id: number;
  roles: { role_name: string } | { role_name: string }[];
};

type AdminUserRoleIdJoin = {
  role_id: number;
};

type AdminUserDatabaseRow = {
  admin_id: string;
  email: string | null;
  display_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  admin_user_roles: AdminUserRoleJoin[];
};

export type AdminUserListItem = Omit<AdminUserDatabaseRow, "admin_user_roles"> & {
  roles: string[];
};

export type AdminUserRoleOption = {
  role_id: number;
  role_name: string;
};

type FilterableAdminUserQuery<T> = {
  eq(column: string, value: unknown): T;
  or(filters: string): T;
  order(column: string, options: { ascending: boolean }): T;
};

function getJoinedRoleName(join: AdminUserRoleJoin): string | null {
  const role = Array.isArray(join.roles) ? join.roles[0] : join.roles;
  return role?.role_name ?? null;
}

function mapAdminUser(row: unknown): AdminUserListItem {
  const user = row as AdminUserDatabaseRow;
  return {
    admin_id: user.admin_id,
    email: user.email,
    display_name: user.display_name,
    is_active: user.is_active,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    roles: (user.admin_user_roles ?? [])
      .map(getJoinedRoleName)
      .filter((roleName): roleName is string => Boolean(roleName)),
  };
}

function quoteAdminUserSearchPattern(search: string): string {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

function applyAdminUserFiltersAndSort<T extends FilterableAdminUserQuery<T>>(
  query: T,
  filters: Omit<AdminUserFilters, "page" | "pageSize">
): T {
  let filteredQuery = query;
  if (filters.search) {
    const pattern = quoteAdminUserSearchPattern(filters.search);
    filteredQuery = filteredQuery.or(`display_name.ilike.${pattern},email.ilike.${pattern}`);
  }
  if (filters.status) filteredQuery = filteredQuery.eq("is_active", filters.status === "active");
  if (filters.roleId) filteredQuery = filteredQuery.eq("filter_roles.role_id", filters.roleId);

  if (filters.sort === "name_asc" || filters.sort === "name_desc") {
    filteredQuery = filteredQuery.order("display_name", { ascending: filters.sort === "name_asc" });
  } else {
    filteredQuery = filteredQuery.order("created_at", { ascending: filters.sort === "oldest" });
  }
  return filteredQuery.order("admin_id", { ascending: true });
}

function adminUserSelect(filters: Omit<AdminUserFilters, "page" | "pageSize">): string {
  const roleFilterJoin = filters.roleId
    ? ", filter_roles:admin_user_roles!inner(role_id)"
    : "";
  return `
    admin_id,
    email,
    display_name,
    is_active,
    last_login_at,
    created_at,
    admin_user_roles (
      role_id,
      roles (role_name)
    )${roleFilterJoin}
  `;
}

export async function listAdminUsers(filters: AdminUserFilters): Promise<{
  items: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("admin_users")
    .select(adminUserSelect(filters), { count: "exact" });
  query = applyAdminUserFiltersAndSort(query, filters);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminUsers error:", error);
    throw new Error("Failed to fetch admin users");
  }

  return {
    items: (data ?? []).map(mapAdminUser),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminUsers(
  filters: Omit<AdminUserFilters, "page" | "pageSize">,
  limit: number
): Promise<AdminUserListItem[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("admin_users").select(adminUserSelect(filters));
  query = applyAdminUserFiltersAndSort(query, filters);

  const { data, error } = await query.limit(limit);
  if (error) throw new Error("EXPORT_USERS_FAILED");
  return (data ?? []).map(mapAdminUser);
}

export async function getAdminUserRoleOptions(): Promise<AdminUserRoleOption[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("roles")
    .select("role_id, role_name")
    .order("role_name", { ascending: true });

  if (error) throw new Error("Failed to fetch admin user role options");
  return (data ?? []) as AdminUserRoleOption[];
}

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

  return data.map((row) => {
    const user = mapAdminUser(row);
    return {
      ...user,
      display_name: user.display_name ?? "",
      email: user.email ?? "",
    };
  });
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
    roleIds: (data.admin_user_roles as unknown as AdminUserRoleIdJoin[]).map((r) => r.role_id)
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

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function logAdminAction({
  adminId,
  action,
  entityType,
  entityId,
  details
}: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details_json: details
  });

  if (error) {
    console.error("Failed to insert audit log:", error);
    // We don't throw here to prevent blocking the main action,
    // but in a strict compliance environment, we might want to.
  }
}

export async function getAuditLogs(limit = 100) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      admin_users (
        display_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getAuditLogs error:", error);
    throw new Error("Failed to fetch audit logs");
  }

  return data;
}

export type AuditLogFilters = {
  adminId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export async function getAuditLogsPaginated(
  page = 1,
  limit = 20,
  filters: AuditLogFilters = {}
) {
  const supabase = createSupabaseServiceRoleClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("audit_logs")
    .select(`
      *,
      admin_users (
        display_name,
        email
      )
    `, { count: "exact" });

  if (filters.adminId) {
    query = query.eq("admin_id", filters.adminId);
  }
  
  if (filters.action) {
    query = query.ilike("action", `%${filters.action}%`);
  }
  
  if (filters.entityType) {
    query = query.ilike("entity_type", `%${filters.entityType}%`);
  }

  if (filters.startDate) {
    query = query.gte("created_at", `${filters.startDate}T00:00:00.000Z`);
  }

  if (filters.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59.999Z`);
  }

  if (filters.search) {
    // Basic search across action, entity_type or related user email/name
    // Note: PostgREST doesn't support easy full-text cross-table search via API easily without a view
    // so we search on action and entity_type directly. 
    query = query.or(`action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getAuditLogsPaginated error:", error);
    throw new Error("Failed to fetch audit logs");
  }

  return {
    data,
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

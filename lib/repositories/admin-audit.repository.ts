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

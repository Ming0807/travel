import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type AuditLogRecordInput = {
  adminId: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | number | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

export async function insertAuditLog(input: AuditLogRecordInput) {
  const supabase = createSupabaseServiceRoleClient();

  const { error } = await supabase.from("audit_logs").insert({
    admin_id: input.adminId,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId === null || input.entityId === undefined ? null : String(input.entityId),
    old_data: input.oldData ?? null,
    new_data: input.newData ?? null,
    ip_address: input.ipAddress ?? null
  });

  if (error) {
    throw new Error("AUDIT_LOG_INSERT_FAILED");
  }
}

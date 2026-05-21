import "server-only";

import type { AdminActor } from "@/lib/auth/guards";
import { insertAuditLog } from "@/lib/repositories/audit-log.repository";

type JsonRecord = Record<string, unknown>;

export type AuditLogInput = {
  actor?: AdminActor | null;
  action: string;
  entityType?: string | null;
  entityId?: string | number | null;
  result?: "success" | "failed" | "denied" | "partial_success";
  oldValues?: JsonRecord | null;
  newValues?: JsonRecord | null;
  metadata?: JsonRecord | null;
};

const REDACTED = "[REDACTED]";
const SECRET_KEY_PATTERN = /(password|token|secret|service_role_key|authorization|line_id_token|provider_user_id|guest_token|device_token|signed_url)/i;
const LARGE_TEXT_LIMIT = 500;

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeValue(item));
  }

  if (typeof value === "object") {
    return sanitizeRecord(value as JsonRecord);
  }

  if (typeof value === "string") {
    return value.length > LARGE_TEXT_LIMIT ? `${value.slice(0, LARGE_TEXT_LIMIT)}...` : value;
  }

  return value;
}

function sanitizeRecord(record: JsonRecord): JsonRecord {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      SECRET_KEY_PATTERN.test(key) ? REDACTED : sanitizeValue(value)
    ])
  );
}

function buildNewData(input: AuditLogInput) {
  return sanitizeRecord({
    ...(input.newValues ?? {}),
    _audit: {
      result: input.result ?? "success",
      metadata: input.metadata ?? null
    }
  });
}

export async function logAuditAction(input: AuditLogInput) {
  try {
    await insertAuditLog({
      adminId: input.actor?.adminId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldData: input.oldValues ? sanitizeRecord(input.oldValues) : null,
      newData: buildNewData(input)
    });
  } catch (error) {
    console.error("Audit log write failed:", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error
    });
  }
}

export async function logAdminMutation(input: Omit<AuditLogInput, "result">) {
  await logAuditAction({ ...input, result: "success" });
}

export async function logDeniedAction(input: Omit<AuditLogInput, "result">) {
  await logAuditAction({ ...input, result: "denied" });
}

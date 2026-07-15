import { z } from "zod";

const REDACTED = "[REDACTED]";
const LARGE_TEXT_LIMIT = 500;

const AUDIT_ACTION_FILTERS = [
  "create",
  "update",
  "delete",
  "archive",
  "publish",
  "unpublish",
  "activate",
  "deactivate",
  "approve",
  "reject",
  "export",
  "login",
] as const;

const AUDIT_ENTITY_TYPE_FILTERS = [
  "attraction",
  "story",
  "route",
  "restaurant",
  "accommodation",
  "media",
  "photo_spot",
  "checkin_code",
  "badge",
  "review",
  "admin_users",
  "roles",
  "content_media",
  "settings",
  "site_settings",
  "certificate",
  "audit_export",
  "attraction_export",
  "photo_spot_export",
  "checkin_code_export",
  "visit_export",
  "survey_export",
  "tourist_export",
  "user_export",
  "message_export",
] as const;

const secretKeyPattern =
  /(password|token|secret|service[_-]?role|authorization|line[_-]?id[_-]?token|provider[_-]?user[_-]?id|guest[_-]?token|device[_-]?token|signed[_-]?url|signedurl)/i;

const optionalSearch = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.string().max(120).optional()
);

const optionalDateOnly = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    }, "Invalid date")
    .optional()
);

const optionalAdminId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.union([z.literal("system"), z.string().uuid()]).optional()
);

const optionalAction = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.enum(AUDIT_ACTION_FILTERS).optional()
);

const optionalEntityType = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.enum(AUDIT_ENTITY_TYPE_FILTERS).optional()
);

const optionalSort = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.enum(["newest", "oldest"]).default("newest")
);

export const adminAuditQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    adminId: optionalAdminId,
    action: optionalAction,
    entityType: optionalEntityType,
    startDate: optionalDateOnly,
    endDate: optionalDateOnly,
    search: optionalSearch,
    sort: optionalSort,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after start date.",
      });
    }
  });

export type AdminAuditQuery = z.infer<typeof adminAuditQuerySchema>;
export type AdminAuditFilters = Omit<AdminAuditQuery, "page" | "pageSize">;

export type AuditLogExportRowSource = {
  created_at: string;
  admin_users?: { display_name?: string | null; email?: string | null } | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
};

export type AuditLogExportRow = {
  Timestamp: string;
  Actor: string;
  Action: string;
  "Entity Type": string;
  "Entity ID": string;
  "Old Data Fields": string;
  "New Data Fields": string;
};

export function auditExportFilters(filters: AdminAuditQuery): AdminAuditFilters {
  const { page: _page, pageSize: _pageSize, ...rest } = filters;
  void _page;
  void _pageSize;
  return Object.fromEntries(
    Object.entries(rest).filter((entry): entry is [keyof AdminAuditFilters, NonNullable<AdminAuditFilters[keyof AdminAuditFilters]>] => entry[1] !== undefined)
  ) as AdminAuditFilters;
}

export function escapeAuditIlikePattern(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, " ");
}

export function buildAuditSearchFilter(search: string): string {
  const pattern = escapeAuditIlikePattern(search);
  return `action.ilike.%${pattern}%,entity_type.ilike.%${pattern}%`;
}

export function formatAuditTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function fieldList(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return Object.keys(value as Record<string, unknown>).sort().join(", ");
}

export function toAuditExportRows(logs: AuditLogExportRowSource[]): AuditLogExportRow[] {
  return logs.map((log) => ({
    Timestamp: formatAuditTimestamp(log.created_at),
    Actor: log.admin_users?.display_name || "System",
    Action: log.action,
    "Entity Type": log.entity_type,
    "Entity ID": log.entity_id || "",
    "Old Data Fields": fieldList(log.old_data),
    "New Data Fields": fieldList(log.new_data),
  }));
}

function sanitizeAuditValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice(0, 50).map(sanitizeAuditValue);
  if (typeof value === "object") return sanitizeAuditLogDetails(value as Record<string, unknown>);
  if (typeof value === "string") {
    return value.length > LARGE_TEXT_LIMIT ? `${value.slice(0, LARGE_TEXT_LIMIT)}...` : value;
  }
  return value;
}

export function sanitizeAuditLogDetails(details: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [
      key,
      secretKeyPattern.test(key) ? REDACTED : sanitizeAuditValue(value),
    ])
  );
}

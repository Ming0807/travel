import { z } from "zod";

export const CONTACT_MESSAGE_STATUSES = ["unread", "read", "archived"] as const;
export const CONTACT_MESSAGE_STATUS_FILTERS = ["all", ...CONTACT_MESSAGE_STATUSES] as const;
export const CONTACT_MESSAGE_SORTS = ["newest", "oldest"] as const;

const optionalSearch = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.string().max(120).optional()
);

const optionalStatus = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.enum(CONTACT_MESSAGE_STATUS_FILTERS).default("all")
);

const optionalSort = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.enum(CONTACT_MESSAGE_SORTS).default("newest")
);

export const adminMessageQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: optionalStatus,
    search: optionalSearch,
    sort: optionalSort,
  })
  .strict();

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];
export type ContactMessageStatusFilter = (typeof CONTACT_MESSAGE_STATUS_FILTERS)[number];
export type ContactMessageSort = (typeof CONTACT_MESSAGE_SORTS)[number];
export type AdminMessageQuery = z.infer<typeof adminMessageQuerySchema>;
export type AdminMessageExportFilters = Omit<AdminMessageQuery, "page" | "pageSize">;

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  is_replied: boolean;
  read_at: string | null;
  read_by?: string | null;
  created_at: string;
};

export type ContactMessageExportRow = {
  Name: string;
  Email: string;
  Phone: string;
  Subject: string;
  Message: string;
  Status: string;
  "Is Replied": string;
  "Read At": string;
  "Created At": string;
};

export function messageExportFilters(filters: AdminMessageQuery): AdminMessageExportFilters {
  const { page: _page, pageSize: _pageSize, ...exportFilters } = filters;
  void _page;
  void _pageSize;
  return exportFilters;
}

export function quoteContactMessageIlikePattern(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

export function buildContactMessageSearchFilter(search: string): string {
  const pattern = quoteContactMessageIlikePattern(search);
  return ["name", "email", "subject", "message"]
    .map((column) => `${column}.ilike.${pattern}`)
    .join(",");
}

export function toContactMessageExportRows(rows: ContactMessageRow[]): ContactMessageExportRow[] {
  return rows.map((row) => ({
    Name: row.name || "",
    Email: row.email || "",
    Phone: row.phone || "",
    Subject: row.subject || "",
    Message: row.message || "",
    Status: row.status || "",
    "Is Replied": row.is_replied ? "Yes" : "No",
    "Read At": row.read_at || "",
    "Created At": row.created_at || "",
  }));
}

import { z } from "zod";

const optionalSearch = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().max(120).optional()
);

function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.enum(values).optional()
  );
}

export const adminCertificateTemplateFiltersSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(12),
    search: optionalSearch,
    status: optionalEnum(["active", "inactive"]),
    language: optionalEnum(["th", "en"]),
    scope: optionalEnum(["global", "attraction"]),
    sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
  })
  .strict();

export const certificateTemplateUploadFieldsSchema = z
  .object({
    templateName: z.string().trim().min(2).max(120),
    language: z.enum(["th", "en"]),
    theme: z.enum(["emerald-gold", "blue-silver", "coral-white"]),
  })
  .strict();

export type AdminCertificateTemplateFilters = z.infer<
  typeof adminCertificateTemplateFiltersSchema
>;
export type AdminCertificateTemplateExportFilters = Omit<
  AdminCertificateTemplateFilters,
  "page" | "pageSize"
>;

export function certificateTemplateExportFilters(
  filters: AdminCertificateTemplateFilters
): AdminCertificateTemplateExportFilters {
  const { page: _page, pageSize: _pageSize, ...rest } = filters;
  void _page;
  void _pageSize;
  return rest;
}

import { z } from "zod";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";

export const adminMediaLibraryCategories = [
  "General",
  "Homepage",
  "Attractions",
  "Badges",
  "Certificates",
] as const;

export const adminMediaLibraryLifecycleStatuses = ["active", "archived", "all"] as const;
export const adminMediaLibraryMediaTypes = ["jpeg", "png", "webp"] as const;

const optionalSearch = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.string().max(120).optional(),
);

const optionalCategory = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.enum(adminMediaLibraryCategories).optional(),
);

const optionalMediaType = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.enum(adminMediaLibraryMediaTypes).optional(),
);

export const adminMediaLibraryFiltersSchema = adminPaginationSchema.extend({
  search: optionalSearch,
  category: optionalCategory,
  lifecycleStatus: z.enum(adminMediaLibraryLifecycleStatuses).default("active"),
  mediaType: optionalMediaType,
}).strict();

export const adminMediaLibraryExportFiltersSchema = adminMediaLibraryFiltersSchema.extend({
  format: z.enum(["csv", "xlsx"]).default("csv"),
});

export type AdminMediaLibraryFilters = z.infer<typeof adminMediaLibraryFiltersSchema>;
export type AdminMediaLibraryExportFilters = z.infer<typeof adminMediaLibraryExportFiltersSchema>;
export type AdminMediaLibraryCategory = (typeof adminMediaLibraryCategories)[number];
export type AdminMediaLibraryLifecycleStatus = (typeof adminMediaLibraryLifecycleStatuses)[number];
export type AdminMediaLibraryMediaType = (typeof adminMediaLibraryMediaTypes)[number];

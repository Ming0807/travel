import { z } from "zod";

export const badgeDefinitionSchema = z.object({
  badgeKey: z
    .string()
    .min(2, "Badge key must be at least 2 characters")
    .max(100, "Badge key must be at most 100 characters")
    .regex(/^[a-z0-9_]+$/, "Badge key must contain only lowercase letters, numbers, and underscores"),
  nameTh: z.string().min(1, "Thai name is required").max(255),
  nameEn: z.string().min(1, "English name is required").max(255),
  descriptionTh: z.string().optional().default(""),
  descriptionEn: z.string().optional().default(""),
  iconName: z.string().optional().default(""),
  iconColor: z.string().optional().default("#E18868"),
  category: z.enum(["exploration", "engagement", "milestone", "social"]),
  requirementType: z.enum([
    "xp_total",
    "stamp_count",
    "visit_count",
    "survey_count",
    "review_count",
    "restaurant_count",
    "province_count",
    "attractions_in_province",
    "attraction_category",
  ]),
  requirementValue: z.coerce.number().int().min(1, "Requirement value must be at least 1"),
  requirementExtra: z.string().optional().default(""),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true),
});

export type BadgeDefinitionInput = z.infer<typeof badgeDefinitionSchema>;

export const adminBadgeFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(["exploration", "engagement", "milestone", "social"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type AdminBadgeFilters = z.infer<typeof adminBadgeFiltersSchema>;

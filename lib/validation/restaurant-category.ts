import { z } from "zod";

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

const optionalName = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(120).nullable(),
).default(null);

export const restaurantCategorySectionSchema = z.enum(["local", "meals", "cafes", "other"]);

export const restaurantCategoryMutationSchema = z.object({
  slug: z.string()
    .trim()
    .toLowerCase()
    .min(2, "กรุณาระบุ slug ของหมวดหมู่")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น"),
  nameTh: z.string().trim().min(1, "กรุณาระบุชื่อหมวดหมู่ภาษาไทย").max(120),
  nameEn: optionalName,
  sectionKey: restaurantCategorySectionSchema.default("other"),
  displayOrder: z.coerce.number().int().min(0).max(10000).default(0),
  isFeatured: booleanFromForm,
  isActive: booleanFromForm,
});

export type RestaurantCategoryMutationInput = z.infer<typeof restaurantCategoryMutationSchema>;
export type RestaurantCategorySection = z.infer<typeof restaurantCategorySectionSchema>;

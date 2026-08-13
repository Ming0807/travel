import { describe, expect, it } from "vitest";
import {
  getAttractionPublishCategoryError,
  hasExplicitAttractionCategorySelection,
  parseAdminAttractionMutationFormData,
} from "@/lib/validation/admin-attraction";

function validForm() {
  const form = new FormData();
  form.set("provinceId", "1");
  form.set("slug", "wat-na-tham");
  form.set("nameTh", "วัดคูหาภิมุข");
  form.set("isActive", "true");
  return form;
}

describe("attraction category mutation validation", () => {
  it("distinguishes category editor fields from a legacy hidden primary field", () => {
    const sectionForm = new FormData();
    sectionForm.set("attractionTypeId", "3");
    expect(hasExplicitAttractionCategorySelection(sectionForm)).toBe(false);

    const categoryForm = new FormData();
    categoryForm.append("attractionTypeIds", "3");
    categoryForm.append("attractionTypeIds", "4");
    categoryForm.set("primaryAttractionTypeId", "3");
    expect(hasExplicitAttractionCategorySelection(categoryForm)).toBe(true);
  });

  it("blocks a publish transition without a primary category", () => {
    expect(getAttractionPublishCategoryError(false, null)).toBeTruthy();
    expect(getAttractionPublishCategoryError(false, 3)).toBeNull();
    expect(getAttractionPublishCategoryError(true, null)).toBeNull();
  });

  it("normalizes duplicate category values while preserving order", () => {
    const form = validForm();
    form.append("attractionTypeIds", "3");
    form.append("attractionTypeIds", "4");
    form.append("attractionTypeIds", "3");
    form.set("primaryAttractionTypeId", "3");

    const parsed = parseAdminAttractionMutationFormData(form);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.attractionTypeIds).toEqual([3, 4]);
      expect(parsed.data.attractionTypeId).toBe(3);
    }
  });

  it("supports the legacy single primary category field", () => {
    const form = validForm();
    form.set("attractionTypeId", "3");
    const parsed = parseAdminAttractionMutationFormData(form);
    expect(parsed.success && parsed.data.attractionTypeIds).toEqual([3]);
  });

  it("rejects more than four categories", () => {
    const form = validForm();
    [1, 2, 3, 4, 5].forEach((id) => form.append("attractionTypeIds", String(id)));
    form.set("primaryAttractionTypeId", "1");
    const parsed = parseAdminAttractionMutationFormData(form);
    expect(parsed.success).toBe(false);
  });

  it("requires a selected primary and requires it to belong to the selection", () => {
    const missing = validForm();
    missing.append("attractionTypeIds", "3");
    expect(parseAdminAttractionMutationFormData(missing).success).toBe(false);

    const invalid = validForm();
    invalid.append("attractionTypeIds", "3");
    invalid.set("primaryAttractionTypeId", "4");
    expect(parseAdminAttractionMutationFormData(invalid).success).toBe(false);
  });

  it("requires a primary category before publishing", () => {
    const form = validForm();
    form.set("isPublished", "true");
    expect(parseAdminAttractionMutationFormData(form).success).toBe(false);
  });
});

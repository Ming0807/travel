import { describe, expect, it } from "vitest";
import {
  adminCertificateTemplateFiltersSchema,
  certificateTemplateUploadFieldsSchema,
  certificateTemplateExportFilters,
} from "@/lib/validation/admin-certificate-template";

describe("adminCertificateTemplateFiltersSchema", () => {
  it("normalizes all supported filters", () => {
    expect(
      adminCertificateTemplateFiltersSchema.parse({
        page: "2",
        pageSize: "12",
        search: "  memory card  ",
        status: "active",
        language: "th",
        scope: "attraction",
        sort: "name_asc",
      })
    ).toEqual({
      page: 2,
      pageSize: 12,
      search: "memory card",
      status: "active",
      language: "th",
      scope: "attraction",
      sort: "name_asc",
    });
  });

  it("rejects unsupported values and unknown keys", () => {
    expect(adminCertificateTemplateFiltersSchema.safeParse({ language: "jp" }).success).toBe(false);
    expect(adminCertificateTemplateFiltersSchema.safeParse({ scope: "campaign" }).success).toBe(false);
    expect(adminCertificateTemplateFiltersSchema.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(adminCertificateTemplateFiltersSchema.safeParse({ format: "csv" }).success).toBe(false);
  });

  it("keeps list and export semantics aligned", () => {
    const parsed = adminCertificateTemplateFiltersSchema.parse({
      page: "4",
      search: "Yala",
      status: "inactive",
      language: "en",
      scope: "global",
      sort: "oldest",
    });

    expect(certificateTemplateExportFilters(parsed)).toEqual({
      search: "Yala",
      status: "inactive",
      language: "en",
      scope: "global",
      sort: "oldest",
    });
  });
});

describe("certificateTemplateUploadFieldsSchema", () => {
  it("normalizes supported upload metadata", () => {
    expect(
      certificateTemplateUploadFieldsSchema.parse({
        templateName: "  เทมเพลตยะลา  ",
        language: "th",
        theme: "emerald-gold",
        scope: "attraction",
        attractionId: "12",
      })
    ).toEqual({
      templateName: "เทมเพลตยะลา",
      language: "th",
      theme: "emerald-gold",
      scope: "attraction",
      attractionId: 12,
    });
  });

  it("rejects unknown language, theme, and oversized names", () => {
    expect(
      certificateTemplateUploadFieldsSchema.safeParse({
        templateName: "Template",
        language: "jp",
        theme: "emerald-gold",
        scope: "global",
      }).success
    ).toBe(false);
    expect(
      certificateTemplateUploadFieldsSchema.safeParse({
        templateName: "Template",
        language: "th",
        theme: "unknown",
        scope: "global",
      }).success
    ).toBe(false);
    expect(
      certificateTemplateUploadFieldsSchema.safeParse({
        templateName: "x".repeat(121),
        language: "th",
        theme: "emerald-gold",
        scope: "global",
      }).success
    ).toBe(false);
    expect(
      certificateTemplateUploadFieldsSchema.safeParse({
        templateName: "Template",
        language: "th",
        theme: "emerald-gold",
        scope: "attraction",
      }).success
    ).toBe(false);
  });
});

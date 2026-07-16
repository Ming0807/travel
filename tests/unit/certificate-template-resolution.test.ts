import { describe, expect, it } from "vitest";
import {
  CertificateTemplateResolutionError,
  selectCertificateTemplate,
  type CertificateTemplateCandidate,
} from "@/lib/services/certificate-template.service";

const candidates: CertificateTemplateCandidate[] = [
  {
    templateId: 1,
    templateName: "Global Thai",
    attractionId: null,
    backgroundPath: "certificate-templates/global-th.webp",
    language: "th",
    isDefault: true,
    layoutConfig: null,
    orientation: "landscape",
  },
  {
    templateId: 2,
    templateName: "Yala Thai",
    attractionId: 12,
    backgroundPath: "certificate-templates/yala-th.webp",
    language: "th",
    isDefault: true,
    layoutConfig: { theme: "emerald-gold" },
    orientation: "landscape",
  },
  {
    templateId: 3,
    templateName: "Yala English",
    attractionId: 12,
    backgroundPath: "certificate-templates/yala-en.webp",
    language: "en",
    isDefault: true,
    layoutConfig: null,
    orientation: "portrait",
  },
];

describe("selectCertificateTemplate", () => {
  it("prefers an attraction template in the requested language", () => {
    expect(selectCertificateTemplate(candidates, { attractionId: 12, language: "th" }))
      .toMatchObject({ templateId: 2 });
  });

  it("keeps the requested language ahead of a different-language attraction template", () => {
    expect(selectCertificateTemplate(candidates, { attractionId: 12, language: "en" }))
      .toMatchObject({ templateId: 3 });
  });

  it("falls back to Thai when the requested language is unavailable", () => {
    expect(selectCertificateTemplate(candidates.slice(0, 2), { attractionId: 99, language: "en" }))
      .toMatchObject({ templateId: 1 });
  });

  it("accepts a requested template only when it belongs to the attraction or global scope", () => {
    expect(
      selectCertificateTemplate(candidates, {
        attractionId: 12,
        language: "th",
        requestedTemplateId: 1,
      })
    ).toMatchObject({ templateId: 1 });

    expect(() =>
      selectCertificateTemplate(candidates, {
        attractionId: 99,
        language: "th",
        requestedTemplateId: 2,
      })
    ).toThrow(CertificateTemplateResolutionError);
  });

  it("fails explicitly when no active eligible template exists", () => {
    expect(() => selectCertificateTemplate([], { attractionId: 12, language: "th" }))
      .toThrow("CERTIFICATE_TEMPLATE_NOT_FOUND");
  });
});

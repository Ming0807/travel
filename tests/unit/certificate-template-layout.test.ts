import { describe, expect, it } from "vitest";
import {
  createDefaultCertificateLayout,
  getCertificateLayoutWarnings,
  normalizeCertificateTemplateLayout,
} from "@/lib/certificate/certificate-template-layout";

describe("certificate template layout contract", () => {
  it("creates distinct safe defaults for landscape and portrait templates", () => {
    const landscape = createDefaultCertificateLayout("landscape", "emerald-gold");
    const portrait = createDefaultCertificateLayout("portrait", "blue-silver");

    expect(landscape).toMatchObject({
      version: 1,
      orientation: "landscape",
      theme: "emerald-gold",
      photoShape: "circle",
      photoX: 27,
      contentX: 68,
    });
    expect(portrait).toMatchObject({
      orientation: "portrait",
      theme: "blue-silver",
      photoX: 50,
      contentX: 50,
    });
  });

  it("normalizes legacy and malformed JSON without exposing unknown keys", () => {
    expect(
      normalizeCertificateTemplateLayout({
        orientation: "portrait",
        theme: "coral-white",
        photoX: 999,
        contentY: "64",
        textColor: "not-a-color",
        unknown: "discard",
      })
    ).toEqual(
      expect.objectContaining({
        orientation: "portrait",
        theme: "coral-white",
        photoX: 50,
        contentY: 64,
        textColor: "#173F37",
      })
    );
    expect(normalizeCertificateTemplateLayout({ unknown: true })).not.toHaveProperty("unknown");
  });

  it("reports overlap and unsafe-edge placement for the studio", () => {
    const layout = {
      ...createDefaultCertificateLayout("landscape", "emerald-gold"),
      photoX: 20,
      photoY: 50,
      photoSize: 40,
      contentX: 22,
      contentY: 50,
      contentWidth: 50,
      safeMargin: 10,
    };

    expect(getCertificateLayoutWarnings(layout)).toEqual(
      expect.arrayContaining(["PHOTO_CONTENT_OVERLAP", "PHOTO_OUTSIDE_SAFE_ZONE"])
    );
  });

  it("keeps the built-in defaults warning-free", () => {
    expect(
      getCertificateLayoutWarnings(createDefaultCertificateLayout("landscape", "emerald-gold"))
    ).toEqual([]);
    expect(
      getCertificateLayoutWarnings(createDefaultCertificateLayout("portrait", "emerald-gold"))
    ).toEqual([]);
  });
});

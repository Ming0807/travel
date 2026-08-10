import { describe, expect, it } from "vitest";
import {
  selectPublicAttractionMedia,
  type PublicAttractionMediaRow,
} from "@/lib/attractions/public-detail";

const media = (patch: Partial<PublicAttractionMediaRow>): PublicAttractionMediaRow => ({
  storage_path: "attractions/default.webp",
  media_type: "image",
  is_cover: false,
  is_active: true,
  lifecycle_status: "active",
  display_order: 0,
  alt_text_th: null,
  alt_text_en: null,
  ...patch,
});

describe("selectPublicAttractionMedia", () => {
  it("uses the active cover as the main image and preserves the real gallery order", () => {
    const result = selectPublicAttractionMedia([
      media({ storage_path: "attractions/second.webp", display_order: 2 }),
      media({ storage_path: "attractions/cover.webp", is_cover: true, display_order: 9, alt_text_th: "ภาพปก" }),
      media({ storage_path: "attractions/first.webp", display_order: 1 }),
      media({ storage_path: "attractions/hidden.webp", is_active: false, is_cover: true }),
    ]);

    expect(result.mainImage).toEqual({
      url: "/site-media/attractions/cover.webp",
      alt: "ภาพปก",
    });
    expect(result.gallery.map((item) => item.url)).toEqual([
      "/site-media/attractions/cover.webp",
      "/site-media/attractions/first.webp",
      "/site-media/attractions/second.webp",
    ]);
  });

  it("does not treat video or embed records as gallery images and exposes only usable 360 media", () => {
    const result = selectPublicAttractionMedia([
      media({ media_type: "embed", storage_path: "<iframe>unsafe</iframe>" }),
      media({ media_type: "video360", storage_path: "https://tour.example/yala" }),
      media({ media_type: "external_url", storage_path: "javascript:alert(1)" }),
      media({ media_type: "panorama", storage_path: "attractions/panorama.webp", display_order: 2 }),
    ]);

    expect(result.gallery.map((item) => item.url)).toEqual([
      "/site-media/attractions/panorama.webp",
    ]);
    expect(result.virtualTour).toEqual({
      type: "video360",
      url: "https://tour.example/yala",
    });
  });
});

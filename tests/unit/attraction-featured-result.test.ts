import { describe, expect, it } from "vitest";

import { selectFeaturedAttraction } from "../../lib/attractions/featured-result";
import type { PublicAttractionCard } from "../../lib/repositories/public-content.repository";

function attraction(slug: string, imageUrl: string | null): PublicAttractionCard {
  return {
    slug,
    name: slug,
    province: "ยะลา",
    district: null,
    category: "ธรรมชาติ",
    description: null,
    imageUrl,
    imageAlt: slug,
    tags: [],
    rating: null,
    reviewCount: null,
    reviewState: "empty",
    latitude: null,
    longitude: null,
  };
}

describe("selectFeaturedAttraction", () => {
  it("selects the first attraction with a managed image", () => {
    const withoutImage = attraction("without-image", null);
    const withImage = attraction("with-image", "/site-media/attractions/with-image.webp");

    expect(selectFeaturedAttraction([withoutImage, withImage])).toEqual(withImage);
  });

  it("does not create a large featured placeholder", () => {
    expect(selectFeaturedAttraction([attraction("without-image", null)])).toBeNull();
    expect(selectFeaturedAttraction([attraction("blank-image", "   ")])).toBeNull();
  });
});

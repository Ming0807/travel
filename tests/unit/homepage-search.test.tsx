import { describe, expect, it } from "vitest";
import {
  buildHomepageSearchHref,
  type HomepageSearchCategory,
} from "@/components/homepage/HomepageSearch";

describe("buildHomepageSearchHref", () => {
  it.each<[HomepageSearchCategory, string, string]>([
    ["attractions", "น้ำตก", "/attractions?q=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%95%E0%B8%81"],
    ["restaurants", "โรตี", "/restaurants?q=%E0%B9%82%E0%B8%A3%E0%B8%95%E0%B8%B5"],
    ["accommodations", "เบตง", "/accommodations?q=%E0%B9%80%E0%B8%9A%E0%B8%95%E0%B8%87"],
    ["stories", "ชุมชน", "/stories?search=%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%8A%E0%B8%99"],
  ])("maps %s search to its real public route", (category, query, expected) => {
    expect(buildHomepageSearchHref(category, query)).toBe(expected);
  });

  it("trims the query and omits an empty search parameter", () => {
    expect(buildHomepageSearchHref("attractions", "  ")).toBe("/attractions");
    expect(buildHomepageSearchHref("stories", "  ชุมชนยะลา  ")).toBe(
      "/stories?search=%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%8A%E0%B8%99%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2",
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  buildAttractionSectionNavigation,
  getAttractionSectionLabel,
} from "@/lib/content/attraction-sections";

describe("attraction section navigation", () => {
  it("keeps required sections and hides empty optional sections", () => {
    const sections = buildAttractionSectionNavigation(
      {
        description: "A public overview",
        thingsToDo: [],
        foodAndDrink: [],
        travelTips: [],
        howToGetThere: null,
        articles: [],
      },
      { includeReviews: false }
    );

    expect(sections.map((section) => section.key)).toEqual([
      "overview",
      "how_to_get_there",
    ]);
  });

  it("adds optional sections only when content exists", () => {
    const sections = buildAttractionSectionNavigation(
      {
        description: "A public overview",
        history: "A local history",
        thingsToDo: [{ id: "a" }],
        foodAndDrink: [{ id: "r" }],
        whereToStay: [{ id: "h" }],
        travelTips: ["Bring water"],
        articles: [{ id: "s" }],
      },
      { includeReviews: true }
    );

    expect(sections.map((section) => section.key)).toEqual([
      "overview",
      "history",
      "things_to_do",
      "food_drink",
      "where_to_stay",
      "articles",
      "travel_tips",
      "how_to_get_there",
      "reviews",
    ]);
  });

  it("returns localized section labels", () => {
    expect(getAttractionSectionLabel("history", "th")).toBe("ประวัติและเรื่องเล่า");
    expect(getAttractionSectionLabel("history", "en")).toBe("History & Stories");
    expect(getAttractionSectionLabel("food_drink", "th")).toBe("อาหารและเครื่องดื่ม");
    expect(getAttractionSectionLabel("food_drink", "en")).toBe("Food & Drink");
    expect(getAttractionSectionLabel("articles", "en", "short")).toBe("Articles");
  });
});

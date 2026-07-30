import { describe, expect, it } from "vitest";
import {
  buildPublicStoryHref,
  parsePublicStorySearchParams,
} from "@/lib/content/public-story-query";

describe("public story query contract", () => {
  it("normalizes supported URL filters and clamps pagination", () => {
    expect(
      parsePublicStorySearchParams({
        q: "  เมืองเก่า  ",
        province: "Pattani",
        topic: "culture",
        type: "tourist",
        page: "999",
      })
    ).toEqual({
      search: "เมืองเก่า",
      province: "Pattani",
      topic: "culture",
      authorType: "tourist",
      page: 100,
      pageSize: 12,
    });
  });

  it("drops malformed filters instead of forwarding them to PostgREST", () => {
    expect(
      parsePublicStorySearchParams({
        q: "x".repeat(200),
        province: "Pattani,or(status.eq.draft)",
        topic: "../private",
        type: "staff",
        page: "-2",
      })
    ).toEqual({
      search: "x".repeat(120),
      province: undefined,
      topic: undefined,
      authorType: undefined,
      page: 1,
      pageSize: 12,
    });
  });

  it("preserves active filters and resets the page when a filter changes", () => {
    expect(
      buildPublicStoryHref(
        {
          search: "เมืองเก่า",
          province: "Pattani",
          topic: "culture",
          authorType: "admin",
          page: 4,
          pageSize: 12,
        },
        { topic: "food" }
      )
    ).toBe(
      "/stories?q=%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%81%E0%B9%88%E0%B8%B2&province=Pattani&topic=food&type=admin"
    );
  });
});

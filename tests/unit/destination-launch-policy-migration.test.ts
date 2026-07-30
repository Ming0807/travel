import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260730111000_enforce_destination_launch_scope.sql",
  ),
  "utf8",
);

describe("Destination launch policy migration contract", () => {
  it("replaces public destination policies with live-province checks", () => {
    for (const table of [
      "attractions",
      "districts",
      "content_media",
      "photo_spots",
      "checkin_codes",
      "suggested_routes",
      "suggested_route_stops",
      "restaurants",
      "restaurant_attractions",
      "accommodations",
      "attraction_related_attractions",
      "attraction_related_restaurants",
      "attraction_related_accommodations",
      "attraction_related_stories",
      "travel_stories",
      "story_topic_links",
      "story_tag_links",
      "story_recommendations",
      "reviews",
      "certificate_templates",
      "stamp_definitions",
    ]) {
      expect(sql).toMatch(
        new RegExp(`create policy[^;]+on public\\.${table}`, "i"),
      );
    }

    expect(sql).toContain("destination_status = 'live'");
    expect(sql).toContain("is_active = true");
  });

  it("keeps active origin provinces publicly readable", () => {
    expect(sql).not.toMatch(
      /drop policy if exists "Public can read active provinces"/i,
    );
    expect(sql).not.toMatch(
      /on public\.provinces[\s\S]+destination_status = 'live'/i,
    );
  });

  it("allows global certificate templates and non-geographic stories", () => {
    expect(sql).toMatch(
      /certificate_templates[\s\S]+attraction_id is null/i,
    );
    expect(sql).toMatch(/travel_stories[\s\S]+province_id is null/i);
  });

  it("requires every public route stop to belong to a live destination", () => {
    expect(sql).toMatch(
      /suggested_routes[\s\S]+exists\s*\([\s\S]+suggested_route_stops[\s\S]+not exists\s*\([\s\S]+destination_status\s*<>\s*'live'/i,
    );
  });
});

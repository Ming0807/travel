import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260730100000_add_story_engagement_signals.sql",
  ),
  "utf8",
);

describe("Story engagement migration contract", () => {
  it("creates minimized raw, aggregate, dedup, and rate-limit tables", () => {
    for (const table of [
      "story_engagement_events",
      "story_engagement_daily",
      "story_engagement_dedup",
      "story_engagement_rate_buckets",
    ]) {
      expect(sql).toMatch(new RegExp(`create table[^;]+${table}`, "i"));
    }

    for (const forbidden of [
      "tourist_id",
      "visit_id",
      "provider_user_id",
      "guest_token",
      "ip_address",
      "referrer",
      "page_url",
      "metadata json",
    ]) {
      expect(sql.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("locks tables and functions to the service role", () => {
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toMatch(
      /revoke all on function public\.record_story_engagement_event[\s\S]+from public, anon, authenticated/i,
    );
    expect(sql).toMatch(
      /grant execute on function public\.record_story_engagement_event[\s\S]+to service_role/i,
    );
  });

  it("defines atomic recording, rate limiting, aggregation, and purge functions", () => {
    for (const fn of [
      "record_story_engagement_event",
      "consume_story_engagement_rate_limit",
      "aggregate_story_engagement_events",
      "purge_story_engagement_data",
    ]) {
      expect(sql).toMatch(new RegExp(`function public\\.${fn}`, "i"));
    }
    expect(sql).toContain("interval '30 days'");
    expect(sql).toContain("interval '24 hours'");
    expect(sql).toMatch(
      /ON CONFLICT \(dedup_hash\) DO UPDATE[\s\S]+story_engagement_dedup\.expires_at <= now\(\)/i,
    );
  });

  it("enforces the event and surface allowlists in the database", () => {
    for (const value of [
      "story_impression",
      "story_open",
      "related_content_click",
      "meaningful_read_complete",
      "story_hub",
      "story_detail",
      "related_rail",
    ]) {
      expect(sql).toContain(`'${value}'`);
    }
    expect(sql).toMatch(
      /event_name = 'story_impression'[\s\S]+surface = 'story_hub'[\s\S]+position IS NOT NULL/i,
    );
    expect(sql).toMatch(
      /event_name = 'story_open'[\s\S]+surface = 'story_detail'[\s\S]+position IS NULL/i,
    );
    expect(sql).toMatch(
      /event_name = 'meaningful_read_complete'[\s\S]+surface = 'story_detail'[\s\S]+position IS NULL/i,
    );
    expect(sql).toContain("AT TIME ZONE 'Asia/Bangkok'");
  });
});

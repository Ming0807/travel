import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/20260811000000_add_leaderboard_privacy_preferences.sql"),
  "utf8",
);

describe("leaderboard privacy migration", () => {
  it("defaults every tourist to a private, purpose-specific visibility", () => {
    expect(sql).toMatch(/leaderboard_visibility\s+text\s+not null\s+default 'private'/i);
    expect(sql).toMatch(/leaderboard_visibility in \('private', 'alias', 'display_name'\)/i);
    expect(sql).toMatch(/leaderboard_alias\s+text/i);
  });

  it("removes legacy snapshots that may contain certificate display names", () => {
    expect(sql).toMatch(/delete from public\.leaderboard_snapshots/i);
  });

  it("updates preference and consent atomically through a service-role-only function", () => {
    expect(sql).toMatch(/create or replace function public\.set_tourist_leaderboard_preference/i);
    expect(sql).toMatch(/insert into public\.consent_records/i);
    expect(sql).toMatch(/purpose_key[\s\S]*leaderboard_public_profile/i);
    expect(sql).toMatch(/revoke all on function public\.set_tourist_leaderboard_preference[\s\S]*from public, anon, authenticated/i);
    expect(sql).toMatch(/grant execute on function public\.set_tourist_leaderboard_preference[\s\S]*to service_role/i);
  });
});

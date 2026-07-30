import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260730110000_add_destination_launch_scope.sql",
  ),
  "utf8",
);

describe("Destination launch scope migration contract", () => {
  it("adds a dedicated destination lifecycle without changing origin geography", () => {
    expect(sql).toMatch(
      /add column if not exists destination_status text not null default 'hidden'/i,
    );
    expect(sql).toMatch(
      /destination_status in \('hidden', 'pilot', 'live', 'retired'\)/i,
    );
    expect(sql).toMatch(
      /add column if not exists destination_display_order smallint/i,
    );

    expect(sql).not.toMatch(/delete\s+from\s+public\.provinces/i);
    expect(sql).not.toMatch(/set\s+is_active\s*=/i);
    expect(sql).not.toMatch(/set\s+is_target_area\s*=/i);
  });

  it("launches Yala as the only live destination and hides other destinations", () => {
    expect(sql).toMatch(
      /update public\.provinces[\s\S]+set destination_status = 'hidden'/i,
    );
    expect(sql).toMatch(
      /update public\.provinces[\s\S]+set destination_status = 'live'[\s\S]+province_name_en = 'Yala'/i,
    );
    expect(sql).toMatch(
      /count\(\*\)[\s\S]+destination_status = 'live'[\s\S]+<> 1/i,
    );
  });

  it("adds indexes for live destination reads without introducing destructive cascade", () => {
    expect(sql).toMatch(
      /create index if not exists idx_provinces_destination_launch/i,
    );
    expect(sql).toMatch(
      /create index if not exists idx_attractions_live_destination_lookup/i,
    );
    expect(sql).not.toMatch(/on delete cascade/i);
  });
});

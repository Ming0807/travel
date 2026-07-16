import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260716000000_harden_certificate_template_defaults.sql"
  ),
  "utf8"
);
const seed = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

describe("certificate template default migration", () => {
  it("enforces one default per language and scope", () => {
    expect(migration).toMatch(/unique index[^;]+global_default_language/i);
    expect(migration).toMatch(/unique index[^;]+attraction_default_language/i);
    expect(migration).toMatch(/idx_certificate_templates_active_scope_language/i);
    expect(migration).toMatch(/check \(not is_default or is_active\)/i);
  });

  it("switches defaults in one PostgreSQL function", () => {
    expect(migration).toMatch(/function public\.set_certificate_template_default/i);
    expect(migration).toMatch(/for update/i);
    expect(migration).toMatch(/set is_default = false/i);
    expect(migration).toMatch(/set is_default = true/i);
  });

  it("limits RPC execution to the service role", () => {
    expect(migration).toMatch(/revoke all on function[^;]+from public, anon, authenticated/i);
    expect(migration).toMatch(/grant execute on function[^;]+to service_role/i);
  });

  it("keeps certificate seed upserts compatible with the scoped name index", () => {
    expect(seed).toMatch(
      /on conflict \(lower\(template_name\), language\) where attraction_id is null do update/i
    );
    expect(seed).toMatch(/"version":1,"orientation":"landscape"/i);
  });
});

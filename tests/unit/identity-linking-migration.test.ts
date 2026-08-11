import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("tourist identity linking migration", () => {
  it("links identity and purpose-specific consent atomically behind service_role", () => {
    const sql = fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase/migrations/20260811001000_harden_tourist_identity_linking.sql",
      ),
      "utf8",
    );

    expect(sql).toContain("link_tourist_identity_with_consent");
    expect(sql).toContain("SECURITY DEFINER");
    expect(sql).toContain("REVOKE ALL");
    expect(sql).toContain("GRANT EXECUTE");
    expect(sql).toContain("service_role");
    expect(sql).toContain("purpose_key");
    expect(sql).toContain("passport_recovery");
  });
});

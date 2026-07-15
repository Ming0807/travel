import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("contact message permission seed and migration", () => {
  const permissionKeys = ["message.read", "message.update", "message.delete", "export.messages"];

  it("adds explicit message permissions in seed.sql", () => {
    const seed = readProjectFile("supabase/seed.sql");

    for (const permissionKey of permissionKeys) {
      expect(seed).toContain(`'${permissionKey}'`);
    }
  });

  it("adds explicit message permissions in the 20260715 migration", () => {
    const migration = readProjectFile("supabase/migrations/20260715000000_add_message_permissions.sql");

    for (const permissionKey of permissionKeys) {
      expect(migration).toContain(`'${permissionKey}'`);
    }
    expect(migration).toContain("ON CONFLICT (permission_name) DO UPDATE");
    expect(migration).toContain("ON CONFLICT DO NOTHING");
  });

  it("grants message permissions only to super_admin and admin in the migration default role assignment", () => {
    const migration = readProjectFile("supabase/migrations/20260715000000_add_message_permissions.sql");

    expect(migration).toContain("WHERE r.role_name IN ('super_admin', 'admin')");
    expect(migration).not.toContain("'viewer'");
    expect(migration).not.toContain("'province_admin'");
    expect(migration).not.toContain("'attraction_manager'");
  });
});

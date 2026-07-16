import { describe, expect, it } from "vitest";
// The release CLI core is intentionally native ESM so Node can execute it without a TS runtime.
import {
  compareMigrationStates,
  migrationConnectionHint,
  parseMigrationFilename,
} from "../../scripts/lib/migration-state.mjs";

describe("migration state comparison", () => {
  it("parses a valid Supabase migration filename", () => {
    expect(parseMigrationFilename("20260716000000_harden_defaults.sql")).toEqual({
      version: "20260716000000",
      name: "harden_defaults",
      file: "20260716000000_harden_defaults.sql",
    });
  });

  it("rejects malformed SQL migration filenames", () => {
    expect(parseMigrationFilename("migration.sql")).toBeNull();
    expect(parseMigrationFilename("20260716_short.sql")).toBeNull();
    expect(parseMigrationFilename("20260716000000_.sql")).toBeNull();
  });

  it("reports applied, pending, and remote-only migrations", () => {
    const result = compareMigrationStates(
      [
        "20260713000000_atomic_survey.sql",
        "20260715000000_add_permissions.sql",
      ],
      [
        { version: "20260713000000", name: "atomic_survey" },
        { version: "20260714000000", name: "remote_hotfix" },
      ],
    );

    expect(result.applied.map((item) => item.version)).toEqual(["20260713000000"]);
    expect(result.pending.map((item) => item.version)).toEqual(["20260715000000"]);
    expect(result.remoteOnly).toEqual([{ version: "20260714000000", name: "remote_hotfix" }]);
    expect(result.isSynchronized).toBe(false);
  });

  it("flags invalid filenames and duplicate local versions", () => {
    const result = compareMigrationStates(
      [
        "bad.sql",
        "20260716000000_first.sql",
        "20260716000000_second.sql",
      ],
      [],
    );

    expect(result.invalidFiles).toEqual(["bad.sql"]);
    expect(result.duplicateVersions).toEqual([
      {
        version: "20260716000000",
        files: ["20260716000000_first.sql", "20260716000000_second.sql"],
      },
    ]);
    expect(result.isSynchronized).toBe(false);
  });

  it("reports synchronized history only when both sides match", () => {
    const result = compareMigrationStates(
      ["20260716000000_harden_defaults.sql"],
      [{ version: "20260716000000", name: "harden_defaults" }],
    );

    expect(result.isSynchronized).toBe(true);
    expect(result.pending).toEqual([]);
    expect(result.remoteOnly).toEqual([]);
  });

  it("returns safe connection guidance without exposing connection details", () => {
    expect(migrationConnectionHint("ENOTFOUND")).toContain("Session Pooler");
    expect(migrationConnectionHint("28P01")).toContain("authentication failed");
    expect(migrationConnectionHint("XX000")).toContain("Do not guess");
    expect(migrationConnectionHint("UNKNOWN")).not.toContain("password=");
  });
});

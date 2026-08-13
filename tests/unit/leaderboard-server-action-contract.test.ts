import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("leaderboard server action module", () => {
  it("exports only the async action at runtime", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/actions/leaderboard-preference-actions.ts"),
      "utf8",
    );

    expect(source).not.toMatch(/export\s+const\s+initialLeaderboardPreferenceActionState/);
    expect(source).toMatch(/export\s+async\s+function\s+updateLeaderboardPreferenceAction/);
  });
});

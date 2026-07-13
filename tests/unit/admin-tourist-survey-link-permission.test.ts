import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin tourist survey drill-down permission", () => {
  it("only renders the survey detail link when the actor can read survey detail", () => {
    const source = readFileSync("app/(admin)/admin/tourists/[touristId]/page.tsx", "utf8");

    expect(source).toContain('hasPermission(guard.actor, "survey.detail")');
    expect(source).toContain("canReadSurveyDetail && visit.survey");
  });
});

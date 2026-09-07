import { describe, expect, it } from "vitest";
import { principalFromBrowserGrant, principalFromLegacy } from "@/lib/auth/research-principal";
import { hashResearchToken } from "@/lib/auth/research-session";

describe("research server principal", () => {
  const code = "11111111-1111-4111-8111-111111111111";
  it("hashes legacy secrets without retaining raw cookie data", () => {
    const principal = principalFromLegacy({ version: 1, publicSessionCode: code,
      accessToken: "legacy-access-secret", withdrawalToken: "legacy-withdraw-secret", operationalSessionToken: "entry-secret" });
    expect(principal).toEqual({ source: "legacy", publicSessionCode: code,
      accessTokenHash: hashResearchToken("legacy-access-secret"), withdrawalTokenHash: hashResearchToken("legacy-withdraw-secret") });
    expect(JSON.stringify(principal)).not.toContain("secret");
  });
  it("does not rehash database grant capabilities or copy Visit metadata", () => {
    const principal = principalFromBrowserGrant({ publicSessionCode: code, accessTokenHash: "a".repeat(64), withdrawalTokenHash: "b".repeat(64), visitId: code });
    expect(principal).toEqual({ source: "browser_grant", publicSessionCode: code,
      accessTokenHash: "a".repeat(64), withdrawalTokenHash: "b".repeat(64) });
  });
});

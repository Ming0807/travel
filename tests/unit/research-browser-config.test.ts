import { expect, it } from "vitest";
import { researchBrowserProvisioningEnabled, researchBrowserGrantCleanupEnabled } from "@/lib/config/research-browser";
it("keeps cleanup independently default-off and rejects ambiguous flags",()=>{
  expect(researchBrowserGrantCleanupEnabled({})).toBe(false);
  expect(researchBrowserGrantCleanupEnabled({RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED:"false"})).toBe(false);
  expect(researchBrowserGrantCleanupEnabled({RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED:"true",RESEARCH_BROWSER_GRANTS_ENABLED:"false"})).toBe(true);
  expect(()=>researchBrowserGrantCleanupEnabled({RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED:"1"})).toThrow();
});
it("keeps browser provisioning off unless explicitly configured with entry sessions",()=>{
  expect(researchBrowserProvisioningEnabled({})).toBe(false);
  expect(()=>researchBrowserProvisioningEnabled({RESEARCH_BROWSER_GRANTS_ENABLED:"1"})).toThrow();
  expect(()=>researchBrowserProvisioningEnabled({RESEARCH_BROWSER_GRANTS_ENABLED:"true"})).toThrow();
  expect(researchBrowserProvisioningEnabled({RESEARCH_BROWSER_GRANTS_ENABLED:"true",CHECKIN_ENTRY_SESSIONS_ENABLED:"true",CHECKIN_ENTRY_HASH_SECRET:"s".repeat(32)})).toBe(true);
});

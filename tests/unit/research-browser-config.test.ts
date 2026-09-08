import { expect, it } from "vitest";
import { researchBrowserProvisioningEnabled } from "@/lib/config/research-browser";
it("keeps browser provisioning off unless explicitly configured with entry sessions",()=>{
  expect(researchBrowserProvisioningEnabled({})).toBe(false);
  expect(()=>researchBrowserProvisioningEnabled({RESEARCH_BROWSER_GRANTS_ENABLED:"1"})).toThrow();
  expect(()=>researchBrowserProvisioningEnabled({RESEARCH_BROWSER_GRANTS_ENABLED:"true"})).toThrow();
  expect(researchBrowserProvisioningEnabled({RESEARCH_BROWSER_GRANTS_ENABLED:"true",CHECKIN_ENTRY_SESSIONS_ENABLED:"true",CHECKIN_ENTRY_HASH_SECRET:"s".repeat(32)})).toBe(true);
});

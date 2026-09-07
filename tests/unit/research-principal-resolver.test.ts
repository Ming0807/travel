import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ browser: vi.fn(), resolve: vi.fn(), visit: vi.fn(), global: vi.fn() }));
vi.mock("@/lib/auth/research-browser", () => ({ readResearchBrowserToken: mocks.browser, hashResearchBrowserToken: () => "a".repeat(64) }));
vi.mock("@/lib/repositories/research-browser-grant.repository", () => ({ resolveResearchBrowserContext: mocks.resolve }));
vi.mock("@/lib/auth/research-session", () => ({ getResearchVisitCredentials: mocks.visit, getResearchSessionCredentials: mocks.global, hashResearchToken: (v: string) => `hash:${v}` }));
import { resolveResearchPrincipal } from "@/lib/auth/research-principal-resolver";
const id="11111111-1111-4111-8111-111111111111";
const legacy={ publicSessionCode:id, accessToken:"old", withdrawalToken:"withdraw" };
describe("research principal resolver",()=>{
  beforeEach(()=>vi.resetAllMocks());
  it("prefers an exact browser grant without reading old credentials",async()=>{
    mocks.browser.mockResolvedValue("browser");
    mocks.resolve.mockResolvedValue({ publicSessionCode:id,accessTokenHash:"access-hash",withdrawalTokenHash:"withdraw-hash",visitId:id });
    expect(await resolveResearchPrincipal(id)).toMatchObject({source:"browser_grant",accessTokenHash:"access-hash"});
    expect(mocks.resolve).toHaveBeenCalledWith("a".repeat(64),{kind:"visit",id});
    expect(mocks.visit).not.toHaveBeenCalled();
  });
  it("keeps scoped legacy access when no browser or grant exists",async()=>{
    mocks.visit.mockResolvedValue(legacy);
    expect(await resolveResearchPrincipal(id)).toMatchObject({source:"legacy",accessTokenHash:"hash:old"});
    expect(mocks.resolve).not.toHaveBeenCalled();
    mocks.browser.mockResolvedValue("browser"); mocks.resolve.mockResolvedValue(null);
    expect(await resolveResearchPrincipal(id)).toMatchObject({source:"legacy"});
  });
  it("does not fall back on database failures",async()=>{
    mocks.browser.mockResolvedValue("browser"); mocks.resolve.mockRejectedValue(new Error("unavailable"));
    await expect(resolveResearchPrincipal(id)).rejects.toThrow("unavailable");
    expect(mocks.visit).not.toHaveBeenCalled();
  });
  it("uses the global legacy selection only without Visit context",async()=>{
    mocks.global.mockResolvedValue(legacy);
    expect(await resolveResearchPrincipal()).toMatchObject({source:"legacy"});
    expect(mocks.browser).not.toHaveBeenCalled();
  });
  it("rejects invalid Visit IDs before looking up rights",async()=>{
    await expect(resolveResearchPrincipal("bad")).rejects.toThrow();
    expect(mocks.browser).not.toHaveBeenCalled();
  });
});

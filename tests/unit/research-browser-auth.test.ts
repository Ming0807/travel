import { beforeEach, describe, expect, it, vi } from "vitest";
const store = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
const repository = vi.hoisted(() => ({ bindResearchBrowserGrant: vi.fn(), resolveResearchBrowserContext: vi.fn() }));
const access = vi.hoisted(() => ({ requireTouristVisitAccess: vi.fn(), getResearchSessionForAccess: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ requireTouristVisitAccess: access.requireTouristVisitAccess }));
vi.mock("@/lib/repositories/research.repository", () => ({ getResearchSessionForAccess: access.getResearchSessionForAccess }));
const legacy = vi.hoisted(() => ({ getResearchSessionCredentials: vi.fn(), getResearchVisitCredentials: vi.fn(), clearResearchVisitCredentials: vi.fn(), hashResearchToken: (value: string) => `hash:${value}` }));
vi.mock("next/headers", () => ({ cookies: async () => store }));
vi.mock("@/lib/repositories/research-browser-grant.repository", () => repository);
vi.mock("@/lib/auth/research-session", () => legacy);
import { RESEARCH_BROWSER_COOKIE, createResearchBrowserToken, hashResearchBrowserToken, readResearchBrowserToken, writeResearchBrowserToken, migrateResearchVisitCredential, bindLegacyResearchEntryGrant } from "@/lib/auth/research-browser";
const visitId="11111111-1111-4111-8111-111111111111";
const code="22222222-2222-4222-8222-222222222222";

describe("bounded research browser credential", () => {
  it.each(["matching","wrong-entry","wrong-session","missing-grant","denied"])("binds entry legacy proof only for %s and never deletes cookies",async(scenario)=>{
    legacy.getResearchSessionCredentials.mockResolvedValue({publicSessionCode:code,accessToken:"access",withdrawalToken:"withdraw"});
    repository.resolveResearchBrowserContext.mockResolvedValue({publicSessionCode:code,entrySessionId:visitId});
    if(scenario==="wrong-entry") repository.resolveResearchBrowserContext.mockResolvedValue({publicSessionCode:code,entrySessionId:code});
    if(scenario==="wrong-session") repository.resolveResearchBrowserContext.mockResolvedValue({publicSessionCode:visitId,entrySessionId:visitId});
    if(scenario==="missing-grant") repository.resolveResearchBrowserContext.mockResolvedValue(null);
    if(scenario==="denied") repository.bindResearchBrowserGrant.mockResolvedValue(false);
    expect(await bindLegacyResearchEntryGrant(visitId)).toBe(scenario==="matching");
    expect(legacy.getResearchSessionCredentials).toHaveBeenCalledWith(visitId);
    expect(legacy.clearResearchVisitCredentials).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });
  beforeEach(() => {
    vi.resetAllMocks();
    store.get.mockReturnValue({ value: "a".repeat(43) });
    legacy.getResearchVisitCredentials.mockResolvedValue({ publicSessionCode: code, accessToken: "access", withdrawalToken: "withdraw" });
    repository.bindResearchBrowserGrant.mockResolvedValue(true);
    repository.resolveResearchBrowserContext.mockResolvedValue({ publicSessionCode: code, visitId });
    access.requireTouristVisitAccess.mockResolvedValue({});
    access.getResearchSessionForAccess.mockResolvedValue({ publicSessionCode: code, visitId, participantType: "tourist", status: "consented", withdrawnAt: null });
  });
  it.each(["wrong-owner", "wrong-visit", "wrong-type", "withdrawn", "expired", "missing-session"])("does not bind or remove credentials for %s", async (failure) => {
    if (failure === "wrong-owner") access.requireTouristVisitAccess.mockRejectedValue(new Error("denied"));
    else if (failure === "missing-session") access.getResearchSessionForAccess.mockResolvedValue(null);
    else access.getResearchSessionForAccess.mockResolvedValue({
      publicSessionCode: code, visitId: failure === "wrong-visit" ? code : visitId,
      participantType: failure === "wrong-type" ? "operator" : "tourist",
      status: failure === "expired" ? "expired" : "consented",
      withdrawnAt: failure === "withdrawn" ? "2026-09-08" : null,
    });
    await migrateResearchVisitCredential(visitId).catch(() => false);
    expect(repository.bindResearchBrowserGrant).not.toHaveBeenCalled();
    expect(legacy.clearResearchVisitCredentials).not.toHaveBeenCalled();
  });
  it("creates fixed-size random credentials and rejects malformed tokens", async () => {
    const first=createResearchBrowserToken();
    expect(first).toHaveLength(43);
    expect(createResearchBrowserToken()).not.toBe(first);
    expect(hashResearchBrowserToken(first)).toMatch(/^[a-f0-9]{64}$/);
    store.get.mockReturnValue({ value: "bad" });
    expect(await readResearchBrowserToken()).toBeNull();
    await expect(writeResearchBrowserToken("bad")).rejects.toThrow();
    expect(store.set).not.toHaveBeenCalled();
  });
  it("stores a single secure host-only cookie, not Visit-specific credentials", async () => {
    const token=createResearchBrowserToken();
    await writeResearchBrowserToken(token);
    expect(store.set).toHaveBeenCalledWith(RESEARCH_BROWSER_COOKIE,token,{ httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:2592000 });
  });
  it.each(["missing-browser","missing-legacy","denied","missing-grant","wrong-visit","wrong-session"])("preserves legacy credentials for %s",async (failure) => {
    if(failure==="missing-browser") store.get.mockReturnValue(undefined);
    if(failure==="missing-legacy") legacy.getResearchVisitCredentials.mockResolvedValue(null);
    if(failure==="denied") repository.bindResearchBrowserGrant.mockResolvedValue(false);
    if(failure==="missing-grant") repository.resolveResearchBrowserContext.mockResolvedValue(null);
    if(failure==="wrong-visit") repository.resolveResearchBrowserContext.mockResolvedValue({ visitId:code });
    if(failure==="wrong-session") repository.resolveResearchBrowserContext.mockResolvedValue({ visitId, publicSessionCode:visitId });
    expect(await migrateResearchVisitCredential(visitId)).toBe(false);
    expect(legacy.clearResearchVisitCredentials).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });
  it("retains credentials when database or cookie writing fails",async () => {
    repository.bindResearchBrowserGrant.mockRejectedValueOnce(new Error("unavailable"));
    await expect(migrateResearchVisitCredential(visitId)).rejects.toThrow();
    store.set.mockImplementationOnce(()=>{throw new Error("cookie write unavailable")});
    await expect(migrateResearchVisitCredential(visitId)).rejects.toThrow();
    expect(legacy.clearResearchVisitCredentials).not.toHaveBeenCalled();
  });
  it("deletes only the proven Visit cookie after successful bind and read-back",async () => {
    expect(await migrateResearchVisitCredential(visitId)).toBe(true);
    expect(repository.bindResearchBrowserGrant).toHaveBeenCalledWith({ browserTokenHash:hashResearchBrowserToken("a".repeat(43)),publicSessionCode:code,accessTokenHash:"hash:access",withdrawalTokenHash:"hash:withdraw" });
    expect(legacy.clearResearchVisitCredentials).toHaveBeenCalledExactlyOnceWith(visitId);
    expect(repository.resolveResearchBrowserContext).toHaveBeenCalledExactlyOnceWith(hashResearchBrowserToken("a".repeat(43)),{kind:"visit",id:visitId});
  });
});

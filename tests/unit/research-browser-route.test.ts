import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(()=>({enabled:vi.fn(),read:vi.fn(),write:vi.fn(),create:vi.fn()}));
vi.mock("@/lib/config/research-browser",()=>({researchBrowserProvisioningEnabled:mock.enabled}));
vi.mock("@/lib/auth/research-browser",()=>({readResearchBrowserToken:mock.read,writeResearchBrowserToken:mock.write,createResearchBrowserToken:mock.create}));
import { POST } from "@/app/api/research/browser/route";
import { researchBrowserProvisioningEnabled } from "@/lib/config/research-browser";
describe("research browser preparation route",()=>{
  beforeEach(()=>{vi.resetAllMocks();mock.enabled.mockReturnValue(true);mock.create.mockReturnValue("secret");});
  const request=(origin="https://example.test",verify=false)=>new Request("https://example.test/api/research/browser",{method:"POST",headers:{origin,...(verify?{"x-research-cookie-check":"verify"}:{})}});
  it("denies cross-origin and disabled calls without cookie writes",async()=>{
    expect((await POST(request("https://other.test"))).status).toBe(403);
    mock.enabled.mockReturnValue(false);
    expect((await POST(request())).status).toBe(404);
    expect(mock.write).not.toHaveBeenCalled();
  });
  it("issues only a missing cookie and never returns the credential",async()=>{
    const response=await POST(request());
    expect(await response.json()).toEqual({ready:true});
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mock.write).toHaveBeenCalledWith("secret");
    mock.write.mockClear();mock.read.mockResolvedValue("existing");
    expect((await POST(request())).status).toBe(200);
    expect(mock.write).not.toHaveBeenCalled();
  });
  it("verification cannot silently reissue a blocked cookie",async()=>{
    expect((await POST(request("https://example.test",true))).status).toBe(409);
    expect(mock.write).not.toHaveBeenCalled();
  });
  it("sanitizes configuration or cookie failures",async()=>{
    mock.write.mockRejectedValue(new Error("private"));
    expect(await (await POST(request())).json()).toEqual({ready:false});
    expect(researchBrowserProvisioningEnabled).toHaveBeenCalled();
  });
});

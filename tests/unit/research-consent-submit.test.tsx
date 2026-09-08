import { afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { ResearchConsentSubmit } from "@/components/research/ResearchConsentSubmit";
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it("leaves the legacy button usable without preparation",()=>{
  render(<ResearchConsentSubmit prepareBrowser={false}/>);
  expect(screen.getByRole("button")).not.toBeDisabled();
});
it("holds the cross-tab lock through issuance and cookie verification",async()=>{
  const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({ready:true})});
  vi.stubGlobal("fetch",fetcher);
  const request=vi.fn(async(_name:string,callback:()=>Promise<void>)=>callback());
  vi.stubGlobal("navigator",{locks:{request}});
  render(<ResearchConsentSubmit prepareBrowser/>);
  expect(screen.getByRole("button")).toBeDisabled();
  await waitFor(()=>expect(screen.getByRole("button")).not.toBeDisabled());
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[1][1].headers).toEqual({"x-research-cookie-check":"verify"});
  expect(request).toHaveBeenCalledWith("research-browser-provision",expect.any(Function));
});
it("keeps consent disabled when cookie verification fails",async()=>{
  vi.stubGlobal("navigator",{locks:{request:async(_name:string,callback:()=>Promise<void>)=>callback()}});
  vi.stubGlobal("fetch",vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({ready:true})}).mockResolvedValueOnce({ok:false}));
  render(<ResearchConsentSubmit prepareBrowser/>);
  await screen.findByRole("alert");
  expect(screen.getByRole("button")).toBeDisabled();
});

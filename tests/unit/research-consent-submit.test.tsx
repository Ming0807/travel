import { afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor, cleanup, act } from "@testing-library/react";
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

it("fails closed without Web Locks and does not issue a cookie request",async()=>{
  const fetcher=vi.fn();
  vi.stubGlobal("fetch",fetcher);
  vi.stubGlobal("navigator",{});
  render(<ResearchConsentSubmit prepareBrowser/>);
  await screen.findByRole("alert");
  expect(screen.getByRole("button")).toBeDisabled();
  expect(fetcher).not.toHaveBeenCalled();
});

it("does not verify or enable consent after a failed preparation request",async()=>{
  const fetcher=vi.fn().mockRejectedValue(new TypeError("Network unavailable"));
  vi.stubGlobal("fetch",fetcher);
  vi.stubGlobal("navigator",{locks:{request:async(_name:string,callback:()=>Promise<void>)=>callback()}});
  render(<ResearchConsentSubmit prepareBrowser/>);
  await screen.findByRole("alert");
  expect(screen.getByRole("button")).toBeDisabled();
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("keeps the lock through cookie read-back even after the component unmounts",async()=>{
  let deliverCookie!: () => void;
  const delivery=new Promise<void>((resolve)=>{deliverCookie=resolve;});
  const released=vi.fn();
  const fetcher=vi.fn()
    .mockImplementationOnce(async()=>{await delivery;return {ok:true,json:async()=>({ready:true})};})
    .mockResolvedValueOnce({ok:true,json:async()=>({ready:true})});
  vi.stubGlobal("fetch",fetcher);
  vi.stubGlobal("navigator",{locks:{request:async(_name:string,callback:()=>Promise<void>)=>{
    try {await callback();} finally {released();}
  }}});
  const view=render(<ResearchConsentSubmit prepareBrowser/>);
  await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(1));
  view.unmount();
  expect(released).not.toHaveBeenCalled();
  await act(async()=>{deliverCookie();await delivery;});
  await waitFor(()=>expect(released).toHaveBeenCalledTimes(1));
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[1][1].headers).toEqual({"x-research-cookie-check":"verify"});
  expect(fetcher.mock.calls.every((call)=>call[1].signal===undefined)).toBe(true);
});

import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { ResearchVisitCredentialMigration } from "@/components/research/ResearchVisitCredentialMigration";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const visitId = "11111111-1111-4111-8111-111111111111";
it("migrates only after cookie verification and before releasing the shared lock", async () => {
  const release = vi.fn();
  vi.stubGlobal("navigator", { locks: { request: async (_name: string, callback: () => Promise<void>) => {
    try { await callback(); } finally { release(); }
  } } });
  const fetcher = vi.fn().mockImplementation(async () => {
    expect(release).not.toHaveBeenCalled();
    return { ok: true, json: async () => ({ ready: true }) };
  });
  vi.stubGlobal("fetch", fetcher);
  const view = render(<><ResearchVisitCredentialMigration visitId={visitId} /><button>Continue</button></>);
  expect(view.getByRole("button")).not.toBeDisabled();
  await waitFor(() => expect(release).toHaveBeenCalledTimes(1));
  expect(fetcher).toHaveBeenCalledTimes(3);
  expect(fetcher.mock.calls[2][0]).toBe(`/api/research/browser/migrate?visitId=${visitId}`);
});
it.each(["blocked-cookie", "network", "no-locks"])("preserves the surrounding form for %s", async (failure) => {
  const release = vi.fn();
  vi.stubGlobal("navigator", failure === "no-locks" ? {} : { locks: { request: async (_name: string, callback: () => Promise<void>) => {
    try { await callback(); } finally { release(); }
  } } });
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ ready: true }) }).mockResolvedValueOnce({ ok: false });
  if (failure === "network") fetcher.mockReset().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetcher);
  const view = render(<><ResearchVisitCredentialMigration visitId={visitId} /><button>Withdraw</button></>);
  if (failure !== "no-locks") await waitFor(() => expect(release).toHaveBeenCalledTimes(1));
  expect(view.getByRole("button")).not.toBeDisabled();
  expect(fetcher.mock.calls.some((call) => String(call[0]).includes("/migrate"))).toBe(false);
});

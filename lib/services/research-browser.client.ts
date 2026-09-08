// Keep the same cross-tab lock through cookie delivery and any subsequent migration.
export async function withPreparedResearchBrowser(afterPreparation?: () => Promise<void>): Promise<void> {
  if (!navigator.locks) throw new Error("LOCKS_UNAVAILABLE");
  await navigator.locks.request("research-browser-provision", async () => {
    const response = await fetch("/api/research/browser", { method: "POST", credentials: "same-origin", cache: "no-store" });
    if (!response.ok || (await response.json()).ready !== true) throw new Error("PREPARATION_FAILED");
    const check = await fetch("/api/research/browser", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "x-research-cookie-check": "verify" } });
    if (!check.ok || (await check.json()).ready !== true) throw new Error("COOKIE_UNAVAILABLE");
    await afterPreparation?.();
  });
}

"use client";

import { useEffect, useState } from "react";

export function ResearchConsentSubmit({ prepareBrowser }: { prepareBrowser: boolean }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">(prepareBrowser ? "loading" : "ready");
  useEffect(() => {
    if (!prepareBrowser) return;
    let active = true;
    async function prepare() {
      try {
        if (!navigator.locks) throw new Error("LOCKS_UNAVAILABLE");
        // Do not abort the fetch: hold the cross-tab lock until cookie delivery ends.
        await navigator.locks.request("research-browser-provision", async () => {
          const response = await fetch("/api/research/browser", { method: "POST", credentials: "same-origin", cache: "no-store" });
          if (!response.ok || (await response.json()).ready !== true) throw new Error("PREPARATION_FAILED");
          const check = await fetch("/api/research/browser", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "x-research-cookie-check": "verify" } });
          if (!check.ok || (await check.json()).ready !== true) throw new Error("COOKIE_UNAVAILABLE");
        });
        if (active) setState("ready");
      } catch {
        if (active) setState("failed");
      }
    }
    void prepare();
    return () => { active = false; };
  }, [prepareBrowser]);
  return <>
    {state === "failed" && <p role="alert" className="text-sm text-red-700">ยังเตรียมการเข้าร่วมไม่ได้ กรุณาเปิดหน้านี้ใหม่ในเบราว์เซอร์หลัก หรือเลือกไม่เข้าร่วมเพื่อดำเนินการต่อ</p>}
    <button type="submit" disabled={state !== "ready"} className="min-h-14 w-full bg-teal px-5 py-3 font-black text-white hover:bg-ink disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2">
      {state === "loading" ? "กำลังเตรียมการเข้าร่วม..." : "ยืนยันเข้าร่วมการวิจัย"}
    </button>
  </>;
}

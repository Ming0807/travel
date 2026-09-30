import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("output/playwright/leaderboard", { recursive: true });
let layouts = 0;
try {
  for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const variant of ["", "&empty&private", "&error", "&loading"]) {
      await page.goto(`http://127.0.0.1:4192/?leaderboard${variant}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `${width}${variant} overflow ${overflow}`);
      if (variant === "") {
        await expect(page.getByRole("list", { name: "อันดับนักเดินทาง" })).toBeVisible();
        await expect(page.locator('[aria-current="true"]')).toContainText("คุณ");
        await page.getByRole("button", { name: "7 วันล่าสุด" }).click();
        await expect(page.getByRole("button", { name: "7 วันล่าสุด" })).toHaveAttribute("aria-pressed", "true");
        await expect(page.getByRole("status")).toContainText("7 วันล่าสุด");
        await expect(page.getByText("ยังไม่มีอันดับในช่วงเวลานี้")).toBeVisible();
        await page.getByRole("button", { name: "ทั้งหมด" }).click();
        if ([390, 1440].includes(width)) await page.screenshot({ path: `output/playwright/leaderboard/ranking-${width}.png`, fullPage: true });
      }
      if (variant.includes("error")) await expect(page.getByRole("alert")).toBeVisible();
      if (variant.includes("loading")) await expect(page.getByRole("status", { name: "กำลังโหลดกระดานอันดับ" })).toBeVisible();
      layouts++;
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4192/?leaderboard&loading");
  await expect(page.locator(".leaderboard-skeleton-row span").first()).toHaveCSS("animation-name", "none");
  await page.goto("http://127.0.0.1:4192/?leaderboard");
  await page.getByRole("button", { name: "30 วันล่าสุด" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "30 วันล่าสุด" })).toHaveAttribute("aria-pressed", "true");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ layouts, periods: "passed", keyboard: "passed", reducedMotion: "passed", pageErrors: errors }));
} finally { await browser.close(); }

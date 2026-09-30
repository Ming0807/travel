import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const origin = "http://127.0.0.1:4192/journey.html";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("https://tile.openstreetmap.org/**", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e6eee6"/></svg>' }));
await mkdir("output/playwright/journey", { recursive: true });
let layouts = 0;
try {
  for (const width of [320, 390, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const variant of ["?passport", "?passport&linked", "?passport&no-targets", "?passport&no-identity", "?passport&error", "?passport&loading", "?routes", "?routes&empty", "?routes&loading", "?routes&detail"]) {
      await page.goto(origin + variant, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, `${width}${variant} overflows`);
      if (variant === "?passport") {
        await expect(page.getByRole("link", { name: /สถานที่ตัวอย่าง 1 ได้รับตราแล้ว/ })).toBeVisible();
        await expect(page.getByRole("progressbar", { name: "ความคืบหน้าการสะสมตราที่เปิดใช้งาน" })).toHaveAttribute("aria-valuenow", "50");
      }
      if (variant.includes("no-targets")) { await expect(page.getByText("ได้รับแล้ว", { exact: true })).toHaveCount(2); await expect(page.getByText("ยังไม่มีจุดสะสมตราที่เปิดใช้งาน")).toBeVisible(); }
      if (variant === "?routes") {
        const images = page.locator(".route-directory__image img");
        await expect(images).toHaveCount(4);
        for (const image of await images.all()) await expect(image).toHaveAttribute("loading", "lazy");
        await page.getByRole("searchbox", { name: "ค้นหาเส้นทาง" }).fill("ไม่มีรายการ");
        await expect(page.getByText("ไม่พบเส้นทางที่ตรงกับการค้นหา")).toBeVisible();
        await page.getByRole("button", { name: "ล้างตัวกรอง" }).click();
        await expect(page.getByRole("link", { name: /ดูแผนการเดินทาง/ })).toHaveCount(4);
      }
      if (variant === "?routes&detail") {
        await page.getByRole("link", { name: "ลำดับจุดแวะ", exact: true }).click();
        await expect(page.getByRole("heading", { name: "ลำดับการเดินทาง", exact: true })).toBeInViewport();
        await expect(page.getByText("ยังไม่มีพิกัดสำหรับจุดนี้")).toBeVisible();
        await page.getByRole("link", { name: "วันที่ 2", exact: true }).click();
        await expect(page.getByRole("heading", { name: "วันที่ 2", exact: true })).toBeInViewport();
        await page.getByRole("link", { name: "กลับไปแผนที่เส้นทาง" }).click();
        await expect(page.getByRole("heading", { name: "สำรวจเส้นทางบนแผนที่", exact: true })).toBeInViewport();
      }
      if ([390, 1440].includes(width) && ["?passport", "?routes&detail"].includes(variant)) await page.screenshot({ path: `output/playwright/journey/${variant.includes("routes") ? "route" : "passport"}-${width}.png`, fullPage: true });
      layouts++;
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(origin + "?passport&loading");
  await expect(page.locator(".passport-loading-cover span").first()).toHaveCSS("animation-name", "none");
  await page.goto(origin + "?routes&loading");
  await expect(page.locator(".animate-pulse")).toHaveCSS("animation-name", "none");
  await page.goto(origin + "?passport");
  const stamp = page.getByRole("link", { name: /สถานที่ตัวอย่าง 1 ได้รับตราแล้ว/ });
  await stamp.focus();
  await expect(stamp).toBeFocused();
  await expect(stamp).toHaveCSS("outline-style", "solid");
  await stamp.hover();
  await expect(stamp.locator(".passport-stamp-bottom svg")).toHaveCSS("transform", "none");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ layouts, filters: "passed", routeAnchors: "passed", lazyImages: "passed", reducedMotion: "passed", keyboard: "passed", pageErrors: errors }));
} finally { await browser.close(); }

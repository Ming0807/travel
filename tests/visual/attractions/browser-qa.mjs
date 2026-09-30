import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const output = "output/playwright/attractions";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(90000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let layouts = 0;
try {
  for (const width of [320, 390, 640, 768, 1024, 1240, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const variant of ["", "?detail", "?detail&single", "?loading", "?loading&detail"]) {
      await page.goto(`http://127.0.0.1:4194/${variant}`, { waitUntil: "domcontentloaded" });
      await page.locator("#root > *").waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `horizontal overflow at ${width}: ${variant}`);
      layouts++;
      if (!variant) {
        await page.getByRole("searchbox", { name: "ค้นหาสถานที่" }).waitFor({ state: "visible" });
        assert.equal(await page.locator("article img[loading=eager]").count(), 0);
        if (width === 640 || width === 768) {
          const input = await page.locator("#attraction-search").boundingBox();
          assert(input.width > 240, `search cramped at ${width}`);
        }
        if (width === 320 || width === 1440) await page.screenshot({ path: `${output}/directory-${width}.png`, fullPage: true });
      }
      if (variant === "?detail") {
        assert.equal(await page.locator("dialog img").count(), 0);
        await page.getByRole("button", { name: "ดูรูปทั้งหมด 8 รูป" }).click();
        await page.getByRole("dialog").waitFor({ state: "visible" });
        assert.equal(await page.locator("dialog img").count(), 9);
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "hidden" });
        assert.equal(await page.locator("dialog img").count(), 0);
        if (width === 390 || width === 1440) await page.screenshot({ path: `${output}/detail-${width}.png`, fullPage: true });
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4194/?loading");
  assert.equal(await page.locator(".attraction-skeleton").first().evaluate((element) => getComputedStyle(element).animationName), "none");
  await page.goto("http://127.0.0.1:4194/");
  assert(await page.locator("article").first().evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration) <= .001));
  await page.getByRole("searchbox").fill("ทะเลหมอก");
  await page.getByRole("button", { name: "ค้นหาสถานที่", exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get("q"), "ทะเลหมอก");
  assert.equal(new URL(page.url()).hash, "#attraction-results-heading");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ layouts, gallery: "deferred and keyboard close passed", reducedMotion: "passed", search: "passed", pageErrors: errors, screenshots: output }));
} finally { await browser.close(); }

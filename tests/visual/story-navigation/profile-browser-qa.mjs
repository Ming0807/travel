import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const output = "output/playwright/profile-navigation";
await mkdir(output, { recursive: true });
let layouts = 0;
try {
  for (const variant of ["profile", "profile-loading", "profile-empty"]) {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://127.0.0.1:4190/?${variant}`);
      await page.locator(".tourist-profile").waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `${variant} overflows by ${overflow}px at ${width}`);
      assert.equal(await page.getByRole("link", { name: /สแกน QR/ }).count(), 0);
      if (variant === "profile") {
        const actions = page.getByRole("navigation", { name: "การเดินทางของฉัน" });
        assert.equal(await actions.getByRole("link", { name: /แบ่งปันเรื่องราว/ }).getAttribute("href"), "/stories/share");
        assert.equal(await page.getByRole("radio", { name: /ไม่แสดงบนกระดานผู้นำ/ }).isChecked(), true);
        await page.getByRole("radio", { name: /แสดงด้วยนามแฝง/ }).check();
        await page.getByRole("textbox", { name: /นามแฝงสาธารณะ/ }).fill("นักเดินทางทดสอบ");
        assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1);
      }
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${variant}-${width}.png`, fullPage: true });
      }
      layouts++;
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4190/?profile-loading");
  assert.equal(await page.locator(".tourist-profile-skeleton").first().evaluate((el) => getComputedStyle(el).animationName), "none");
  const trigger = page.getByRole("button", { name: /เปิดเมนูบัญชี/ });
  await trigger.press("ArrowDown");
  assert.equal(await page.getByRole("menu").evaluate((el) => getComputedStyle(el).animationName), "none");
  await page.keyboard.press("Escape");
  assert.equal(await trigger.evaluate((el) => document.activeElement === el), true);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ profileLayouts: layouts, reducedMotion: "passed", keyboard: "passed", pageErrors: errors, screenshots: output }));
} finally { await browser.close(); }

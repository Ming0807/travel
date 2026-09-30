import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

// Automated component verification. All mutations use synthetic fixture actions.
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const output = "output/playwright/story-navigation";
await mkdir(output, { recursive: true });
const widths = [320, 360, 390, 480, 700, 768, 1024, 1160, 1161, 1200, 1240, 1280, 1440, 1920];
let layouts = 0;
async function noOverflow() {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `Horizontal overflow ${overflow}px at ${page.viewportSize().width}`);
}
try {
  for (const variant of ["", "?guest", "?avatar"]) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://127.0.0.1:4190/${variant}`);
      await page.locator(variant === "?guest" ? ".ed-account-login" : ".ed-account-trigger").waitFor();
      await noOverflow();
      const layout = await page.evaluate(() => {
        const rect = (selector) => {
          const { left, right, top, bottom } = document.querySelector(selector).getBoundingClientRect();
          return { left, right, top, bottom };
        };
        return { brand: rect(".ed-site-brand"), actions: rect(".ed-site-actions"), navVisible: getComputedStyle(document.querySelector(".ed-site-nav")).display !== "none", nav: rect(".ed-site-nav") };
      });
      assert.ok(layout.brand.right <= layout.actions.left, `Brand overlaps actions at ${width}`);
      if (layout.navVisible) {
        assert.ok(layout.brand.right <= layout.nav.left && layout.nav.right <= layout.actions.left, `Navigation overlap at ${width}`);
      }
      if (variant !== "?guest") {
        const trigger = page.locator(".ed-account-trigger");
        await trigger.focus();
        await page.keyboard.press("ArrowDown");
        await page.getByRole("menuitem", { name: "โปรไฟล์ของฉัน" }).waitFor();
        assert.equal(await page.getByRole("menuitem", { name: "โปรไฟล์ของฉัน" }).evaluate((el) => el === document.activeElement), true);
        const box = await page.locator(".ed-account-dropdown").boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width, `Account menu offscreen at ${width}`);
        await noOverflow();
        if ([390, 1440].includes(width) && variant === "") await page.screenshot({ path: `${output}/account-${width}.png` });
        await page.keyboard.press("Escape");
        assert.equal(await trigger.evaluate((el) => el === document.activeElement), true);
      }
      if (width <= 1160) {
        await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
        await page.getByRole("navigation", { name: "เมนูมือถือ" }).waitFor();
        await noOverflow();
        if (width === 390 && variant === "") await page.screenshot({ path: `${output}/mobile-navigation.png` });
        await page.keyboard.press("Escape");
      }
      layouts++;
    }
  }

  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:4190/?editor");
    await page.getByRole("button", { name: "เผยแพร่ / ตั้งค่า", exact: true }).waitFor();
    await noOverflow();
    await page.getByRole("button", { name: "เผยแพร่ / ตั้งค่า", exact: true }).click();
    const publish = page.getByRole("button", { name: "เผยแพร่", exact: true });
    await publish.waitFor();
    assert.equal(await publish.isEnabled(), true);
    assert.equal(await page.getByRole("button", { name: "ส่งให้ทีมตรวจ", exact: true }).count(), 0);
    await page.getByLabel("ตัวอย่างผลการค้นหา").scrollIntoViewIfNeeded();
    assert.ok((await page.getByLabel("ตัวอย่างผลการค้นหา").textContent()).includes("ข้อมูลสังเคราะห์สำหรับตรวจหน้าจอเท่านั้น"));
    await noOverflow();
    await page.screenshot({ path: `${output}/search-preview-${width}.png` });
    await publish.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/editor-${width}.png` });
    await page.evaluate(() => window.addEventListener("fixture-story-save", (event) => { window.fixtureLastSave = event.detail; }, { once: true }));
    page.once("dialog", (dialog) => dialog.accept());
    await publish.click();
    await page.getByText("สถานะ:").filter({ hasText: "เผยแพร่แล้ว" }).waitFor();
    const saved = await page.evaluate(() => window.fixtureLastSave);
    assert.equal(saved.change.seoDescription, "ข้อมูลสังเคราะห์สำหรับตรวจหน้าจอเท่านั้น");
  }
  await page.goto("http://127.0.0.1:4190/?editor&tourist");
  await page.getByRole("button", { name: "ตรวจและอนุมัติ", exact: true }).click();
  await page.getByRole("button", { name: "เริ่มตรวจเรื่อง", exact: true }).click();
  await page.getByRole("button", { name: "ตรวจและอนุมัติ", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "อนุมัติ", exact: true }).isEnabled(), true);
  assert.equal(await page.getByRole("button", { name: "ขอข้อมูลเพิ่ม", exact: true }).isDisabled(), true);

  await page.goto("http://127.0.0.1:4190/?editor&restricted");
  await page.getByRole("button", { name: "เผยแพร่ / ตั้งค่า", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "เผยแพร่", exact: true }).count(), 0);
  assert.equal(await page.getByRole("button", { name: "ส่งให้ทีมตรวจ", exact: true }).isEnabled(), true);

  await page.goto("http://127.0.0.1:4190/?editor&incomplete");
  await page.getByRole("button", { name: "เผยแพร่ / ตั้งค่า", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "เผยแพร่", exact: true }).isDisabled(), true);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ headerLayouts: layouts, editorWidths: 3, moderation: "passed", permissions: "passed", pageErrors: errors, screenshots: output }));
} finally { await browser.close(); }

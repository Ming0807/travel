// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async page => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4180/research-readiness.html");
  const panel = page.getByRole("region", { name: "ความพร้อมก่อนเก็บข้อมูล" });
  await panel.waitFor();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Readiness overflow");
    await panel.screenshot({ path: `.tmp/research-readiness-${width}.png` });
  }
  await page.setViewportSize({ width: 360, height: 1000 });
  await panel.locator("summary").click();
  if (await panel.locator("li").count() !== 4) throw new Error("Missing readiness items");
  await panel.screenshot({ path: ".tmp/research-readiness-expanded-360.png" });
  await panel.getByRole("link", { name: "ตรวจหลักฐานอนุมัติ" }).click();
  if (!page.url().endsWith("#research-approval")) throw new Error("Wrong approval target");
  await page.goto("http://127.0.0.1:4180/research-readiness.html?readonly=1");
  await panel.waitFor();
  if (await panel.getByRole("link").count()) throw new Error("Read-only staff received action link");
  if (errors.length) throw new Error(errors.join("\n"));
}

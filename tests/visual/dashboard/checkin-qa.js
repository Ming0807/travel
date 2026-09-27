// Playwright CLI evaluates this file as a callback expression.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let checked = 0;
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const state of ["failure", "success"]) {
      await page.goto(`http://127.0.0.1:4183/checkin.html?state=${state}`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) {
        throw new Error(`Horizontal overflow: ${state} ${width}`);
      }
      if (state === "success") {
        const region = page.getByRole("region", { name: "ตรวจสอบจุดเช็กอิน NFC" });
        await region.getByText("tourism.example", { exact: true }).waitFor();
        const href = await page.getByRole("link", { name: "สร้างใบประกาศของฉัน" }).getAttribute("href");
        if (!href?.includes("flow=fixture-only")) throw new Error("Lost flow context");
      } else {
        await page.getByRole("link", { name: "แจ้งปัญหา NFC" }).waitFor();
        if (await page.locator('a[href^="/c/"], a[href^="/checkin/"]').count()) throw new Error("QR bypass");
      }
      await page.screenshot({ path: `.tmp/nfc-public-${state}-${width}.png`, fullPage: true });
      checked += 1;
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return { checked, errors };
}

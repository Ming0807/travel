// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async page => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" || (message.type() === "warning" && /width\(|height\(/.test(message.text()))) errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const base = "http://127.0.0.1:4183";
  const widths = [360, 390, 768, 1024, 1440];
  const notices = ["options_unavailable", "no_attractions", "invalid_filters", "attraction_unavailable", "analytics_unavailable"];
  let checks = 0;
  let keyboardRegions = 0;

  async function noOverflow(label) {
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Page overflow: ${label}`);
  }

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const code of notices) {
      await page.goto(`${base}/?page=attraction-notice&state=${code}`);
      const notice = page.locator(`[data-analytics-state="${code}"]`);
      await notice.waitFor();
      await noOverflow(`${code}/${width}`);
      const action = notice.getByRole("link");
      const box = await action.boundingBox();
      if (!box || box.height < 44) throw new Error(`Small notice action: ${code}/${width}`);
      await action.focus();
      if (!await action.evaluate(el => el === document.activeElement)) throw new Error("Notice recovery is not focusable");
      if (code === "analytics_unavailable") await page.screenshot({ path: `.tmp/attraction-notice-${width}.png` });
      checks++;
    }

    for (const state of ["normal", "empty", "low", "large"]) {
      await page.goto(`${base}/?page=attraction&state=${state}`);
      await page.locator("[data-kpi-level]").first().waitFor();
      await noOverflow(`${state}/${width}`);
      const clippedValues = await page.locator("[data-kpi-value]").evaluateAll(els => els.filter(el => el.scrollWidth > el.clientWidth + 1).length);
      if (clippedValues) throw new Error(`Clipped KPI: ${state}/${width}`);
      if (state === "normal" || state === "large") {
        const nonblank = await page.locator(".recharts-surface").evaluateAll(els => els.some(el => {
          const box = el.getBoundingClientRect();
          return box.width > 100 && box.height > 50 && el.querySelector("path.recharts-curve");
        }));
        if (!nonblank) throw new Error(`Blank trend: ${state}/${width}`);
      }
      if (state === "normal") {
        if (width < 640) {
          const details = page.locator('details[data-detail-group="audience"]');
          if (await details.getAttribute("open") !== null) throw new Error("Mobile detail starts expanded");
          await details.locator(":scope > summary").click();
          await details.getByRole("region", { name: "จังหวัดต้นทาง" }).waitFor();
          await details.locator(":scope > summary").click();
        }
        await page.getByText("ดูมิติประสบการณ์ Flow และค่าใช้จ่ายเพิ่มเติม", { exact: true }).click();
        await page.locator("summary").filter({ hasText: "นิยามตัวชี้วัดและข้อจำกัด" }).click();
        for (const label of ["ตารางเปรียบเทียบสถานที่", "รายละเอียดการเปรียบเทียบสถานที่", "นิยามตัวชี้วัดและข้อจำกัด"]) {
          const region = page.getByRole("region", { name: label, exact: true });
          if (await region.getAttribute("tabindex") !== "0") throw new Error(`Region missing keyboard focus: ${label}`);
          await region.focus();
          const overflows = await region.evaluate(el => el.scrollWidth > el.clientWidth);
          if (overflows) {
            await page.keyboard.press("ArrowRight");
            await page.waitForFunction(() => document.activeElement.scrollLeft > 0);
          }
          keyboardRegions++;
        }
        await noOverflow(`expanded tables/${width}`);
        await page.screenshot({ path: `.tmp/attraction-workspace-${width}.png`, fullPage: true });
      }
      checks++;
    }

    await page.goto(`${base}/attraction-filter.html?attractionId=4&campaignId=7&checkinCodeId=10&entryChannel=nfc&evidenceScope=pilot_only`);
    const place = page.getByRole("combobox", { name: "สถานที่", exact: true });
    const campaign = page.getByRole("combobox", { name: "แคมเปญ", exact: true });
    const code = page.getByRole("combobox", { name: "จุดเช็กอิน", exact: true });
    await campaign.waitFor();
    await campaign.selectOption("9");
    if (await code.inputValue() !== "") throw new Error("Campaign change kept incompatible code");
    const options = await code.locator("option").evaluateAll(els => els.map(el => el.value));
    if (options.join(",") !== ",12") throw new Error("Codes are not campaign-dependent");
    await code.selectOption("12");
    await campaign.selectOption("");
    if (await code.inputValue() !== "12") throw new Error("Clearing campaign lost compatible code");
    await campaign.selectOption("9");
    await page.getByRole("button", { name: "วิเคราะห์ข้อมูล", exact: true }).click();
    await page.waitForURL(url => url.searchParams.get("campaignId") === "9");
    await page.goBack();
    await place.waitFor();
    if (await campaign.inputValue() !== "7" || await code.inputValue() !== "10") throw new Error("Back lost the applied scope");
    await page.goForward();
    await place.waitFor();
    if (await campaign.inputValue() !== "9" || await code.inputValue() !== "12") throw new Error("Forward lost the applied scope");
    await place.selectOption("5");
    if (!await code.isDisabled() || !await campaign.isDisabled()) throw new Error("Place change enabled stale dependent filters");
    await page.getByRole("button", { name: "วิเคราะห์ข้อมูล", exact: true }).click();
    await page.waitForURL(url => url.searchParams.get("attractionId") === "5");
    const query = await page.evaluate(() => Object.fromEntries(new URL(location.href).searchParams));
    if ("checkinCodeId" in query || "campaignId" in query) throw new Error("Stale dependent scope was submitted");
    if (query.entryChannel !== "nfc" || query.evidenceScope !== "pilot_only") throw new Error("Independent scope was lost");
    await noOverflow(`filter/${width}`);
    checks++;
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return { checks, widths, keyboardRegions, pageErrors: errors.length, scope: "synthetic real-component fixture, not authenticated production acceptance" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async page => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4180/attraction-filter.html?attractionId=4&campaignId=7&checkinCodeId=10&entryChannel=nfc&evidenceScope=pilot_only");
  const place = page.getByRole("combobox", { name: "สถานที่", exact: true });
  const code = page.getByRole("combobox", { name: "จุดเช็กอิน", exact: true });
  await place.waitFor();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Filter overflow");
    await page.screenshot({ path: `.tmp/attraction-filter-${width}.png` });
  }
  await place.selectOption("5");
  if (!await code.isDisabled()) throw new Error("Stale check-in remains enabled");
  await page.getByRole("button", { name: "วิเคราะห์ข้อมูล", exact: true }).click();
  await page.waitForURL(url => url.searchParams.get("attractionId") === "5");
  const query = new URL(page.url()).searchParams;
  if (query.has("checkinCodeId") || query.has("campaignId")) throw new Error("Stale scope submitted");
  if (query.get("entryChannel") !== "nfc" || query.get("evidenceScope") !== "pilot_only") throw new Error("Scope lost");
  await page.goBack();
  await place.waitFor();
  if (await place.inputValue() !== "4") throw new Error("Back did not restore place");
  if (await code.inputValue() !== "10") throw new Error("Back did not restore code");
  await page.goForward();
  await place.waitFor();
  if (await place.inputValue() !== "5") throw new Error("Forward did not restore place");
  if (await code.inputValue() !== "") throw new Error("Forward restored stale code");
  if (errors.length) throw new Error(errors.join("\n"));
}

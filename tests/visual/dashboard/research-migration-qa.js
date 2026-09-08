// Playwright CLI --filename evaluates this function expression directly.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
async (page) => {
  const context = page.context();
  await context.clearCookies();
  let active = 0, maximum = 0, issued = 0, requests = 0, migrations = 0;
  const errors = [];
  const second = await context.newPage();
  for (const tab of [page, second]) tab.on("pageerror", error => errors.push(error.message));
  await context.route("**/api/research/browser**", async route => {
    active++; maximum = Math.max(maximum, active); requests++;
    const request = route.request();
    const headers = await request.allHeaders();
    const hasCookie = (headers.cookie || "").includes("research_qa=stable");
    const migration = request.url().includes("/migrate?");
    const verify = headers["x-research-cookie-check"] === "verify";
    await page.waitForTimeout(150);
    if (migration) {
      if (!hasCookie) throw new Error("Migration before cookie delivery");
      migrations++;
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"migrated":true}' });
    } else {
      if (!hasCookie && !verify) issued++;
      await route.fulfill({ status: verify && !hasCookie ? 409 : 200, contentType: "application/json",
        headers: !hasCookie && !verify ? { "set-cookie": "research_qa=stable; HttpOnly; SameSite=Lax; Path=/" } : {},
        body: JSON.stringify({ ready: !verify || hasCookie }) });
    }
    active--;
  });
  await Promise.all([page.goto("http://127.0.0.1:4180/research-browser.html?migration=1"), second.goto("http://127.0.0.1:4180/research-browser.html?migration=1")]);
  for (let count = 0; count < 100 && (migrations < 2 || active); count++) await page.waitForTimeout(100);
  if (issued !== 1 || maximum !== 1 || requests !== 6 || migrations !== 2 || errors.length) {
    throw new Error(JSON.stringify({ issued, maximum, requests, migrations, errors }));
  }
  for (const tab of [page, second]) if (await tab.getByRole("button").isDisabled()) throw new Error("Migration blocked form");
  await context.unroute("**/api/research/browser**");
  await context.route("**/api/research/browser**", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"ready":false}' }));
  await page.reload();
  await page.getByRole("button").click();
  await page.getByRole("link").click();
  if (!page.url().endsWith("#declined")) throw new Error("Migration failure blocked navigation");
  await second.close();
}

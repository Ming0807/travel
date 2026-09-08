async (page) => {
  const context = page.context();
  await context.clearCookies();
  let active = 0, maximum = 0, issued = 0, requests = 0;
  const errors = [];
  const second = await context.newPage();
  for (const tab of [page, second]) tab.on("pageerror", error => errors.push(error.message));
  await context.route("**/api/research/browser", async route => {
    active++; maximum = Math.max(maximum, active); requests++;
    const headers = await route.request().allHeaders();
    const hasCookie = (headers.cookie || "").includes("research_qa=stable");
    const verify = headers["x-research-cookie-check"] === "verify";
    await page.waitForTimeout(150);
    if (!hasCookie && !verify) issued++;
    await route.fulfill({ status: verify && !hasCookie ? 409 : 200, contentType: "application/json",
      headers: !hasCookie && !verify ? { "set-cookie": "research_qa=stable; HttpOnly; SameSite=Lax; Path=/" } : {},
      body: JSON.stringify({ ready: !verify || hasCookie }) });
    active--;
  });
  const url = "http://127.0.0.1:4180/research-browser.html";
  await Promise.all([page.goto(url), second.goto(url)]);
  for (const tab of [page, second]) await tab.waitForFunction(() => document.querySelector("button")?.disabled === false);
  if (issued !== 1 || maximum !== 1 || requests !== 4 || errors.length) throw new Error(JSON.stringify({issued,maximum,requests,errors}));
  for (const width of [360,768,1440]) {
    await page.setViewportSize({width,height:900});
    if (await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth)) throw new Error("Overflow");
    await page.screenshot({path:`.tmp/research-browser-ready-${width}.png`});
  }
  await context.unroute("**/api/research/browser");
  await context.route("**/api/research/browser", route => route.fulfill({status:409,contentType:"application/json",body:'{"ready":false}'}));
  await page.reload();
  await page.getByRole("alert").waitFor();
  if (!await page.getByRole("button").isDisabled()) throw new Error("Failure enabled consent");
  await page.setViewportSize({width:360,height:800});
  await page.getByRole("link").click();
  if (!page.url().endsWith("#declined")) throw new Error("Decline unavailable");
  await page.screenshot({path:".tmp/research-browser-failed-360.png"});
  await second.close();
  console.log(JSON.stringify({issued,maximum,requests,errors,decline:true}));
}

import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [360,768,1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4175/?page=entry&state=channels', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'ผลสำเร็จ', exact: true }).click();
    await page.getByText('ตารางผลลัพธ์และตัวหาร', { exact: true }).click();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow ${width}`);
    await page.screenshot({ path: `.tmp/entry-cohort-${width}.png`, fullPage: true });
    await page.goto('http://127.0.0.1:4175/?page=entry&state=unsupported', { waitUntil: 'networkidle' });
    const href = await page.getByRole('link', { name: 'ดูผลจากผู้เริ่มทั้งหมดในขอบเขตนี้' }).getAttribute('href');
    if (!href?.includes('evidence_scope=pilot_only') || href.includes('satisfaction_min')) throw new Error('Invalid clear scope');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Blocked overflow ${width}`);
    await page.screenshot({ path: `.tmp/entry-cohort-blocked-${width}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Entry cohort browser QA passed: 360/768/1440, conversion, table, clear-filter scope, no page errors/overflow.');
} finally { await browser.close(); }

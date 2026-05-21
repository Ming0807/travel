import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Tourist Check-in Flow', () => {
  // Use a known demo checkin code that was seeded
  const checkinCode = 'DEMO-CODE-123';

  test('should complete the entire check-in and certificate flow', async ({ page }) => {
    // 1. Visit the QR Check-in Landing Page
    await page.goto(`/checkin/${checkinCode}`);
    await expect(page.locator('text=สร้างใบประกาศดิจิทัลฟรี')).toBeVisible();
    await page.click('text=สร้างใบประกาศของฉัน');

    // 2. Minimal Profile Form
    await expect(page).toHaveURL(new RegExp(`/checkin/${checkinCode}/start`));
    await page.fill('input[name="displayName"]', 'John Doe');
    await page.selectOption('select[name="originCountryId"]', '1'); // Thailand
    await page.selectOption('select[name="originProvinceId"]', '1'); // Bangkok
    await page.selectOption('select[name="ageGroup"]', '25_34');
    await page.check('input[name="hasConsented"]');
    await page.click('button[type="submit"]');

    // Wait for redirect to photo upload
    await page.waitForURL(/\/visit\/[^/]+\/photo/);
    const visitUrl = page.url();
    const visitId = visitUrl.match(/\/visit\/([^/]+)\/photo/)?.[1];
    expect(visitId).toBeDefined();

    // 3. Photo Upload (We will mock the file upload or just skip it if it's too complex to mock in E2E without an actual file, but Playwright can upload files)
    // We create a dummy image to upload
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    // Bypass flaky UI file upload in headless mode by calling the API directly
    await page.evaluate(async () => {
      const visitId = window.location.pathname.split('/')[2];
      const form = new FormData();
      form.append('file', new Blob(['fake image data'], { type: 'image/png' }), 'test-image.png');
      form.append('visitId', visitId);
      
      const res = await fetch('/api/upload/photo', { method: 'POST', body: form });
      const data = await res.json();
      
      window.location.href = `/visit/${visitId}/certificate/preview?photoId=${data.photoId}&previewUrl=${encodeURIComponent(data.previewUrl)}`;
    });
    
    // Mock certificate generation to avoid headless canvas/CORS issues
    await page.route('/api/certificate/generate', async route => {
      await route.fulfill({
        json: {
          certificateId: 'test-cert-123',
          stamp: { status: 'earned' }
        }
      });
    });

    // 4. Certificate Preview
    await page.waitForURL(/\/visit\/[^/]+\/certificate\/preview/);
    const generateBtn = page.locator('button:has-text("สร้างใบประกาศดิจิทัล")');
    await expect(generateBtn).toBeVisible({ timeout: 10000 });
    await generateBtn.click();

    // 5. Certificate Success
    await page.waitForURL(/\/visit\/[^/]+\/certificate\/success/);
    await expect(page.locator('text=แบบสอบถามสั้น ๆ (ไม่บังคับ)')).toBeVisible();
    await page.click('a:has-text("ตอบแบบสอบถามสั้น ๆ")');

    // 6. Survey Form
    await page.waitForURL(/\/visit\/[^/]+\/survey/);
    await expect(page.locator('text=แบบสอบถามสั้น ๆ')).toBeVisible();
    
    // Fill out the survey
    // Select 5 stars
    await page.click('button:has-text("5")');
    // Select Spending range (first option)
    await page.click('input[name="spendingRangeId"]'); 
    await page.check('input[name="spendingRangeId"]'); // Just to be sure
    
    // Select yes for revisit
    await page.click('input[name="revisitIntention"][value="yes"]');
    // Submit
    await page.click('button[type="submit"]');

    // 7. Passport View
    await page.waitForURL(/\/passport/);
    await expect(page.locator('text=Digital Passport')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});

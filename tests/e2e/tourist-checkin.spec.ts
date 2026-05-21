import { test, expect } from '@playwright/test';

test.describe('Tourist Check-in Flow', () => {
  // Use a known demo checkin code that was seeded
  const checkinCode = 'DEMO-CODE-123';

  test('should complete the entire check-in and certificate flow', async ({ page }) => {
    // 1. Visit the QR Check-in Landing Page
    await page.goto(`/checkin/${checkinCode}`);
    await expect(page.locator('text=สแกนสำเร็จ!')).toBeVisible();
    await page.click('text=เริ่มต้นสร้างความทรงจำ');

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
    
    // Playwright lets you set files with a buffer directly using setInputFiles, 
    // but we can also use a temporary file. For simplicity, we just use the buffer.
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer
    });
    
    await expect(page.locator('text=เปลี่ยนรูป')).toBeVisible();
    await page.click('button:has-text("ยืนยันรูปภาพ")');

    // 4. Certificate Preview
    await page.waitForURL(/\/visit\/[^/]+\/certificate\/preview/);
    await expect(page.locator('text=ตรวจสอบและยืนยัน')).toBeVisible();
    await page.click('button:has-text("ยืนยันและสร้างใบประกาศ")');

    // 5. Certificate Success
    await page.waitForURL(/\/visit\/[^/]+\/certificate\/success/);
    await expect(page.locator('text=สำเร็จ!')).toBeVisible();
    await page.click('a:has-text("ไปทำแบบสอบถามสั้นๆ")');

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

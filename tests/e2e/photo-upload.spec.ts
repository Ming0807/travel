import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Tourist Photo Upload Flow', () => {
  const checkinCode = 'DEMO-CODE-123';

  test('should successfully upload a photo via the UI and navigate to certificate preview', async ({ page }) => {
    test.setTimeout(90000);

    // 1. Visit the QR Check-in Landing Page
    await page.goto(`/checkin/${checkinCode}`);
    await expect(page.locator('text=เริ่มต้นเช็คอิน')).toBeVisible();
    await page.click('text=เริ่มต้นเช็คอิน');
    
    // Identity selection
    await expect(page).toHaveURL(new RegExp(`/checkin/${checkinCode}/identity`));
    await page.click('text=ดำเนินการต่อแบบ (Guest)');

    // 2. Minimal Profile Form
    await expect(page).toHaveURL(new RegExp(`/checkin/${checkinCode}/start`));
    await page.fill('input[name="displayName"]', 'Test Photo Uploader');
    await page.fill('input[name="originCountry"]', 'Thailand');
    await page.fill('input[name="originProvince"]', 'Bangkok');
    await page.check('input[type="radio"][name="ageGroup"][value="25-34"]', { force: true });
    await page.check('input[name="hasConsented"]');
    await page.click('button[type="submit"]');

    // 3. Wait for redirect to photo upload page
    await page.waitForURL(/\/visit\/[^/]+\/photo/);
    const visitUrl = page.url();
    const visitId = visitUrl.match(/\/visit\/([^/]+)\/photo/)?.[1];
    expect(visitId).toBeDefined();

    // Verify UI elements
    await expect(page.locator('text=เพิ่มรูปถ่ายของคุณ')).toBeVisible();
    await expect(page.locator('text=แตะเพื่ออัปโหลดรูป')).toBeVisible();

    // 4. Upload photo via UI
    const fileInput = page.locator('input[type="file"][name="photo"]');
    
    // Create a temporary test image
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(testImagePath, buffer);
    }
    
    await fileInput.setInputFiles(testImagePath);

    // After setting the file, the preview should be visible
    // "เปลี่ยนรูป" and "ลบรูป" buttons should appear
    await expect(page.locator('button:has-text("เปลี่ยนรูป")')).toBeVisible();
    await expect(page.locator('button:has-text("ลบรูป")')).toBeVisible();

    // The submit button should change from "เลือกรูปก่อน" to "อัปโหลดและไปต่อ"
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toHaveText(/อัปโหลดและไปต่อ/);

    // Click submit
    await submitBtn.click();

    // 5. Verify redirect to certificate preview with photoId and previewUrl query params
    await page.waitForURL(/\/visit\/[^/]+\/certificate\/preview\?photoId=[^&]+&previewUrl=[^&]+/);
    
    const url = new URL(page.url());
    expect(url.searchParams.get('photoId')).toBeTruthy();
    expect(url.searchParams.get('previewUrl')).toBeTruthy();

    await expect(page.locator('text=ใบประกาศของคุณพร้อมแล้ว')).toBeVisible();
  });

  test('should show validation error for invalid file type', async ({ page }) => {
    test.setTimeout(90000);

    // To speed up, we can just hit the checkin flow again
    await page.goto(`/checkin/${checkinCode}`);
    await page.click('text=เริ่มต้นเช็คอิน');
    await page.click('text=ดำเนินการต่อแบบ (Guest)');

    await expect(page).toHaveURL(new RegExp(`/checkin/${checkinCode}/start`));
    await page.fill('input[name="displayName"]', 'Test Error Uploader');
    await page.fill('input[name="originCountry"]', 'Thailand');
    await page.fill('input[name="originProvince"]', 'Bangkok');
    await page.check('input[type="radio"][name="ageGroup"][value="25-34"]', { force: true });
    await page.check('input[name="hasConsented"]');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/visit\/[^/]+\/photo/);

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.dismiss();
    });

    const fileInput = page.locator('input[type="file"][name="photo"]');
    
    const invalidFilePath = path.join(__dirname, 'invalid.txt');
    fs.writeFileSync(invalidFilePath, 'this is not an image');
    
    await fileInput.setInputFiles(invalidFilePath);

    await expect.poll(() => alertMessage).toContain('รองรับเฉพาะไฟล์รูปภาพ');

    fs.unlinkSync(invalidFilePath);
  });
});

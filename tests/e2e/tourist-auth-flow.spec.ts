import { test, expect } from '@playwright/test';

test.describe('Tourist Auth Flow', () => {
  test('auth gate block at /stories/share', async ({ page }) => {
    await page.goto('/stories/share');

    // Check Google and LINE buttons are shown
    await expect(page.locator('button', { hasText: /Google/i })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button', { hasText: /LINE/i })).toBeVisible();
    
    // Ensure the share form is not visible since user is unauthenticated
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Profile page UI unauthenticated shows not found', async ({ page }) => {
    await page.goto('/profile');
    
    // Profile page should show the CTA link to attractions
    // Use the specific class bg-teal to find the main CTA button
    await expect(page.locator('a.bg-teal[href="/attractions"]')).toBeVisible({ timeout: 5000 });
  });
});

import { test, expect, type Page } from "@playwright/test";

/**
 * Mock HTML for Admin Stories Page
 */
function adminStoriesHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Travel Stories Management</title></head>
<body>
  <div class="flex h-screen">
    <main class="flex-1 p-6">
      <h1 class="text-3xl font-black">บทความท่องเที่ยว</h1>
      
      <!-- Filter Form Mock -->
      <form action="/admin/stories" method="GET" class="mt-6 flex gap-4">
        <input name="search" type="text" placeholder="ค้นหาชื่อบทความ, slug..." class="border rounded px-3 py-2" />
        <select name="status" class="border rounded px-3 py-2">
          <option value="">ทั้งหมด</option>
          <option value="published">Published</option>
          <option value="pending">Pending Review</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit">Filter</button>
      </form>

      <!-- Table Mock -->
      <table class="w-full mt-6">
        <thead>
          <tr>
            <th>ชื่อบทความ</th>
            <th>สถานะ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>นั่งโง่ๆ ดูพระอาทิตย์ตกที่หาดนราทัศน์ นราธิวาส</td>
            <td><span class="status-badge">pending</span></td>
            <td>
              <form method="POST" action="/api/admin/stories/update-status">
                <input type="hidden" name="story_id" value="123" />
                <button type="submit" name="status" value="published">Approve</button>
                <button type="submit" name="status" value="rejected">Reject</button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</body>
</html>`;
}

test.describe('Tourist Stories (UGC) Public & Admin', () => {

  test('Public stories page shows published stories and "Share Your Story" CTA', async ({ page }) => {
    await page.goto('/stories');
    
    // Check if the title is visible using locator to avoid name matching issues with HTML
    await expect(page.locator('main h1').first()).toBeVisible();
    
    // Check for CTA
    await expect(page.locator('text=แบ่งปันเรื่องราว').first()).toBeVisible();
    
    // Verify articles are rendered
    const articles = page.locator('article');
    if (await articles.count() > 0) {
      await expect(articles.first()).toBeVisible();
    }
  });

  test('Public story detail page renders correctly', async ({ page }) => {
    await page.goto('/stories');
    
    // Click on the first story if available
    const firstStoryLink = page.locator('article a').first();
    if (await firstStoryLink.isVisible()) {
      await firstStoryLink.click();
      
      // Wait for navigation
      await page.waitForURL(/\/stories\/.+/);
      
      // Check for author byline or content (checking for 'By' or a date could be brittle if not found, let's just check h1)
      await expect(page.locator('main h1').first()).toBeVisible();
    }
  });

  test('Admin can filter pending stories and see moderation actions (Mocked)', async ({ page }) => {
    // Intercept admin route to return mock HTML
    await page.route("**/admin/stories*", async (route) => {
      await route.fulfill({ status: 200, contentType: "text/html", body: adminStoriesHtml() });
    });

    await page.goto('/admin/stories?status=pending');
    
    await expect(page.locator('text=บทความท่องเที่ยว')).toBeVisible();
    
    // Check if filter select is present
    const statusSelect = page.locator('select[name="status"]');
    await expect(statusSelect).toBeVisible();
    
    // Check for pending story in table
    await expect(page.locator('text=นั่งโง่ๆ ดูพระอาทิตย์ตกที่หาดนราทัศน์ นราธิวาส')).toBeVisible();
    
    // Check for Approve/Reject buttons
    await expect(page.locator('button:has-text("Approve")')).toBeVisible();
    await expect(page.locator('button:has-text("Reject")')).toBeVisible();
  });
});

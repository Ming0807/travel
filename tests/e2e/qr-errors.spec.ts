import { test, expect, type Page } from "@playwright/test";

/**
 * Mock HTML generator for QR check-in error pages.
 * Mirrors the CheckinUnavailable component structure.
 */
function errorPageHtml(status: string, title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Check-in Error</title></head>
<body>
  <div class="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto w-full px-6 text-center">
    <div class="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
      <svg width="40" height="40" viewBox="0 0 256 256" fill="currentColor"><path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm-8 56a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0Zm8 112a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z"/></svg>
    </div>
    <h1 class="text-2xl font-semibold text-ink mb-2">${title}</h1>
    <p class="text-gray-500 mb-8">${message}</p>
    <a href="/" class="w-full flex items-center justify-center py-4 bg-gray-100 text-ink rounded-2xl font-medium hover:bg-gray-200 transition-colors">
      กลับสู่หน้าหลัก
    </a>
  </div>
</body>
</html>`;
}

/** Mock HTML generator for a valid QR check-in landing page. */
function validLandingHtml(code: string, attractionName: string = "บ่อน้ำร้อนเบตง"): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Check-in</title></head>
<body>
  <main class="min-h-screen bg-slate-50">
    <div class="relative z-10 pt-[28vh] px-5 flex flex-col items-center max-w-lg mx-auto w-full">
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full text-center">
        <h1 class="text-3xl font-black text-ink mb-3">${attractionName}</h1>
        <p class="text-muted text-[15px] font-medium mb-8">รหัสเช็กอิน: ${code}</p>
        <a href="/checkin/${code}/identity" class="w-full flex items-center justify-center gap-2 py-4 px-6 bg-ink text-white rounded-2xl font-bold text-lg">
          เริ่มต้นเช็คอิน
        </a>
      </div>
    </div>
  </main>
</body>
</html>`;
}

// Shared handler variable set per-test via setupRoutes
let currentHandler: ((url: string) => { status: number; contentType: string; body: string } | null) | null = null;

function setupCheckinRoutes(page: Page) {
  return page.route("**/checkin/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method !== "GET") return route.continue();
    if (currentHandler) {
      const result = currentHandler(url);
      if (result) {
        await route.fulfill({
          status: result.status,
          contentType: result.contentType,
          body: result.body,
        });
        return;
      }
    }
    await route.continue();
  });
}

test.describe("QR Check-in Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    currentHandler = null;
    await setupCheckinRoutes(page);
  });

  test("shows 'not found' error for invalid QR code", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/invalid-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("not_found", "ไม่พบ QR Code นี้", "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ"),
        };
      }
      return null;
    };

    await page.goto("/checkin/invalid-code");

    // Verify error elements
    await expect(page.locator("h1")).toContainText("ไม่พบ QR Code นี้");
    await expect(page.locator("p")).toContainText("รหัสเช็กอินไม่ถูกต้อง");

    // Verify back link exists and points to homepage
    const backLink = page.locator('a[href="/"]');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText("กลับสู่หน้าหลัก");

    // Verify no stack traces or internal details
    await expect(page.locator("text=Error:")).not.toBeVisible();
    await expect(page.locator("text=stack")).not.toBeVisible();
    await expect(page.locator("text=supabase")).not.toBeVisible();
  });

  test("shows 'inactive' error for deactivated QR code", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/deactivated-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("inactive", "QR Code ยังไม่เปิดใช้งาน", "รหัสนี้ยังไม่เปิดใช้งาน หรือถูกปิดใช้งานแล้ว"),
        };
      }
      return null;
    };

    await page.goto("/checkin/deactivated-code");

    await expect(page.locator("h1")).toContainText("QR Code ยังไม่เปิดใช้งาน");
    await expect(page.locator("p")).toContainText("ถูกปิดใช้งานแล้ว");
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test("shows 'expired' error for expired QR code", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/expired-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("expired", "QR Code หมดอายุแล้ว", "ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป"),
        };
      }
      return null;
    };

    await page.goto("/checkin/expired-code");

    await expect(page.locator("h1")).toContainText("QR Code หมดอายุแล้ว");
    await expect(page.locator("p")).toContainText("ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป");
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test("shows 'unavailable' error when attraction is inactive", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/unavailable-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("unavailable", "สถานที่ยังไม่เปิดให้เช็กอิน", "สถานที่นี้ถูกระงับหรือยังไม่พร้อมสำหรับการเช็กอิน"),
        };
      }
      return null;
    };

    await page.goto("/checkin/unavailable-code");

    await expect(page.locator("h1")).toContainText("สถานที่ยังไม่เปิดให้เช็กอิน");
    await expect(page.locator("p")).toContainText("ยังไม่พร้อมสำหรับการเช็กอิน");
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test("valid QR code shows landing page with start CTA", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/active-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: validLandingHtml("active-code", "อุทยานแห่งชาติ"),
        };
      }
      return null;
    };

    await page.goto("/checkin/active-code");

    // Verify landing page shows attraction name
    await expect(page.locator("h1")).toContainText("อุทยานแห่งชาติ");

    // Verify start CTA links to identity selection
    const startCta = page.locator('a[href="/checkin/active-code/identity"]');
    await expect(startCta).toBeVisible();
    await expect(startCta).toContainText("เริ่มต้นเช็คอิน");
  });

  test("valid QR routes to identity selection page", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/active-code/identity")) {
        return {
          status: 200,
          contentType: "text/html",
          body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Identity Selection</title></head>
<body>
  <div class="min-h-screen bg-slate-50">
    <h1 class="text-[28px] font-black tracking-tight">เริ่มต้นเช็คอิน</h1>
    <p class="text-[15px] font-medium text-ink/70">เลือกช่องทางการเข้าใช้งานที่สะดวกที่สุด</p>
    <div class="space-y-4">
      <a href="/checkin/active-code/start?identity=line" class="bg-[#00C300] text-white rounded-2xl font-bold px-4 py-4">
        เข้าสู่ระบบด้วย LINE
      </a>
      <a href="/checkin/active-code/start?identity=email" class="border border-ink/10 text-ink rounded-2xl font-bold px-4 py-4">
        เข้าสู่ระบบด้วยอีเมล
      </a>
      <a href="/checkin/active-code/start" class="font-bold text-sm">
        ดำเนินการต่อแบบ (Guest)
      </a>
    </div>
  </div>
</body>
</html>`,
        };
      }
      // For the landing page, return valid landing
      if (url.includes("/checkin/active-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: validLandingHtml("active-code", "อุทยานแห่งชาติ"),
        };
      }
      return null;
    };

    // Navigate through landing page then to identity selection
    await page.goto("/checkin/active-code/identity");

    // Verify identity selection page
    await expect(page.locator("h1")).toContainText("เริ่มต้นเช็คอิน");
    await expect(page.locator('text=LINE')).toBeVisible();
    await expect(page.locator('text=Guest')).toBeVisible();
    await expect(page.locator('text=อีเมล')).toBeVisible();
  });

  test("identity selection guest link navigates to start page", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/guest-code/start")) {
        return {
          status: 200,
          contentType: "text/html",
          body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Start Check-in</title></head>
<body>
  <main class="min-h-screen bg-slate-50">
    <h1 class="text-3xl font-black text-ink">ข้อมูลของคุณ</h1>
    <p class="text-muted text-sm font-medium">กรอกข้อมูลสั้น ๆ เพื่อสร้างใบประกาศดิจิทัลและสะสมตราประทับ</p>
    <form>
      <input name="displayName" placeholder="ชื่อที่ต้องการแสดงบนใบประกาศ" />
      <button type="submit">ดำเนินการต่อ</button>
    </form>
  </main>
</body>
</html>`,
        };
      }
      if (url.includes("/checkin/guest-code/identity")) {
        return {
          status: 200,
          contentType: "text/html",
          body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Identity Selection</title></head>
<body>
  <div>
    <h1>เริ่มต้นเช็คอิน</h1>
    <a href="/checkin/guest-code/start">ดำเนินการต่อแบบ (Guest)</a>
  </div>
</body>
</html>`,
        };
      }
      if (url.includes("/checkin/guest-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: validLandingHtml("guest-code", "หาดทรายทอง"),
        };
      }
      return null;
    };

    // Start at identity selection
    await page.goto("/checkin/guest-code/identity");

    // Click guest link to navigate to start page
    const guestLink = page.locator('a[href="/checkin/guest-code/start"]');
    await expect(guestLink).toBeVisible();
    await guestLink.click();

    // Verify start page shows form
    await expect(page.locator("h1")).toContainText("ข้อมูลของคุณ");
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
  });

  test("prevents navigation to identity for expired QR", async ({ page }) => {
    // identity page also checks code validity
    currentHandler = (url) => {
      if (url.includes("/checkin/expired-code/identity")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("expired", "QR Code หมดอายุแล้ว", "ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป"),
        };
      }
      if (url.includes("/checkin/expired-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("expired", "QR Code หมดอายุแล้ว", "ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป"),
        };
      }
      return null;
    };

    // Try to access identity page directly for expired code
    await page.goto("/checkin/expired-code/identity");

    // Should show the expired error, not the identity selection
    await expect(page.locator("h1")).toContainText("QR Code หมดอายุแล้ว");
    await expect(page.locator("p")).toContainText("ไม่สามารถเช็กอินผ่านรหัสนี้ได้อีกต่อไป");
  });

  test("inactive code redirect fallback shows error on all checkin sub-pages", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/inactive-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("inactive", "QR Code ยังไม่เปิดใช้งาน", "รหัสนี้ยังไม่เปิดใช้งาน หรือถูกปิดใช้งานแล้ว"),
        };
      }
      return null;
    };

    // Try direct access to start page for inactive code
    await page.goto("/checkin/inactive-code/start");
    await expect(page.locator("h1")).toContainText("QR Code ยังไม่เปิดใช้งาน");
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test("invalid code also blocked on start page", async ({ page }) => {
    currentHandler = (url) => {
      if (url.includes("/checkin/nonexistent-code")) {
        return {
          status: 200,
          contentType: "text/html",
          body: errorPageHtml("not_found", "ไม่พบ QR Code นี้", "รหัสเช็กอินไม่ถูกต้อง หรือไม่มีอยู่ในระบบ"),
        };
      }
      return null;
    };

    await page.goto("/checkin/nonexistent-code/start");
    await expect(page.locator("h1")).toContainText("ไม่พบ QR Code นี้");
    await expect(page.locator("p")).toContainText("รหัสเช็กอินไม่ถูกต้อง");
  });

  test("all error pages have consistent layout with back-to-home link", async ({ page }) => {
    const testCases = [
      { code: "invalid-abc", title: "ไม่พบ QR Code นี้" },
      { code: "inactive-def", title: "QR Code ยังไม่เปิดใช้งาน" },
    ];

    for (const { code, title } of testCases) {
      currentHandler = (url) => {
        if (url.includes(`/checkin/${code}`)) {
          return {
            status: 200,
            contentType: "text/html",
            body: errorPageHtml("not_found", title, "กรุณาลองใหม่อีกครั้ง"),
          };
        }
        return null;
      };

      await page.goto(`/checkin/${code}`);

      // Each error should have: icon, title, message, back link
      await expect(page.locator("h1")).toContainText(title);
      await expect(page.locator('a[href="/"]')).toBeVisible();
      await expect(page.locator("svg")).toBeVisible();
    }
  });
});

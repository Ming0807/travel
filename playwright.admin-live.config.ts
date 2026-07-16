import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim();

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "admin-live-smoke.spec.ts",
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  outputDir: "test-results/admin-live",
  use: {
    baseURL: externalBaseUrl || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "admin-live",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run dev -- -H 127.0.0.1 -p 3000",
        url: "http://127.0.0.1:3000/admin/login",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

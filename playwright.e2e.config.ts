import { defineConfig } from "@playwright/test";

/**
 * E2E config for route-intercepted tests and mock-server tests.
 *
 * Uses a lightweight Node.js HTTP server (mock-server.mjs) instead of
 * the full Next.js dev server, which crashes on this Windows environment
 * due to Turbopack incompatibility.
 *
 * The mock server serves minimal admin HTML pages and mock CSV responses,
 * enough to verify export button presence, navigation, and download flows.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "crud-export.spec.ts",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3568",
    trace: "on-first-retry",
    headless: true,
  },
  webServer: {
    command: "node tests/e2e/mock-server.mjs",
    port: 3568,
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});

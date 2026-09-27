import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

export default defineConfig({
  testDir: ".",
  testMatch: "routes.browser.spec.ts",
  outputDir: "../../../output/playwright/routes-browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4188", browserName: "chromium", trace: "retain-on-failure" },
  projects: [360, 768, 1440].map((width) => ({
    name: `width-${width}`,
    use: { viewport: { width, height: 900 } },
  })),
  webServer: {
    cwd: resolve(__dirname, "../../.."),
    command: "pnpm exec vite --config tests/visual/routes/vite.config.ts",
    url: "http://127.0.0.1:4188",
    reuseExistingServer: !process.env.CI,
  },
});

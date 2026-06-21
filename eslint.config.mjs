import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Legacy Supabase boundaries and test builders still contain explicit
      // `any` casts. Keep them visible in lint output while the codebase is
      // moved to typed DTOs incrementally, but do not block the production gate
      // on broad mechanical rewrites.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }]
    }
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".agents/**",
    ".codex/**",
    ".github/skills/**",
    ".reasonix/**"
  ])
]);

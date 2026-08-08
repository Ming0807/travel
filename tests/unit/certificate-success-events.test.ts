import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "app/(tourist)/visit/[visitId]/certificate/success/page.tsx"),
  "utf8",
);

describe("certificate success event semantics", () => {
  it("does not claim a passport save while merely rendering success", () => {
    expect(source).not.toMatch(/eventName:\s*["']passport_saved["']/);
  });
});

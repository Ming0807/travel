import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("camera permissions policy", () => {
  it("allows same-origin camera capture without granting embedded origins access", async () => {
    const rules = await nextConfig.headers?.();
    const policy = rules
      ?.flatMap((rule) => rule.headers)
      .find((header) => header.key === "Permissions-Policy");

    expect(policy?.value).toContain("camera=(self)");
    expect(policy?.value).not.toContain("camera=()");
    expect(policy?.value).toContain("microphone=()");
  });
});

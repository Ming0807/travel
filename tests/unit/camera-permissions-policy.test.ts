import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("camera permissions policy", () => {
  it("allows bundled certificate template images without opening every local path", () => {
    expect(nextConfig.images?.localPatterns).toContainEqual({
      pathname: "/certificate-templates/**",
    });
    expect(nextConfig.images?.localPatterns).not.toContainEqual({ pathname: "/**" });
  });

  it("allows same-origin camera capture without granting embedded origins access", async () => {
    const rules = await nextConfig.headers?.();
    const policy = rules
      ?.flatMap((rule) => rule.headers)
      .find((header) => header.key === "Permissions-Policy");

    expect(policy?.value).toContain("camera=(self)");
    expect(policy?.value).not.toContain("camera=()");
    expect(policy?.value).toContain("microphone=()");
  });

  it("allows the first-party Google Maps embed without widening all frame origins", async () => {
    const rules = await nextConfig.headers?.();
    const policy = rules
      ?.flatMap((rule) => rule.headers)
      .find((header) => header.key === "Content-Security-Policy");

    expect(policy?.value).toContain("frame-src 'self' https://www.youtube.com https://www.google.com");
    expect(policy?.value).not.toContain("frame-src *");
  });
});

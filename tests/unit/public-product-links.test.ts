import { describe, expect, it } from "vitest";
import { VISTA_360_EXTERNAL_URL } from "@/constants/product";
import nextConfig from "@/next.config";

describe("public product links", () => {
  it("uses the official Na Tham 360 destination", () => {
    expect(VISTA_360_EXTERNAL_URL).toBe("https://yala360.yru.ac.th/Natham/");
  });

  it("allows optimized public partner logos without opening every local path", () => {
    expect(nextConfig.images?.localPatterns).toContainEqual({ pathname: "/partners/**" });
    expect(nextConfig.images?.localPatterns).not.toContainEqual({ pathname: "/**" });
  });
});

import { describe, expect, it } from "vitest";
import { normalizeAdminLoginIdentifier } from "@/lib/auth/admin-login";

describe("normalizeAdminLoginIdentifier", () => {
  it("turns admin username into internal auth email", () => {
    expect(normalizeAdminLoginIdentifier("amornthep")).toBe("amornthep@admin.local");
  });

  it("keeps explicit email addresses", () => {
    expect(normalizeAdminLoginIdentifier("Admin@Example.COM ")).toBe("admin@example.com");
  });

  it("returns an empty string for missing values", () => {
    expect(normalizeAdminLoginIdentifier(null)).toBe("");
  });
});

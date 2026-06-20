import { describe, it, expect } from "vitest";
import { adminCheckinCodeMutationSchema } from "../../lib/validation/checkin-code";

describe("Admin Check-in Code Validation", () => {
  it("should validate a correct checkin code payload", () => {
    const payload = {
      code: "aiyerweng-main-01",
      attractionId: 1,
      photoSpotId: 2,
      label: "Main view point",
      isActive: true,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 100000).toISOString(),
    };
    
    const result = adminCheckinCodeMutationSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should require a valid URL-safe code", () => {
    const payload = {
      code: "invalid code!",
      attractionId: 1,
      isActive: true,
    };
    
    const result = adminCheckinCodeMutationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.code).toBeDefined();
    }
  });

  it("should reject startsAt being after endsAt", () => {
    const payload = {
      code: "aiyerweng-main-01",
      attractionId: 1,
      isActive: true,
      startsAt: new Date(Date.now() + 100000).toISOString(),
      endsAt: new Date().toISOString(),
    };
    
    const result = adminCheckinCodeMutationSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endsAt).toBeDefined();
    }
  });

  it("should parse boolean strings properly", () => {
    const payload = {
      code: "aiyerweng-main-01",
      attractionId: 1,
      isActive: "true",
    };
    
    const result = adminCheckinCodeMutationSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });
});

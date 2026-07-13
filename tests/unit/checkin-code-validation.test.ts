import { describe, expect, it } from "vitest";
import {
  adminCheckinCodeFiltersSchema,
  adminCheckinCodeMutationSchema,
} from "@/lib/validation/checkin-code";

describe("admin check-in code validation", () => {
  it("parses active status filters without treating 'false' as true", () => {
    expect(adminCheckinCodeFiltersSchema.parse({ isActive: "true" }).isActive).toBe(true);
    expect(adminCheckinCodeFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
    expect(adminCheckinCodeFiltersSchema.parse({ isActive: "" }).isActive).toBeUndefined();
  });

  it("normalizes codes to lowercase before persistence", () => {
    const parsed = adminCheckinCodeMutationSchema.parse({
      code: "AIYERWENG-SKYWALK-01",
      attractionId: "12",
      photoSpotId: "",
      label: "",
      isActive: "true",
      startsAt: "",
      endsAt: "",
    });

    expect(parsed.code).toBe("aiyerweng-skywalk-01");
    expect(parsed.photoSpotId).toBeNull();
    expect(parsed.label).toBeNull();
  });

  it("rejects schedules where the end time is before the start time", () => {
    const parsed = adminCheckinCodeMutationSchema.safeParse({
      code: "demo-code",
      attractionId: "12",
      photoSpotId: "",
      label: "",
      isActive: "true",
      startsAt: "2026-06-20T10:00",
      endsAt: "2026-06-20T09:00",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.endsAt?.[0]).toContain("Start date");
    }
  });

  it("interprets datetime-local schedules in Bangkok time", () => {
    const parsed = adminCheckinCodeMutationSchema.parse({
      code: "demo-code",
      attractionId: "12",
      photoSpotId: "",
      label: "",
      isActive: "true",
      startsAt: "2026-06-20T10:30",
      endsAt: "2026-06-20T11:30",
    });

    expect(parsed.startsAt).toBe("2026-06-20T03:30:00.000Z");
    expect(parsed.endsAt).toBe("2026-06-20T04:30:00.000Z");
  });
});

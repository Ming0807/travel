import { describe, expect, it } from "vitest";
import {
  DEFAULT_PHOTO_ADJUSTMENT,
  normalizePhotoAdjustment,
} from "@/lib/certificate/certificate-customization";

describe("certificate photo customization", () => {
  it("uses centered defaults for missing values", () => {
    expect(normalizePhotoAdjustment(undefined)).toEqual(DEFAULT_PHOTO_ADJUSTMENT);
  });

  it("clamps zoom and crop positions to the supported range", () => {
    expect(normalizePhotoAdjustment({ zoom: 9, x: -20, y: 140 })).toEqual({
      zoom: 2,
      x: 0,
      y: 100,
    });
  });
});

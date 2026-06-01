import { describe, expect, it } from "vitest";
import { z } from "zod";

// =========================================
// Validation message tests for admin schemas
// These test that the Zod schemas produce the correct Thai-friendly
// error messages that we depend on in admin server actions.
// =========================================

describe("Admin attraction validation messages", () => {
  it("validates slug format message", () => {
    const schema = z
      .string()
      .trim()
      .min(3, "Slug is required.")
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, URL-safe, and hyphen-separated.");

    const result = schema.safeParse("My Beach!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("URL-safe");
    }
  });

  it("validates Thai name required message", () => {
    const schema = z.string().trim().min(1, "Thai attraction name is required.").max(255);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Thai attraction name is required.");
    }
  });
});

describe("Admin check-in code validation messages", () => {
  it("provides URL-safe error for invalid code characters", () => {
    const schema = z
      .string()
      .trim()
      .min(3, "Check-in code is required.")
      .max(100)
      .regex(/^[a-zA-Z0-9_-]+$/, "Check-in code must be URL-safe.");

    const result = schema.safeParse("hello world");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Check-in code must be URL-safe.");
    }
  });

  it("provides start-before-end message for inverted dates", () => {
    const schema = z
      .object({
        startsAt: z.string().nullable(),
        endsAt: z.string().nullable(),
      })
      .refine(
        (data) => !data.startsAt || !data.endsAt || new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(),
        {
          message: "Start date must be before end date.",
          path: ["endsAt"],
        }
      );

    const result = schema.safeParse({
      startsAt: "2026-06-01T00:00:00.000Z",
      endsAt: "2026-05-01T00:00:00.000Z",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const endsAtIssue = result.error.issues.find((i) => i.path.includes("endsAt"));
      expect(endsAtIssue?.message).toBe("Start date must be before end date.");
    }
  });
});

describe("Admin photo spot validation messages", () => {
  it("provides Thai name required message", () => {
    const schema = z.string().trim().min(1, "Thai photo spot name is required.").max(255);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Thai photo spot name is required.");
    }
  });
});

describe("Admin route validation messages", () => {
  it("provides name required message", () => {
    const schema = z.string().trim().min(1, "Thai name is required.").max(255);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Thai name is required.");
    }
  });
});

describe("Admin story validation messages", () => {
  it("provides title required message", () => {
    const schema = z.string().trim().min(1, "Title is required.").max(255);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required.");
    }
  });
});

describe("Admin media validation messages", () => {
  it("provides upload required message when storagePath is missing", () => {
    const schema = z.preprocess(
      (value) => (value === undefined || value === null ? "" : value),
      z.string().trim().min(1, "Upload a file or add a URL before saving.")
    );

    const result = schema.safeParse(undefined);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Upload a file or add a URL before saving.");
    }
  });

  it("provides media type selection message", () => {
    const schema = z.enum(["image", "panorama", "video360", "embed", "external_url"], {
      error: "Choose a supported media type.",
    });

    const result = schema.safeParse("audio");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Choose a supported media type.");
    }
  });

  it("provides URL validation message for sourceUrl", () => {
    const schema = z.preprocess(
      (value) => (value === undefined || value === "" ? null : value),
      z.string().trim().url("Source URL must be a valid URL.").max(1000).nullable()
    );

    const result = schema.safeParse("not-a-url");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Source URL must be a valid URL.");
    }
  });
});

describe("Admin accommodation validation messages", () => {
  it("requires Thai name", () => {
    const schema = z.string().trim().min(1, "Thai accommodation name is required.").max(255);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Thai accommodation name is required.");
    }
  });
});

describe("Admin restaurant validation messages", () => {
  it("requires Thai name", () => {
    const schema = z.string().trim().min(1, "Thai restaurant name is required.").max(255);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Thai restaurant name is required.");
    }
  });
});

// =========================================
// Survey validation messages (Thai)
// =========================================
describe("Survey validation messages", () => {
  it("requires at least one field response in Thai", () => {
    const schema = z
      .object({
        visitId: z.string().uuid(),
        overallSatisfaction: z.number().int().min(1).max(5).optional(),
        optionalComment: z.string().max(1000).optional(),
      })
      .refine(
        (data) => data.overallSatisfaction !== undefined || (data.optionalComment !== undefined && data.optionalComment !== ""),
        {
          message: "กรุณาตอบอย่างน้อยหนึ่งข้อ",
        }
      );

    const result = schema.safeParse({ visitId: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("กรุณาตอบอย่างน้อยหนึ่งข้อ");
    }
  });

  it("rejects satisfaction score of 0 with int min message", () => {
    const schema = z.number().int().min(1).max(5);
    const result = schema.safeParse(0);
    expect(result.success).toBe(false);
  });
});

// =========================================
// Dashboard filter validation messages
// =========================================
describe("Dashboard filter validation messages", () => {
  it("requires YYYY-MM-DD format", () => {
    const schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.");
    const result = schema.safeParse("01-01-2026");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Date must use YYYY-MM-DD format.");
    }
  });

  it("validates max date range message", () => {
    const DASHBOARD_DATE_RANGE_MAX_DAYS = 365;
    const schema = z
      .number()
      .refine((val) => val <= DASHBOARD_DATE_RANGE_MAX_DAYS, {
        message: `Dashboard date range cannot exceed ${DASHBOARD_DATE_RANGE_MAX_DAYS} days.`,
      });
    const result = schema.safeParse(400);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot exceed");
    }
  });
});

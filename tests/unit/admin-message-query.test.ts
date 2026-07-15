import { describe, expect, it } from "vitest";
import {
  adminMessageQuerySchema,
  buildContactMessageSearchFilter,
  toContactMessageExportRows,
} from "@/lib/validation/admin-message";

describe("adminMessageQuerySchema", () => {
  it("defaults to newest all-status messages with bounded pagination", () => {
    const result = adminMessageQuerySchema.parse({});

    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      status: "all",
      sort: "newest",
    });
  });

  it("trims search and accepts valid status and sort filters", () => {
    const result = adminMessageQuerySchema.parse({
      page: "2",
      pageSize: "50",
      status: "archived",
      sort: "oldest",
      search: "  Pattani visitor  ",
    });

    expect(result).toEqual({
      page: 2,
      pageSize: 50,
      status: "archived",
      sort: "oldest",
      search: "Pattani visitor",
    });
  });

  it("rejects invalid status and sort filters instead of silently broadening results", () => {
    expect(() => adminMessageQuerySchema.parse({ status: "deleted" })).toThrow();
    expect(() => adminMessageQuerySchema.parse({ sort: "email_asc" })).toThrow();
  });

  it("rejects unknown query keys so list and export semantics stay explicit", () => {
    expect(() => adminMessageQuerySchema.parse({ contact: "all" })).toThrow();
  });
});

describe("buildContactMessageSearchFilter", () => {
  it("escapes wildcard characters before building the PostgREST OR filter", () => {
    const filter = buildContactMessageSearchFilter("50%_promo");

    expect(filter).toContain('name.ilike."%50\\%\\_promo%"');
    expect(filter).toContain('email.ilike."%50\\%\\_promo%"');
    expect(filter).toContain('subject.ilike."%50\\%\\_promo%"');
    expect(filter).toContain('message.ilike."%50\\%\\_promo%"');
  });

  it("keeps commas and escaped quotes inside a quoted PostgREST value", () => {
    const filter = buildContactMessageSearchFilter('visitor, "Yala"');

    expect(filter).toContain('name.ilike."%visitor, \\"Yala\\"%"');
  });
});

describe("toContactMessageExportRows", () => {
  it("keeps the export columns limited to the existing authorized message fields", () => {
    const rows = toContactMessageExportRows([
      {
        id: "message-1",
        name: "Test Visitor",
        email: "visitor@example.test",
        phone: "+66000000000",
        subject: "Hello",
        message: "Saw Yala, Pattani, and Narathiwat",
        status: "read",
        is_replied: true,
        read_at: "2026-07-01T10:00:00.000Z",
        created_at: "2026-07-01T09:00:00.000Z",
      },
    ]);

    expect(rows).toEqual([
      {
        Name: "Test Visitor",
        Email: "visitor@example.test",
        Phone: "+66000000000",
        Subject: "Hello",
        Message: "Saw Yala, Pattani, and Narathiwat",
        Status: "read",
        "Is Replied": "Yes",
        "Read At": "2026-07-01T10:00:00.000Z",
        "Created At": "2026-07-01T09:00:00.000Z",
      },
    ]);

    expect(Object.keys(rows[0])).not.toContain("id");
    expect(Object.keys(rows[0])).not.toContain("read_by");
  });
}
);

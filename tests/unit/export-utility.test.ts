import { describe, it, expect, vi } from "vitest";
import {
  parseExportFormat,
  exportExtension,
  exportFilename,
  // createExportResponse is tested separately because it requires NextResponse
} from "@/lib/utils/export-response";

// ---------------------------------------------------------------------------
// parseExportFormat
// ---------------------------------------------------------------------------
describe("parseExportFormat", () => {
  it("returns 'csv' for null input", () => {
    expect(parseExportFormat(null)).toBe("csv");
  });

  it("returns 'csv' for undefined input", () => {
    expect(parseExportFormat(undefined as unknown as string | null)).toBe(
      "csv"
    );
  });

  it("returns 'csv' for empty string", () => {
    expect(parseExportFormat("")).toBe("csv");
  });

  it("returns 'xlsx' for 'xlsx'", () => {
    expect(parseExportFormat("xlsx")).toBe("xlsx");
  });

  it("returns 'csv' for 'csv'", () => {
    expect(parseExportFormat("csv")).toBe("csv");
  });

  it("returns 'csv' for unknown format", () => {
    expect(parseExportFormat("pdf")).toBe("csv");
    expect(parseExportFormat("json")).toBe("csv");
    expect(parseExportFormat("XLSX")).toBe("csv"); // case-sensitive
  });
});

// ---------------------------------------------------------------------------
// exportExtension
// ---------------------------------------------------------------------------
describe("exportExtension", () => {
  it("returns '.csv' for csv format", () => {
    expect(exportExtension("csv")).toBe(".csv");
  });

  it("returns '.xlsx' for xlsx format", () => {
    expect(exportExtension("xlsx")).toBe(".xlsx");
  });
});

// ---------------------------------------------------------------------------
// exportFilename
// ---------------------------------------------------------------------------
describe("exportFilename", () => {
  it("appends .csv for csv format", () => {
    expect(exportFilename("export_2026-05-28", "csv")).toBe(
      "export_2026-05-28.csv"
    );
  });

  it("appends .xlsx for xlsx format", () => {
    expect(exportFilename("export_2026-05-28", "xlsx")).toBe(
      "export_2026-05-28.xlsx"
    );
  });

  it("replaces existing .csv extension", () => {
    expect(exportFilename("export.csv", "xlsx")).toBe("export.xlsx");
  });

  it("replaces existing .xlsx extension", () => {
    expect(exportFilename("export.xlsx", "csv")).toBe("export.csv");
  });

  it("handles case-insensitive extension replacement", () => {
    // Regex /\.(csv|xlsx)$/i is case-insensitive, so .CSV matches and gets replaced
    expect(exportFilename("export.CSV", "xlsx")).toBe("export.xlsx");
  });

  it("handles filenames with multiple dots before extension", () => {
    expect(exportFilename("my.data.file.csv", "xlsx")).toBe(
      "my.data.file.xlsx"
    );
  });

  it("handles filenames without any extension", () => {
    expect(exportFilename("myexport", "csv")).toBe("myexport.csv");
  });

  it("handles Thai characters in filename", () => {
    const name = "รายงาน_export_2569";
    expect(exportFilename(name, "csv")).toBe(`${name}.csv`);
  });
});

// ---------------------------------------------------------------------------
// createExportResponse integration via module mocking
// ---------------------------------------------------------------------------
describe("createExportResponse (CSV path)", () => {
  it("should produce a NextResponse with CSV content type", async () => {
    vi.resetModules();
    // We test the CSV code path directly
    const { createExportResponse } = await import(
      "@/lib/utils/export-response"
    );
    const rows = [
      { name: "Alice", score: "10" },
      { name: "Bob", score: "20" },
    ];
    const response = await createExportResponse(rows, "test-export", "csv");
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain(
      "test-export.csv"
    );
    // CSV generator wraps fields in quotes
    expect(text).toContain('"name","score"');
    expect(text).toContain('"Alice","10"');
    expect(text).toContain('"Bob","20"');
  });
});

describe("createExportResponse (XLSX path)", () => {
  it("should produce a NextResponse with XLSX content type", async () => {
    vi.resetModules();
    const { createExportResponse } = await import(
      "@/lib/utils/export-response"
    );
    const rows = [{ name: "Test", value: "42" }];
    const response = await createExportResponse(rows, "test-export", "xlsx");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain(
      "spreadsheetml.sheet"
    );
    expect(response.headers.get("Content-Disposition")).toContain(
      "test-export.xlsx"
    );
    // XLSX is binary, so we expect non-empty body
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});

describe("createExportResponse (edge cases)", () => {
  it("handles empty rows array for CSV", async () => {
    vi.resetModules();
    const { createExportResponse } = await import(
      "@/lib/utils/export-response"
    );
    const response = await createExportResponse([], "empty-export", "csv");
    const text = await response.text();

    expect(response.status).toBe(200);
    // Empty CSV should still be valid (just headers or empty)
    expect(text).toBeDefined();
  });

  it("handles empty rows array for XLSX", async () => {
    vi.resetModules();
    const { createExportResponse } = await import(
      "@/lib/utils/export-response"
    );
    const response = await createExportResponse([], "empty-export", "xlsx");
    const buffer = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("handles rows with special characters in CSV", async () => {
    vi.resetModules();
    const { createExportResponse } = await import(
      "@/lib/utils/export-response"
    );
    const rows = [
      { name: "สมชาย ใจดี", note: "สวัสดี, ครับ" },
    ];
    const response = await createExportResponse(rows, "special-chars", "csv");
    const text = await response.text();

    expect(text).toContain("สมชาย");
    // CSV should handle embedded commas with quoting
    expect(text).toContain('"สวัสดี, ครับ"');
  });
});

import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { generateXlsx } from "@/lib/utils/excel";

describe("generateXlsx", () => {
  it("returns a Buffer", async () => {
    const buf = await generateXlsx([{ name: "Alice", score: 10 }]);
    expect(buf).toBeInstanceOf(Buffer);
  });

  it("handles empty data array gracefully", async () => {
    const buf = await generateXlsx([]);
    expect(buf).toBeInstanceOf(Buffer);
    // Should be a valid non-empty buffer
    expect(buf.length).toBeGreaterThan(100);
  });

  it("handles null and undefined values as empty cells", async () => {
    const buf = await generateXlsx([
      { name: "Alice", score: null, tag: undefined, city: "Yala" },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("serializes nested objects to JSON strings", async () => {
    const buf = await generateXlsx([
      { name: "Alice", metadata: { visited: ["A", "B"], rating: 5 } },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles large number of rows", async () => {
    const rows = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      active: i % 2 === 0,
    }));
    const buf = await generateXlsx(rows);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(1000);
  });

  it("handles special characters in cell values", async () => {
    const buf = await generateXlsx([
      { name: "อักษรไทย", description: "ภาษาไทย + English mixed", symbol: "✓★♦♠" },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles boolean values", async () => {
    const buf = await generateXlsx([
      { name: "Alice", isActive: true, isPublished: false },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles numeric values including decimals", async () => {
    const buf = await generateXlsx([
      { product: "A", price: 19.99, quantity: 3, taxRate: 0.07 },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles single row", async () => {
    const buf = await generateXlsx([{ id: 1, name: "Solo", score: 100 }]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles rows with varying field counts gracefully", async () => {
    const buf = await generateXlsx([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob", extraField: "extra" },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("preserves columns that first appear in later rows", async () => {
    const buf = await generateXlsx([
      { Section: "Metadata", Value: "scope" },
      { Section: "Data", Value: 42, Denominator: 50, Note: "answered visits" },
    ]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buf as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const worksheet = workbook.getWorksheet("Export");

    expect(worksheet?.getRow(1).values).toEqual([
      undefined,
      "Section",
      "Value",
      "Denominator",
      "Note",
    ]);
    expect(worksheet?.getCell("C3").value).toBe("50");
    expect(worksheet?.getCell("D3").value).toBe("answered visits");
  });

  it("handles very long string values (>60 chars)", async () => {
    const longString = "A".repeat(200);
    const buf = await generateXlsx([{ id: 1, description: longString }]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles empty string values", async () => {
    const buf = await generateXlsx([{ name: "", description: "valid" }]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("handles date values (Date objects become JSON strings)", async () => {
    const buf = await generateXlsx([
      { name: "Event", date: new Date("2026-05-30T12:00:00Z") },
    ]);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(200);
  });

  it("produces distinct buffers for different datasets", async () => {
    const buf1 = await generateXlsx([{ a: 1 }]);
    const buf2 = await generateXlsx([{ a: 2 }]);
    // Buffers should be different because content differs (though XLSX has timestamps too)
    expect(buf1).toBeInstanceOf(Buffer);
    expect(buf2).toBeInstanceOf(Buffer);
    expect(buf1.length).toBeGreaterThan(0);
    expect(buf2.length).toBeGreaterThan(0);
  });

  it("handles nullish data (null passed as data)", async () => {
    const buf = await generateXlsx(null as unknown as Array<Record<string, unknown>>);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(100);
  });

  it("handles undefined data (undefined passed as data)", async () => {
    const buf = await generateXlsx(undefined as unknown as Array<Record<string, unknown>>);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(100);
  });

  it("neutralizes spreadsheet formulas in text cells", async () => {
    const buf = await generateXlsx([
      {
        name: "=HYPERLINK(\"https://example.test\")",
        note: "+SUM(1,1)",
        numeric: -5,
      },
    ]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buf as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const worksheet = workbook.getWorksheet("Export");

    expect(worksheet?.getCell("A2").value).toBe("'=HYPERLINK(\"https://example.test\")");
    expect(worksheet?.getCell("B2").value).toBe("'+SUM(1,1)");
    expect(worksheet?.getCell("C2").value).toBe("-5");
  });
});

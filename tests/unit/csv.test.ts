import { describe, expect, it } from "vitest";
import { generateCsv, neutralizeFormulaValue } from "@/lib/utils/csv";

describe("neutralizeFormulaValue", () => {
  it("prepends single quote to values starting with =", () => {
    expect(neutralizeFormulaValue("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
  });

  it("prepends single quote to values starting with +", () => {
    expect(neutralizeFormulaValue("+1+1")).toBe("'+1+1");
  });

  it("prepends single quote to values starting with -", () => {
    expect(neutralizeFormulaValue("-1+2")).toBe("'-1+2");
  });

  it("prepends single quote to values starting with @", () => {
    expect(neutralizeFormulaValue("@SUM")).toBe("'@SUM");
  });

  it("prepends single quote to values starting with tab (\\t)", () => {
    expect(neutralizeFormulaValue("\t=SUM")).toBe("'\t=SUM");
  });

  it("prepends single quote to values starting with carriage return (\\r)", () => {
    expect(neutralizeFormulaValue("\r=SUM")).toBe("'\r=SUM");
  });

  it("does not modify normal text values", () => {
    expect(neutralizeFormulaValue("Hello World")).toBe("Hello World");
  });

  it("does not modify numbers", () => {
    expect(neutralizeFormulaValue("12345")).toBe("12345");
  });

  it("does not modify values with = in the middle", () => {
    expect(neutralizeFormulaValue("A=B")).toBe("A=B");
  });

  it("does not modify Thai text", () => {
    expect(neutralizeFormulaValue("สถานที่ท่องเที่ยว")).toBe("สถานที่ท่องเที่ยว");
  });

  it("handles empty string", () => {
    expect(neutralizeFormulaValue("")).toBe("");
  });

  it("handles single characters", () => {
    expect(neutralizeFormulaValue("a")).toBe("a");
    expect(neutralizeFormulaValue("=")).toBe("'=");
  });
});

describe("generateCsv", () => {
  it("includes UTF-8 BOM at the start", () => {
    const result = generateCsv([{ name: "Test" }]);
    expect(result.charCodeAt(0)).toBe(0xfeff);
  });

  it("generates CSV with headers and one row", () => {
    const result = generateCsv([{ name: "Alice", age: 30 }]);
    // Strip BOM for comparison
    const csv = result.slice(1);
    expect(csv).toBe('"name","age"\n"Alice","30"');
  });

  it("generates CSV with multiple rows", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    const result = generateCsv(data);
    const csv = result.slice(1);
    expect(csv).toBe('"name","age"\n"Alice","30"\n"Bob","25"');
  });

  it("handles null values as empty quoted strings", () => {
    const result = generateCsv([{ name: "Alice", age: null }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name","age"\n"Alice",""');
  });

  it("handles undefined values as empty quoted strings", () => {
    const result = generateCsv([{ name: "Alice", age: undefined }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name","age"\n"Alice",""');
  });

  it("escapes double quotes by doubling them", () => {
    const result = generateCsv([{ name: 'Alice "Ali" Smith' }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name"\n"Alice ""Ali"" Smith"');
  });

  it("handles commas within values", () => {
    const result = generateCsv([{ name: "Alice, Smith" }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name"\n"Alice, Smith"');
  });

  it("handles newlines within values", () => {
    const result = generateCsv([{ name: "Alice\nSmith" }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name"\n"Alice\nSmith"');
  });

  it("neutralizes formula injection in values", () => {
    const result = generateCsv([{ name: "=SUM(A1:A10)" }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name"\n"\'=SUM(A1:A10)"');
  });

  it("neutralizes multiple formula injection patterns", () => {
    const data = [
      { field1: "+1+1", field2: "-1+2", field3: "@SUM" },
    ];
    const result = generateCsv(data);
    const csv = result.slice(1);
    expect(csv).toBe('"field1","field2","field3"\n"\'+1+1","\'-1+2","\'@SUM"');
  });

  it("handles Thai characters correctly", () => {
    const result = generateCsv([{ name: "สถานที่ท่องเที่ยว", province: "ยะลา" }]);
    const csv = result.slice(1);
    expect(csv).toBe('"name","province"\n"สถานที่ท่องเที่ยว","ยะลา"');
  });

  it("handles mixed data types", () => {
    const data = [
      { text: "Hello", number: 42, bool: true, nothing: null },
    ];
    const result = generateCsv(data);
    const csv = result.slice(1);
    expect(csv).toBe('"text","number","bool","nothing"\n"Hello","42","true",""');
  });

  it("returns empty string for empty array", () => {
    expect(generateCsv([])).toBe("");
  });

  it("returns empty string for null input", () => {
    // @ts-expect-error - testing null handling
    expect(generateCsv(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    // @ts-expect-error - testing undefined handling
    expect(generateCsv(undefined)).toBe("");
  });

  it("preserves key order from the first object", () => {
    const data = [
      { b: 2, a: 1, c: 3 },
    ];
    const result = generateCsv(data);
    const csv = result.slice(1);
    expect(csv).toBe('"b","a","c"\n"2","1","3"');
  });

  it("fills missing keys with empty strings", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob" }, // missing age
    ];
    const result = generateCsv(data);
    const csv = result.slice(1);
    expect(csv).toBe('"name","age"\n"Alice","30"\n"Bob",""');
  });

  it("preserves columns that first appear in later rows", () => {
    const result = generateCsv([
      { Section: "Metadata", Value: "scope" },
      { Section: "Data", Value: 42, Denominator: 50, Note: "answered visits" },
    ]).slice(1);

    expect(result.split("\n")[0]).toBe('"Section","Value","Denominator","Note"');
    expect(result).toContain('"Data","42","50","answered visits"');
  });

  it("handles large datasets efficiently", () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      value: Math.random(),
    }));
    const result = generateCsv(data);
    expect(result.length).toBeGreaterThan(0);
    // header + 1000 data rows — no trailing newline, BOM is a character prefix not a separate line
    const lines = result.split("\n");
    expect(lines.length).toBe(1001)
  });

  it("handles boolean values correctly", () => {
    const result = generateCsv([{ active: true, verified: false }]);
    const csv = result.slice(1);
    expect(csv).toBe('"active","verified"\n"true","false"');
  });

  it("handles numeric values including zero", () => {
    const result = generateCsv([{ value: 0, price: 99.99, negative: -5 }]);
    const csv = result.slice(1);
    expect(csv).toBe('"value","price","negative"\n"0","99.99","-5"');
  });

  it("handles objects by converting to string", () => {
    const result = generateCsv([{ data: { key: "val" } }]);
    const csv = result.slice(1);
    expect(csv).toContain("[object Object]");
  });

  it("handles dates by converting to string", () => {
    const date = new Date("2026-05-28T10:00:00.000Z");
    const result = generateCsv([{ date }]);
    const csv = result.slice(1);
    // Date string is locale-dependent; just verify it serializes to something
    expect(csv).toContain("2026");
  });

  it("produces valid CSV that can be parsed back", () => {
    const original = [
      { name: "Alice", age: "30", city: "Bangkok" },
      { name: "Bob", age: "25", city: "Yala" },
    ];
    const csv = generateCsv(original).slice(1); // strip BOM

    // Header + 2 data rows = 3 lines
    const allLines = csv.split("\n").filter((l) => l.length > 0);
    expect(allLines.length).toBe(3);

    // Verify header and first data row
    expect(allLines[0]).toBe('"name","age","city"');
    expect(allLines[1]).toBe('"Alice","30","Bangkok"');
  });

  it("handles values containing both commas and quotes", () => {
    const result = generateCsv([{ value: 'He said, "Hello"' }]);
    const csv = result.slice(1);
    expect(csv).toBe('"value"\n"He said, ""Hello"""');
  });
});

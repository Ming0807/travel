import "server-only";
import ExcelJS from "exceljs";
import { neutralizeFormulaValue } from "./csv";

/**
 * Converts an array of flat row objects into an XLSX workbook Buffer.
 * - Styled header row (bold white text on brand teal background)
 * - Auto-fitted column widths (capped at 60)
 * - Empty/null/undefined values rendered as empty cells
 * - Objects serialized to JSON strings
 */
export async function generateXlsx(
  data: Array<Record<string, unknown>>
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Southern Border Tourism Platform";
  workbook.created = new Date();

  if (!data || data.length === 0) {
    const worksheet = workbook.addWorksheet("Empty Export");
    // Return a minimal valid workbook with a single empty row
    worksheet.columns = [{ header: "No data available", key: "message", width: 25 }];
    worksheet.addRow([""]);
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0A6B62" },
    };
    const uint8arr = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8arr);
  }

  const worksheet = workbook.addWorksheet("Export");

  const headers = Object.keys(data[0]);

  // Define columns with initial width guess
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.max(Math.ceil(header.length * 1.3), 14),
  }));

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0A6B62" }, // brand dark teal
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Map data rows into flat arrays matching column order
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      if (typeof val === "string") return neutralizeFormulaValue(val);
      if (typeof val === "object") {
        return neutralizeFormulaValue(JSON.stringify(val));
      }
      return String(val);
    })
  );
  worksheet.addRows(rows);

  // Auto-fit column widths based on actual content (header + data)
  worksheet.columns.forEach((column, colIndex) => {
    let maxLength = column.header ? column.header.length : 14;
    rows.forEach((row) => {
      const cellValue = row[colIndex];
      if (cellValue) {
        const length = String(cellValue).length;
        if (length > maxLength) {
          maxLength = length;
        }
      }
    });
    column.width = Math.min(Math.max(Math.ceil(maxLength * 1.15) + 2, 14), 60);
  });

  // Set row heights
  headerRow.height = 24;
  for (let i = 2; i <= rows.length + 1; i++) {
    worksheet.getRow(i).height = 20;
  }

  const uint8arr = await workbook.xlsx.writeBuffer();
  return Buffer.from(uint8arr);
}

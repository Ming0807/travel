import { NextResponse } from "next/server";
import { generateCsv } from "./csv";
import { generateXlsx } from "./excel";

export type ExportFormat = "csv" | "xlsx";

/**
 * Parses the raw `format` query parameter value into an ExportFormat.
 * Defaults to `"csv"` for unknown or missing values.
 */
export function parseExportFormat(raw: string | null): ExportFormat {
  if (raw === "xlsx") return "xlsx";
  return "csv";
}

export function parseRequestedExportFormat(raw: string | null): ExportFormat | null {
  if (raw === null || raw === "" || raw === "csv") return "csv";
  if (raw === "xlsx") return "xlsx";
  return null;
}

/**
 * Returns the appropriate file extension for the given export format.
 */
export function exportExtension(format: ExportFormat): string {
  return format === "xlsx" ? ".xlsx" : ".csv";
}

/**
 * Builds a full filename with the correct extension.
 * If the base filename already has an extension, it is replaced.
 */
export function exportFilename(base: string, format: ExportFormat): string {
  const ext = exportExtension(format);
  // Strip any existing extension
  const clean = base.replace(/\.(csv|xlsx)$/i, "");
  return `${clean}${ext}`;
}

/**
 * Creates a NextResponse for either CSV or XLSX export.
 *
 * @param rows - Array of flat row objects to export
 * @param baseFilename - Base filename without extension (e.g. `"attractions_export_2026-05-28"`)
 * @param format - Export format: `"csv"` or `"xlsx"`
 */
export async function createExportResponse(
  rows: Array<Record<string, unknown>>,
  baseFilename: string,
  format: ExportFormat
): Promise<NextResponse> {
  const filename = exportFilename(baseFilename, format);

  if (format === "xlsx") {
    const buffer = await generateXlsx(rows);
    // Convert Buffer to Uint8Array to satisfy Next.js BodyInit types
    const body = new Uint8Array(buffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const csvData = generateCsv(rows);
  return new NextResponse(csvData, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

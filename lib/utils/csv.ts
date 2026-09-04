/**
 * Converts an array of objects to a CSV string.
 * Automatically adds a UTF-8 BOM so Excel opens Thai characters correctly.
 */
export function generateCsv(data: Array<Record<string, unknown>>): string {
  if (!data || data.length === 0) return "";

  const headers = collectExportHeaders(data);
  
  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    // Numbers are never formula injection risks; avoid breaking legitimate negative values
    const str = typeof val === 'number' ? String(val) : neutralizeFormulaValue(String(val));
    // Always wrap in quotes to be safe and handle commas/newlines
    // Escape existing quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerRow = headers.map(escapeCsv).join(",");
  const bodyRows = data.map(row => 
    headers.map(header => escapeCsv(row[header])).join(",")
  );

  // \uFEFF is the UTF-8 Byte Order Mark (BOM)
  const bom = "\uFEFF";
  return bom + [headerRow, ...bodyRows].join("\n");
}

export function collectExportHeaders(data: Array<Record<string, unknown>>): string[] {
  const seen = new Set<string>();
  const headers: string[] = [];
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (seen.has(key)) return;
      seen.add(key);
      headers.push(key);
    });
  });
  return headers;
}

export function neutralizeFormulaValue(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

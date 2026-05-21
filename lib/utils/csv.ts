/**
 * Converts an array of objects to a CSV string.
 * Automatically adds a UTF-8 BOM so Excel opens Thai characters correctly.
 */
export function generateCsv(data: Array<Record<string, unknown>>): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  
  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = neutralizeFormulaValue(String(val));
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

export function neutralizeFormulaValue(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

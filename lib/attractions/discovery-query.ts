type AttractionTypeRow = {
  type_name_en: string;
  type_name_th: string;
};

export type AttractionTypeOption = {
  value: string;
  label: string;
};

export function resolveAttractionTypeOptions(
  rows: AttractionTypeRow[],
  error: unknown,
): AttractionTypeOption[] {
  if (error) {
    throw new Error("PUBLIC_ATTRACTION_TYPES_FAILED");
  }

  return rows.map((row) => ({
    value: row.type_name_en,
    label: row.type_name_th,
  }));
}

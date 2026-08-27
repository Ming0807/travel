export type AdminMediaAssetClientRow = Record<string, unknown> & {
  id: string;
  storage_path: string;
  thumbnail_storage_path: string | null;
};

function normalizeMediaId(value: unknown): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === "string") {
    const normalized = value.trim();
    if (/^\d+$/.test(normalized) && Number(normalized) > 0) {
      return String(Number(normalized));
    }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
      return normalized;
    }
  }
  return "";
}

export function normalizeAdminMediaAssetForClient(asset: unknown): AdminMediaAssetClientRow {
  const record = asset && typeof asset === "object"
    ? asset as Record<string, unknown>
    : {};
  const id = normalizeMediaId(record.id) || normalizeMediaId(record.media_id);

  return {
    ...record,
    id,
    storage_path: typeof record.storage_path === "string" ? record.storage_path : "",
    thumbnail_storage_path:
      typeof record.thumbnail_storage_path === "string"
        ? record.thumbnail_storage_path
        : null,
  };
}

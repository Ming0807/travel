export const ADMIN_USERNAME_EMAIL_DOMAIN = "admin.local";

export function normalizeAdminLoginIdentifier(value: FormDataEntryValue | string | null | undefined) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!raw || raw.includes("@")) {
    return raw;
  }

  return `${raw}@${ADMIN_USERNAME_EMAIL_DOMAIN}`;
}

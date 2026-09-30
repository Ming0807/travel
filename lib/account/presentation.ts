type AccountIdentity = {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

/** Presentation only; account metadata is never used to authorize access. */
export function getAccountDisplayName(account: AccountIdentity): string {
  const metadata = account.user_metadata;
  const name = [metadata?.display_name, metadata?.full_name, metadata?.name]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return name?.trim() || account.email?.split("@")[0] || "นักเดินทาง";
}

export function getDisplayInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "น";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toLocaleUpperCase();
}

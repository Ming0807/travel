export type CheckinEntryConfig = {
  sessionsEnabled: boolean;
  nfcEnabled: boolean;
  hashSecret: string | null;
};

function strictBoolean(source: Record<string, string | undefined>, key: string): boolean {
  const value = source[key];
  if (value === undefined || value === "" || value === "false") return false;
  if (value === "true") return true;
  throw new Error(`${key} must be exactly true or false`);
}

export function parseCheckinEntryConfig(source: Record<string, string | undefined>): CheckinEntryConfig {
  const sessionsEnabled = strictBoolean(source, "CHECKIN_ENTRY_SESSIONS_ENABLED");
  const nfcEnabled = strictBoolean(source, "NFC_CHECKIN_ENABLED");
  if (nfcEnabled && !sessionsEnabled) {
    throw new Error("NFC_CHECKIN_ENABLED requires CHECKIN_ENTRY_SESSIONS_ENABLED=true");
  }
  const hashSecret = source.CHECKIN_ENTRY_HASH_SECRET?.trim() || null;
  if (sessionsEnabled && (!hashSecret || hashSecret.length < 32)) {
    throw new Error("CHECKIN_ENTRY_HASH_SECRET must contain at least 32 characters when entry sessions are enabled");
  }
  return { sessionsEnabled, nfcEnabled, hashSecret };
}

export function getCheckinEntryConfig(): CheckinEntryConfig {
  return parseCheckinEntryConfig(process.env);
}

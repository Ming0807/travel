const MIGRATION_PATTERN = /^(\d{14})_([a-z0-9][a-z0-9_]*)\.sql$/i;

export function parseMigrationFilename(file) {
  const match = MIGRATION_PATTERN.exec(file);
  if (!match) return null;
  return { version: match[1], name: match[2], file };
}

export function compareMigrationStates(localFiles, remoteRows) {
  const invalidFiles = [];
  const parsedLocal = [];

  for (const file of localFiles) {
    const parsed = parseMigrationFilename(file);
    if (parsed) parsedLocal.push(parsed);
    else invalidFiles.push(file);
  }

  const filesByVersion = new Map();
  for (const migration of parsedLocal) {
    const files = filesByVersion.get(migration.version) || [];
    files.push(migration.file);
    filesByVersion.set(migration.version, files);
  }

  const duplicateVersions = [...filesByVersion.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([version, files]) => ({ version, files: [...files].sort() }))
    .sort((a, b) => a.version.localeCompare(b.version));

  const normalizedRemote = remoteRows
    .map((row) => ({ version: String(row.version), name: row.name == null ? null : String(row.name) }))
    .sort((a, b) => a.version.localeCompare(b.version));
  const remoteByVersion = new Map(normalizedRemote.map((row) => [row.version, row]));
  const localByVersion = new Map(parsedLocal.map((row) => [row.version, row]));

  const applied = parsedLocal
    .filter((migration) => remoteByVersion.has(migration.version))
    .sort((a, b) => a.version.localeCompare(b.version));
  const pending = parsedLocal
    .filter((migration) => !remoteByVersion.has(migration.version))
    .sort((a, b) => a.version.localeCompare(b.version));
  const remoteOnly = normalizedRemote.filter((migration) => !localByVersion.has(migration.version));
  const nameMismatches = applied
    .filter((migration) => {
      const remoteName = remoteByVersion.get(migration.version)?.name;
      return remoteName && remoteName !== migration.name;
    })
    .map((migration) => ({
      version: migration.version,
      localName: migration.name,
      remoteName: remoteByVersion.get(migration.version)?.name,
    }));

  return {
    applied,
    pending,
    remoteOnly,
    invalidFiles: invalidFiles.sort(),
    duplicateVersions,
    nameMismatches,
    isSynchronized:
      pending.length === 0 &&
      remoteOnly.length === 0 &&
      invalidFiles.length === 0 &&
      duplicateVersions.length === 0 &&
      nameMismatches.length === 0,
  };
}

export function migrationConnectionHint(code) {
  switch (code) {
    case "ENOTFOUND":
      return "The database hostname could not be resolved. If the direct Supabase host is IPv6-only, copy the Session Pooler URL from Supabase Connect.";
    case "SELF_SIGNED_CERT_IN_CHAIN":
      return "The TLS certificate chain is not trusted on this machine. Use the exact SSL parameters supplied by Supabase or install the project CA; do not disable TLS.";
    case "28P01":
      return "Database authentication failed. Re-copy the connection string and password from Supabase Connect.";
    case "XX000":
      return "The pooler rejected the tenant or connection settings. Do not guess the region or username; copy the Session Pooler URL from Supabase Connect.";
    case "42P01":
    case "3F000":
      return "Supabase migration history is unavailable. Verify that the URL points to the intended project and that migration tracking exists.";
    default:
      return "Verify SUPABASE_DATABASE_URL with the Session Pooler value from Supabase Connect.";
  }
}

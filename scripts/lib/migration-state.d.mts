export type LocalMigration = { version: string; name: string; file: string };
export type RemoteMigration = { version: string | number; name?: string | null };

export function parseMigrationFilename(file: string): LocalMigration | null;
export function compareMigrationStates(
  localFiles: string[],
  remoteRows: RemoteMigration[],
): {
  applied: LocalMigration[];
  pending: LocalMigration[];
  remoteOnly: Array<{ version: string; name: string | null }>;
  invalidFiles: string[];
  duplicateVersions: Array<{ version: string; files: string[] }>;
  nameMismatches: Array<{ version: string; localName: string; remoteName: string | null | undefined }>;
  isSynchronized: boolean;
};
export function migrationConnectionHint(code: string): string;

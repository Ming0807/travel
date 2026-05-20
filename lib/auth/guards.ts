import "server-only";

export type PermissionKey =
  | "dashboard.read"
  | "attraction.read"
  | "attraction.manage"
  | "checkin_code.manage"
  | "export.summary"
  | "export.detailed"
  | "user.manage";

export type GuardResult = {
  actorId: string;
  permissions: PermissionKey[];
};

export async function requireAdmin(): Promise<GuardResult> {
  throw new Error("Admin authentication is planned for Phase 03 and is not implemented in Phase 01.");
}

export async function requirePermission(_permission: PermissionKey): Promise<GuardResult> {
  void _permission;
  throw new Error("Permission guards are planned for Phase 03 and are not implemented in Phase 01.");
}

export async function requireTouristOwnership(_resourceId: string): Promise<void> {
  void _resourceId;
  throw new Error("Tourist ownership guards are planned for the tourist flow phases.");
}

import "server-only";

import { getGuestIdentity } from "@/lib/auth/guest";
import { findTouristByIdentity } from "@/lib/repositories/tourist.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { redirect } from "next/navigation";

export type PermissionKey =
  | "dashboard.read"
  | "dashboard.sensitive_view"
  | "dashboard.system_metrics"
  | "attraction.read"
  | "attraction.create"
  | "attraction.update"
  | "attraction.publish"
  | "attraction.unpublish"
  | "attraction.deactivate"
  | "attraction.delete"
  | "attraction.manage"
  | "photo_spot.read"
  | "photo_spot.create"
  | "photo_spot.update"
  | "photo_spot.deactivate"
  | "photo_spot.delete"
  | "checkin_code.read"
  | "checkin_code.create"
  | "checkin_code.update"
  | "checkin_code.deactivate"
  | "checkin_code.delete"
  | "checkin_code.download_qr"
  | "checkin_code.manage"
  | "media.read"
  | "media.upload"
  | "media.update"
  | "media.deactivate"
  | "media.delete"
  | "story.read"
  | "story.create"
  | "story.update"
  | "story.publish"
  | "story.unpublish"
  | "story.delete"
  | "story.manage"
  | "story.publish"
  | "story.unpublish"
  | "route.read"
  | "route.create"
  | "route.update"
  | "route.delete"
  | "route.manage"
  | "route.publish"
  | "route.unpublish"
  | "route.activate"
  | "route.deactivate"
  | "visit.read"
  | "visit.detail"
  | "visit.update"
  | "visit.sensitive_view"
  | "tourist.read"
  | "tourist.detail"
  | "tourist.sensitive_view"
  | "tourist.anonymize"
  | "tourist.delete"
  | "tourist.identity_read"
  | "survey.read"
  | "survey.detail"
  | "survey.comment_read"
  | "survey.export"
  | "survey.delete"
  | "certificate.read"
  | "certificate.detail"
  | "certificate.revoke"
  | "certificate.regenerate"
  | "certificate.template_manage"
  | "stamp.read"
  | "stamp.definition_manage"
  | "stamp.revoke"
  | "stamp.award_manual"
  | "export.summary"
  | "export.detailed"
  | "export.create"
  | "export.visit_records"
  | "export.tourist_summary"
  | "export.expense_data"
  | "export.survey_data"
  | "export.funnel_data"
  | "export.dashboard_summary"
  | "export.comments"
  | "export.personal_data"
  | "official_data.read"
  | "official_data.import"
  | "official_data.update"
  | "official_data.delete"
  | "official_data.link_attraction"
  | "audit.read"
  | "audit.export"
  | "user.read"
  | "user.create"
  | "user.update"
  | "user.deactivate"
  | "user.manage"
  | "user.manage_roles"
  | "role.read"
  | "role.create"
  | "role.update"
  | "role.delete"
  | "role.manage"
  | "permission.read"
  | "permission.manage"
  | "system.settings_read"
  | "system.settings_update"
  | "system.job_run"
  | "system.job_read"
  | "system.maintenance"
  | "system.all";

export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  "dashboard.read",
  "dashboard.sensitive_view",
  "dashboard.system_metrics",
  "attraction.read",
  "attraction.create",
  "attraction.update",
  "attraction.publish",
  "attraction.unpublish",
  "attraction.deactivate",
  "attraction.delete",
  "attraction.manage",
  "photo_spot.read",
  "photo_spot.create",
  "photo_spot.update",
  "photo_spot.deactivate",
  "photo_spot.delete",
  "checkin_code.read",
  "checkin_code.create",
  "checkin_code.update",
  "checkin_code.deactivate",
  "checkin_code.delete",
  "checkin_code.download_qr",
  "checkin_code.manage",
  "media.read",
  "media.upload",
  "media.update",
  "media.deactivate",
  "media.delete",
  "story.read",
  "story.create",
  "story.update",
  "story.publish",
  "story.unpublish",
  "story.delete",
  "story.manage",
  "route.read",
  "route.create",
  "route.update",
  "route.delete",
  "route.manage",
  "route.publish",
  "route.unpublish",
  "route.activate",
  "route.deactivate",
  "visit.read",
  "visit.detail",
  "visit.update",
  "visit.sensitive_view",
  "tourist.read",
  "tourist.detail",
  "tourist.sensitive_view",
  "tourist.anonymize",
  "tourist.delete",
  "tourist.identity_read",
  "survey.read",
  "survey.detail",
  "survey.comment_read",
  "survey.export",
  "survey.delete",
  "certificate.read",
  "certificate.detail",
  "certificate.revoke",
  "certificate.regenerate",
  "certificate.template_manage",
  "stamp.read",
  "stamp.definition_manage",
  "stamp.revoke",
  "stamp.award_manual",
  "export.summary",
  "export.detailed",
  "export.create",
  "export.visit_records",
  "export.tourist_summary",
  "export.expense_data",
  "export.survey_data",
  "export.funnel_data",
  "export.dashboard_summary",
  "export.comments",
  "export.personal_data",
  "official_data.read",
  "official_data.import",
  "official_data.update",
  "official_data.delete",
  "official_data.link_attraction",
  "audit.read",
  "audit.export",
  "user.read",
  "user.create",
  "user.update",
  "user.deactivate",
  "user.manage",
  "user.manage_roles",
  "role.read",
  "role.create",
  "role.update",
  "role.delete",
  "role.manage",
  "permission.read",
  "permission.manage",
  "system.settings_read",
  "system.settings_update",
  "system.job_run",
  "system.job_read",
  "system.maintenance",
  "system.all"
];

const CONTENT_ADMIN_PERMISSIONS: PermissionKey[] = [
  "dashboard.read",
  "attraction.read",
  "attraction.create",
  "attraction.update",
  "attraction.publish",
  "attraction.unpublish",
  "attraction.deactivate",
  "photo_spot.read",
  "photo_spot.create",
  "photo_spot.update",
  "photo_spot.deactivate",
  "checkin_code.read",
  "checkin_code.create",
  "checkin_code.update",
  "checkin_code.deactivate",
  "checkin_code.download_qr",
  "media.read",
  "media.upload",
  "media.update",
  "media.deactivate",
  "story.read",
  "story.create",
  "story.update",
  "story.publish",
  "story.unpublish",
  "route.read",
  "route.create",
  "route.update",
  "route.publish",
  "route.unpublish",
  "route.activate",
  "route.deactivate",
  "visit.read",
  "visit.detail",
  "survey.read",
  "survey.detail",
  "certificate.read",
  "stamp.read",
  "export.summary",
  "export.create",
  "export.visit_records",
  "export.expense_data",
  "export.survey_data",
  "export.funnel_data"
];

const VIEWER_PERMISSIONS: PermissionKey[] = [
  "dashboard.read",
  "attraction.read",
  "photo_spot.read",
  "checkin_code.read",
  "media.read",
  "story.read",
  "route.read",
  "visit.read",
  "survey.read",
  "stamp.read"
];

const LEGACY_PERMISSION_EXPANSIONS: Record<string, PermissionKey[]> = {
  "attraction.manage": [
    "attraction.read",
    "attraction.create",
    "attraction.update",
    "attraction.publish",
    "attraction.unpublish",
    "attraction.deactivate",
    "photo_spot.read",
    "photo_spot.create",
    "photo_spot.update",
    "photo_spot.deactivate",
    "media.read",
    "media.upload",
    "media.update",
    "media.deactivate"
  ],
  "checkin_code.manage": [
    "checkin_code.read",
    "checkin_code.create",
    "checkin_code.update",
    "checkin_code.deactivate",
    "checkin_code.download_qr"
  ],
  "story.manage": [
    "story.read",
    "story.create",
    "story.update",
    "story.publish",
    "story.unpublish",
    "story.delete"
  ],
  "route.manage": [
    "route.read",
    "route.create",
    "route.update",
    "route.delete"
  ],
  "export.detailed": [
    "export.create",
    "export.visit_records",
    "export.expense_data",
    "export.survey_data",
    "export.funnel_data"
  ],
  "user.manage": ["user.read", "user.create", "user.update", "user.deactivate", "user.manage_roles"],
  "role.manage": ["role.read", "role.create", "role.update", "role.delete", "permission.read", "permission.manage"]
};

export type AdminActor = {
  adminId: string;
  authUserId: string;
  email: string;
  displayName: string | null;
  roleNames: string[];
  permissions: PermissionKey[];
};

export type GuardResult = {
  actorId: string;
  adminId: string;
  authUserId: string;
  email: string;
  displayName: string | null;
  roleNames: string[];
  permissions: PermissionKey[];
  actor: AdminActor;
};

export type AdminAuthErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "ADMIN_INACTIVE";

export class AdminAuthError extends Error {
  constructor(
    public readonly code: AdminAuthErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

function toPermissionKey(value: string): PermissionKey | null {
  return (ALL_PERMISSION_KEYS as string[]).includes(value) ? (value as PermissionKey) : null;
}

function buildPermissionSet(roleNames: string[], rawPermissionNames: string[]) {
  const permissions = new Set<PermissionKey>();

  for (const roleName of roleNames) {
    if (roleName === "super_admin") {
      ALL_PERMISSION_KEYS.forEach((permission) => permissions.add(permission));
    }
    if (roleName === "admin" || roleName === "province_admin" || roleName === "attraction_manager") {
      CONTENT_ADMIN_PERMISSIONS.forEach((permission) => permissions.add(permission));
    }
    if (roleName === "viewer") {
      VIEWER_PERMISSIONS.forEach((permission) => permissions.add(permission));
    }
  }

  for (const rawPermissionName of rawPermissionNames) {
    const permission = toPermissionKey(rawPermissionName);
    if (permission) {
      permissions.add(permission);
    }

    for (const expanded of LEGACY_PERMISSION_EXPANSIONS[rawPermissionName] ?? []) {
      permissions.add(expanded);
    }
  }

  return Array.from(permissions);
}

function toGuardResult(actor: AdminActor): GuardResult {
  return {
    actorId: actor.adminId,
    adminId: actor.adminId,
    authUserId: actor.authUserId,
    email: actor.email,
    displayName: actor.displayName,
    roleNames: actor.roleNames,
    permissions: actor.permissions,
    actor
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRolesAndPermissions(adminRow: any) {
  const roleNames = new Set<string>();
  const rawPermissionNames = new Set<string>();

  for (const adminUserRole of adminRow.admin_user_roles ?? []) {
    const role = Array.isArray(adminUserRole.roles) ? adminUserRole.roles[0] : adminUserRole.roles;
    if (!role || role.is_active === false) continue;

    if (typeof role.role_name === "string") {
      roleNames.add(role.role_name);
    }

    for (const rolePermission of role.role_permissions ?? []) {
      const permission = Array.isArray(rolePermission.permissions)
        ? rolePermission.permissions[0]
        : rolePermission.permissions;
      if (typeof permission?.permission_name === "string") {
        rawPermissionNames.add(permission.permission_name);
      }
    }
  }

  return {
    roleNames: Array.from(roleNames),
    rawPermissionNames: Array.from(rawPermissionNames)
  };
}

async function findAdminUser(authUserId: string, email: string | null | undefined) {
  const supabase = createSupabaseServiceRoleClient();
  const select = `
    admin_id,
    auth_user_id,
    email,
    display_name,
    is_active,
    admin_user_roles (
      roles (
        role_name,
        is_active,
        role_permissions (
          permissions (
            permission_name
          )
        )
      )
    )
  `;

  const byAuthUserId = await supabase
    .from("admin_users")
    .select(select)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (byAuthUserId.error) {
    throw new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  if (byAuthUserId.data) {
    return byAuthUserId.data;
  }

  if (!email) {
    return null;
  }

  const byEmail = await supabase
    .from("admin_users")
    .select(select)
    .eq("email", email)
    .maybeSingle();

  if (byEmail.error) {
    throw new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  return byEmail.data;
}

export async function requireAdmin(): Promise<GuardResult> {
  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await authClient.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const adminRow = await findAdminUser(user.id, user.email);

  if (!adminRow) {
    throw new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  if (adminRow.is_active === false) {
    throw new AdminAuthError("ADMIN_INACTIVE", "Your admin account is inactive. Please contact the system administrator.");
  }

  const { roleNames, rawPermissionNames } = extractRolesAndPermissions(adminRow);
  const actor: AdminActor = {
    adminId: adminRow.admin_id,
    authUserId: user.id,
    email: adminRow.email,
    displayName: adminRow.display_name,
    roleNames,
    permissions: buildPermissionSet(roleNames, rawPermissionNames)
  };

  return toGuardResult(actor);
}

export function hasPermission(actor: Pick<AdminActor, "permissions">, permission: PermissionKey) {
  return actor.permissions.includes("system.all") || actor.permissions.includes(permission);
}

export async function requirePermission(permission: PermissionKey): Promise<GuardResult> {
  const result = await requireAdmin();

  if (!hasPermission(result.actor, permission)) {
    throw new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  return result;
}

export async function requireAnyPermission(permissions: PermissionKey[]): Promise<GuardResult> {
  const result = await requireAdmin();

  if (!permissions.some((permission) => hasPermission(result.actor, permission))) {
    throw new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  return result;
}

export async function requireAllPermissions(permissions: PermissionKey[]): Promise<GuardResult> {
  const result = await requireAdmin();

  if (!permissions.every((permission) => hasPermission(result.actor, permission))) {
    throw new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.");
  }

  return result;
}

export async function requireTouristOwnership(_resourceId: string): Promise<void> {
  void _resourceId;
  throw new Error("Tourist ownership guards are planned for the tourist flow phases.");
}

export type TouristAccessErrorCode =
  | "TOURIST_IDENTITY_NOT_FOUND"
  | "VISIT_NOT_FOUND"
  | "VISIT_ACCESS_DENIED";

export class TouristAccessError extends Error {
  constructor(
    public readonly code: TouristAccessErrorCode,
    message: string
  ) {
    super(message);
    this.name = "TouristAccessError";
  }
}

export async function resolveCurrentTouristId(): Promise<string> {
  const guestToken = await getGuestIdentity();

  if (!guestToken) {
    throw new TouristAccessError("TOURIST_IDENTITY_NOT_FOUND", "ไม่พบข้อมูลพาสปอร์ต");
  }

  const touristId = await findTouristByIdentity("anonymous_device", guestToken);

  if (!touristId) {
    throw new TouristAccessError("TOURIST_IDENTITY_NOT_FOUND", "ไม่พบข้อมูลพาสปอร์ต");
  }

  return touristId;
}

export async function requireTouristVisitAccess(visitId: string) {
  const touristId = await resolveCurrentTouristId();
  const visit = await getVisitById(visitId);

  if (!visit) {
    throw new TouristAccessError("VISIT_NOT_FOUND", "ไม่พบข้อมูลการเข้าชมนี้");
  }

  if (visit.tourist_id !== touristId) {
    throw new TouristAccessError("VISIT_ACCESS_DENIED", "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }

  return { touristId, visit };
}

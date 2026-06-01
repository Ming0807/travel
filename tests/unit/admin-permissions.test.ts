import { describe, expect, it } from "vitest";
import { hasPermission, ALL_PERMISSION_KEYS, type PermissionKey, type AdminActor } from "@/lib/auth/guards";
import { isSiteSettingKey, SITE_SETTING_KEYS, SITE_SETTING_DEFAULTS } from "@/lib/config/site-settings";

// =========================================
// hasPermission Tests
// =========================================
describe("hasPermission", () => {
  const createActor = (permissions: PermissionKey[]): Pick<AdminActor, "permissions"> => ({
    permissions,
  });

  it("permits access when user has the exact permission", () => {
    const actor = createActor(["attraction.create"]);
    expect(hasPermission(actor, "attraction.create")).toBe(true);
  });

  it("denies access when user lacks the permission", () => {
    const actor = createActor(["attraction.read"]);
    expect(hasPermission(actor, "attraction.create")).toBe(false);
  });

  it("permits access when user has system.all (super_admin)", () => {
    const actor = createActor(["system.all"]);
    expect(hasPermission(actor, "attraction.delete")).toBe(true);
    expect(hasPermission(actor, "user.manage")).toBe(true);
    expect(hasPermission(actor, "system.settings_update")).toBe(true);
    expect(hasPermission(actor, "audit.export")).toBe(true);
  });

  it("denies access for empty permissions list", () => {
    const actor = createActor([]);
    expect(hasPermission(actor, "dashboard.read")).toBe(false);
  });

  it("allows any permission from ALL_PERMISSION_KEYS when system.all present", () => {
    const actor = createActor(["system.all"]);
    for (const permission of ALL_PERMISSION_KEYS) {
      expect(hasPermission(actor, permission)).toBe(true);
    }
  });

  it("permits any cast PermissionKey when user has system.all (by design)", () => {
    const actor = createActor(["system.all"]);
    // system.all grants unrestricted access — even non-standard PermissionKey values pass
    expect(hasPermission(actor, "nonexistent" as PermissionKey)).toBe(true);
  });
});

// =========================================
// ALL_PERMISSION_KEYS Completeness
// =========================================
describe("ALL_PERMISSION_KEYS", () => {
  it("contains all expected permission categories", () => {
    const categories = [
      "dashboard",
      "attraction",
      "photo_spot",
      "checkin_code",
      "media",
      "story",
      "route",
      "restaurant",
      "review",
      "badge",
      "leaderboard",
      "visit",
      "tourist",
      "survey",
      "certificate",
      "stamp",
      "export",
      "official_data",
      "audit",
      "user",
      "role",
      "permission",
      "system",
    ];

    // Each category should have at least one permission in the list
    for (const category of categories) {
      const hasCategory = ALL_PERMISSION_KEYS.some(
        (key) => key.startsWith(`${category}.`)
      );
      expect(
        hasCategory,
        `Expected category "${category}" to have at least one permission in ALL_PERMISSION_KEYS`
      ).toBe(true);
    }
  });

  it("contains no duplicate keys", () => {
    const uniqueKeys = new Set(ALL_PERMISSION_KEYS);
    expect(uniqueKeys.size).toBe(ALL_PERMISSION_KEYS.length);
  });

  it("contains no empty strings", () => {
    expect(ALL_PERMISSION_KEYS.every((key) => key.length > 0)).toBe(true);
  });

  it("contains the expected number of permissions (baseline check)", () => {
    expect(ALL_PERMISSION_KEYS.length).toBeGreaterThan(50);
  });
});

// =========================================
// isSiteSettingKey Tests
// =========================================
describe("isSiteSettingKey", () => {
  it("returns true for valid known setting keys", () => {
    expect(isSiteSettingKey("homepage_hero")).toBe(true);
    expect(isSiteSettingKey("seo_settings")).toBe(true);
    expect(isSiteSettingKey("feature_toggles")).toBe(true);
    expect(isSiteSettingKey("maintenance_info")).toBe(true);
    expect(isSiteSettingKey("footer_info")).toBe(true);
    expect(isSiteSettingKey("general_info")).toBe(true);
    expect(isSiteSettingKey("social_media")).toBe(true);
    expect(isSiteSettingKey("homepage_featured_attractions")).toBe(true);
  });

  it("returns false for unknown setting keys", () => {
    expect(isSiteSettingKey("attraction_settings")).toBe(false);
    expect(isSiteSettingKey("stripe_api_key")).toBe(false);
    expect(isSiteSettingKey("custom_theme")).toBe(false);
    expect(isSiteSettingKey("")).toBe(false);
    expect(isSiteSettingKey("homepage")).toBe(false); // partial match is not enough
  });

  it("returns false for nullish values", () => {
    expect(isSiteSettingKey(null as unknown as string)).toBe(false);
    expect(isSiteSettingKey(undefined as unknown as string)).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isSiteSettingKey("SEO_SETTINGS")).toBe(false);
    expect(isSiteSettingKey("Homepage_Hero")).toBe(false);
  });

  it("SITE_SETTING_KEYS matches SITE_SETTING_DEFAULTS keys", () => {
    const defaultKeys = Object.keys(SITE_SETTING_DEFAULTS);
    expect(SITE_SETTING_KEYS.sort()).toEqual(defaultKeys.sort());
  });

  it("rejects keys with extra suffix", () => {
    expect(isSiteSettingKey("homepage_hero_extra")).toBe(false);
    expect(isSiteSettingKey("seo_settings_backup")).toBe(false);
  });
});

// =========================================
// Permission Denial Validation
// =========================================
describe("Permission denial patterns (simulated)", () => {
  it("hasPermission correctly denies CRUD permissions without specific or system.all", () => {
    const viewer = {
      permissions: [
        "dashboard.read" as PermissionKey,
        "attraction.read" as PermissionKey,
        "media.read" as PermissionKey,
        "visit.read" as PermissionKey,
        "survey.read" as PermissionKey,
      ],
    };

    // Viewer should have read
    expect(hasPermission(viewer, "attraction.read")).toBe(true);
    expect(hasPermission(viewer, "media.read")).toBe(true);

    // Viewer should NOT have write operations
    expect(hasPermission(viewer, "attraction.create")).toBe(false);
    expect(hasPermission(viewer, "attraction.update")).toBe(false);
    expect(hasPermission(viewer, "attraction.publish")).toBe(false);
    expect(hasPermission(viewer, "media.upload")).toBe(false);
    expect(hasPermission(viewer, "media.update")).toBe(false);
    expect(hasPermission(viewer, "media.activate")).toBe(false);

    // Viewer should NOT have admin operations
    expect(hasPermission(viewer, "user.manage")).toBe(false);
    expect(hasPermission(viewer, "role.manage")).toBe(false);
    expect(hasPermission(viewer, "system.settings_update")).toBe(false);
  });

  it("hasPermission correctly permits for content admin permissions", () => {
    const contentAdmin = {
      permissions: [
        "dashboard.read" as PermissionKey,
        "attraction.read" as PermissionKey,
        "attraction.create" as PermissionKey,
        "attraction.update" as PermissionKey,
        "attraction.publish" as PermissionKey,
        "media.upload" as PermissionKey,
        "media.activate" as PermissionKey,
        "story.create" as PermissionKey,
        "route.create" as PermissionKey,
      ],
    };

    expect(hasPermission(contentAdmin, "attraction.create")).toBe(true);
    expect(hasPermission(contentAdmin, "attraction.publish")).toBe(true);
    expect(hasPermission(contentAdmin, "media.upload")).toBe(true);
    expect(hasPermission(contentAdmin, "media.activate")).toBe(true);

    // Content admin should NOT have admin/management permissions
    expect(hasPermission(contentAdmin, "user.manage")).toBe(false);
    expect(hasPermission(contentAdmin, "system.settings_update")).toBe(false);
    expect(hasPermission(contentAdmin, "audit.export")).toBe(false);
  });
});

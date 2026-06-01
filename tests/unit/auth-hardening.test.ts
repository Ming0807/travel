import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  decodeJwtPayload,
  isSessionExpired,
  isSessionExpiringSoon,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  ADMIN_SESSION_REFRESH_WINDOW_SECONDS,
} from "@/lib/auth/session-config";
import { rateLimit } from "@/lib/utils/rate-limit";
import { hasPermission, ALL_PERMISSION_KEYS, type PermissionKey } from "@/lib/auth/guards";

// =========================================
// session-config Tests
// =========================================
describe("session-config", () => {
  describe("decodeJwtPayload", () => {
    const mockHeader = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
    const mockPayload = Buffer.from(
      JSON.stringify({ sub: "user123", exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString("base64url");
    const mockSignature = "fakesignature";

    it("decodes a valid JWT and returns the payload", () => {
      const token = `${mockHeader}.${mockPayload}.${mockSignature}`;
      const result = decodeJwtPayload(token);
      expect(result).not.toBeNull();
      expect(result?.sub).toBe("user123");
      expect(typeof result?.exp).toBe("number");
    });

    it("returns null for malformed token (fewer than 3 parts)", () => {
      expect(decodeJwtPayload("header.payload")).toBeNull();
    });

    it("returns null for token with empty parts", () => {
      expect(decodeJwtPayload("..")).toBeNull();
    });

    it("returns null for invalid base64 payload", () => {
      const token = "header.!!!invalid!!!.signature";
      expect(decodeJwtPayload(token)).toBeNull();
    });

    it("returns null for non-JSON payload", () => {
      const badPayload = Buffer.from("not-json").toString("base64url");
      const token = `${mockHeader}.${badPayload}.${mockSignature}`;
      expect(decodeJwtPayload(token)).toBeNull();
    });

    it("handles expected Supabase JWT structure", () => {
      // Supabase access tokens typically include aud, role, sub, email, exp, etc.
      const supabasePayload = Buffer.from(
        JSON.stringify({
          aud: "authenticated",
          role: "authenticated",
          sub: "abc-123-def",
          email: "admin@example.com",
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_metadata: {},
        })
      ).toString("base64url");
      const token = `${mockHeader}.${supabasePayload}.${mockSignature}`;
      const result = decodeJwtPayload(token);
      expect(result?.aud).toBe("authenticated");
      expect(result?.email).toBe("admin@example.com");
    });
  });

  describe("isSessionExpired", () => {
    it("returns true when exp is in the past", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      expect(isSessionExpired(pastExp)).toBe(true);
    });

    it("returns false when exp is in the future", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      expect(isSessionExpired(futureExp)).toBe(false);
    });

    it("returns true when exp is exactly now", () => {
      const nowExp = Math.floor(Date.now() / 1000);
      // Allow 1s tolerance since Date.now() can change between calls
      expect(isSessionExpired(nowExp)).toBe(true);
    });
  });

  describe("isSessionExpiringSoon", () => {
    it("returns true when exp is within refresh window", () => {
      // Set exp to 5 minutes from now (within 30-min window)
      const exp = Math.floor(Date.now() / 1000) + 5 * 60;
      expect(isSessionExpiringSoon(exp)).toBe(true);
    });

    it("returns false when exp is far in the future", () => {
      const exp = Math.floor(Date.now() / 1000) + 3600 * 2; // 2 hours
      expect(isSessionExpiringSoon(exp)).toBe(false);
    });

    it("returns false when exp is already in the past", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 60;
      expect(isSessionExpiringSoon(pastExp)).toBe(false);
    });

    it("uses ADMIN_SESSION_REFRESH_WINDOW_SECONDS as the threshold", () => {
      // exp at exact boundary: remainingMs ≈ ADMIN_SESSION_REFRESH_WINDOW_SECONDS * 1000
      // This equals the threshold, so it IS considered "expiring soon"
      const exactBoundary = Math.floor(Date.now() / 1000) + ADMIN_SESSION_REFRESH_WINDOW_SECONDS;
      expect(isSessionExpiringSoon(exactBoundary)).toBe(true);

      // Just inside the boundary
      const justInside = Math.floor(Date.now() / 1000) + ADMIN_SESSION_REFRESH_WINDOW_SECONDS - 1;
      expect(isSessionExpiringSoon(justInside)).toBe(true);
    });
  });

  describe("constants", () => {
    it("ADMIN_SESSION_MAX_AGE_SECONDS is 24 hours", () => {
      expect(ADMIN_SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24);
    });

    it("ADMIN_SESSION_REFRESH_WINDOW_SECONDS is 30 minutes", () => {
      expect(ADMIN_SESSION_REFRESH_WINDOW_SECONDS).toBe(30 * 60);
    });
  });
});

// =========================================
// rate-limit Tests
// =========================================
describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    // 5 requests per 60-second window
    for (let i = 0; i < 5; i++) {
      const result = rateLimit("test-ip-1", 5, 60_000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5 - (i + 1));
    }
  });

  it("blocks requests exceeding the limit", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-ip-2", 5, 60_000);
    }
    const result = rateLimit("test-ip-2", 5, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets the count after window expires", () => {
    for (let i = 0; i < 5; i++) {
      rateLimit("test-ip-3", 5, 60_000);
    }
    // Should be blocked now
    expect(rateLimit("test-ip-3", 5, 60_000).success).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(60_001);

    // Should be allowed again
    const result = rateLimit("test-ip-3", 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks different IPs independently", () => {
    rateLimit("ip-a", 2, 60_000);
    rateLimit("ip-a", 2, 60_000);
    // ip-a is now blocked
    expect(rateLimit("ip-a", 2, 60_000).success).toBe(false);

    // ip-b should still be allowed
    expect(rateLimit("ip-b", 2, 60_000).success).toBe(true);
    expect(rateLimit("ip-b", 2, 60_000).success).toBe(true);
    expect(rateLimit("ip-b", 2, 60_000).success).toBe(false);
  });

  it("handles limit of 1 correctly", () => {
    expect(rateLimit("single-ip", 1, 60_000).success).toBe(true);
    expect(rateLimit("single-ip", 1, 60_000).success).toBe(false);
  });

  it("shows correct remaining count", () => {
    const r1 = rateLimit("remaining-test", 3, 60_000);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit("remaining-test", 3, 60_000);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit("remaining-test", 3, 60_000);
    expect(r3.remaining).toBe(0);

    const r4 = rateLimit("remaining-test", 3, 60_000);
    expect(r4.remaining).toBe(0);
  });
});

// =========================================
// Guard Hardening — PermissionKey completeness
// =========================================
describe("PermissionKey hardening (Phase 3)", () => {
  it("contains no duplicate keys after story.publish fix", () => {
    const uniqueKeys = new Set(ALL_PERMISSION_KEYS);
    expect(uniqueKeys.size).toBe(ALL_PERMISSION_KEYS.length);
  });

  it("contains only one story.publish entry", () => {
    const storyPublishCount = ALL_PERMISSION_KEYS.filter((k) => k === "story.publish").length;
    expect(storyPublishCount).toBe(1);
  });

  it("contains only one story.unpublish entry", () => {
    const storyUnpublishCount = ALL_PERMISSION_KEYS.filter((k) => k === "story.unpublish").length;
    expect(storyUnpublishCount).toBe(1);
  });

  it("contains all required auth-related permissions", () => {
    const authPermissions = [
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
      "audit.read",
      "audit.export",
    ];
    for (const perm of authPermissions) {
      expect(ALL_PERMISSION_KEYS).toContain(perm);
    }
  });

  it("hasPermission behaves correctly after story.publish dedup", () => {
    const actor = { permissions: ["story.publish" as PermissionKey] };
    expect(hasPermission(actor, "story.publish")).toBe(true);
    expect(hasPermission(actor, "story.unpublish")).toBe(false);
    expect(hasPermission(actor, "story.delete")).toBe(false);
  });
});

// =========================================
// Guard Role Expansion Tests
// =========================================
describe("Guard role-based permission expansion", () => {
  it("super_admin has all permissions via system.all", () => {
    const actor = { permissions: ["system.all" as PermissionKey] };
    expect(hasPermission(actor, "attraction.delete")).toBe(true);
    expect(hasPermission(actor, "user.manage")).toBe(true);
    expect(hasPermission(actor, "system.maintenance")).toBe(true);
    expect(hasPermission(actor, "audit.export")).toBe(true);
    expect(hasPermission(actor, "export.personal_data")).toBe(true);
  });

  it("viewer has only read permissions", () => {
    const viewerPermissions: PermissionKey[] = [
      "dashboard.read",
      "attraction.read",
      "photo_spot.read",
      "checkin_code.read",
      "media.read",
      "story.read",
      "route.read",
      "restaurant.read",
      "badge.read",
      "visit.read",
      "survey.read",
      "stamp.read",
    ];

    const actor = { permissions: viewerPermissions };

    // Viewer CAN read
    expect(hasPermission(actor, "attraction.read")).toBe(true);

    // Viewer CANNOT write
    expect(hasPermission(actor, "attraction.create")).toBe(false);
    expect(hasPermission(actor, "attraction.update")).toBe(false);
    expect(hasPermission(actor, "media.upload")).toBe(false);
    expect(hasPermission(actor, "story.create")).toBe(false);

    // Viewer CANNOT manage
    expect(hasPermission(actor, "user.manage")).toBe(false);
    expect(hasPermission(actor, "system.settings_update")).toBe(false);
  });
});

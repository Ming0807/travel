import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server-only modules for unit testing
vi.mock("@/lib/auth/guest", () => ({
  getGuestIdentity: vi.fn(),
}));

vi.mock("@/lib/repositories/tourist.repository", () => ({
  findTouristByIdentity: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

import { getGuestIdentity } from "@/lib/auth/guest";
import { findTouristByIdentity } from "@/lib/repositories/tourist.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// We import the module under test dynamically so mocks are in place
async function importGuards() {
  // Clear module cache to get fresh imports with mocks
  vi.resetModules();
  // Re-import under test
  const mod = await import("@/lib/auth/guards");
  return mod;
}

describe("resolveTouristId — identity resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("guest identity path", () => {
    it("resolves tourist via anonymous_device guest cookie", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      // No auth session
      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as never);

      // Guest cookie exists
      mockGetGuestIdentity.mockResolvedValue("guest-token-abc");
      mockFindTouristByIdentity.mockResolvedValue("tourist-uuid-001");

      const { resolveTouristId } = await importGuards();
      const result = await resolveTouristId();

      expect(result).toBe("tourist-uuid-001");
      expect(mockFindTouristByIdentity).toHaveBeenCalledWith(
        "anonymous_device",
        "guest-token-abc"
      );
    });

    it("throws TOURIST_IDENTITY_NOT_FOUND when no cookie and no auth session", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as never);
      mockGetGuestIdentity.mockResolvedValue(null);

      const { resolveTouristId } = await importGuards();

      await expect(resolveTouristId()).rejects.toMatchObject({
        code: "TOURIST_IDENTITY_NOT_FOUND",
        message: "ไม่พบข้อมูลพาสปอร์ต",
      });
    });

    it("throws when guest token exists but no tourist profile found", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as never);
      mockGetGuestIdentity.mockResolvedValue("guest-token-xyz");
      mockFindTouristByIdentity.mockResolvedValue(null);

      const { resolveTouristId } = await importGuards();

      await expect(resolveTouristId()).rejects.toMatchObject({
        code: "TOURIST_IDENTITY_NOT_FOUND",
      });
    });
  });

  describe("OAuth identity path", () => {
    it("resolves tourist via Google OAuth identity when no guest cookie", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "auth-uuid-google-123",
                app_metadata: { provider: "google" },
              },
            },
            error: null,
          }),
        },
      } as never);
      mockGetGuestIdentity.mockResolvedValue(null); // No guest cookie
      mockFindTouristByIdentity.mockResolvedValue("tourist-uuid-002");

      const { resolveTouristId } = await importGuards();
      const result = await resolveTouristId();

      expect(result).toBe("tourist-uuid-002");
      expect(mockFindTouristByIdentity).toHaveBeenCalledWith(
        "google",
        "auth-uuid-google-123"
      );
    });

    it("resolves tourist via an explicit email identity provider", async () => {
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "auth-uuid-email-456",
                app_metadata: { provider: "email" },
              },
            },
            error: null,
          }),
        },
      } as never);
      vi.mocked(getGuestIdentity).mockResolvedValue(null);
      mockFindTouristByIdentity.mockResolvedValue("tourist-uuid-003");

      const { resolveTouristId } = await importGuards();
      const result = await resolveTouristId();

      expect(result).toBe("tourist-uuid-003");
      expect(mockFindTouristByIdentity).toHaveBeenCalledWith(
        "email",
        "auth-uuid-email-456"
      );
    });

    it("does not fall back to a device guest when an authenticated identity is not linked", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "auth-uuid-new-user",
                app_metadata: { provider: "google" },
              },
            },
            error: null,
          }),
        },
      } as never);
      mockGetGuestIdentity.mockResolvedValue("guest-token-existing");
      mockFindTouristByIdentity
        .mockResolvedValueOnce(null) // OAuth lookup returns null
        .mockResolvedValueOnce("tourist-uuid-existing"); // Guest lookup succeeds

      const { resolveTouristId } = await importGuards();
      await expect(resolveTouristId()).rejects.toMatchObject({
        code: "TOURIST_IDENTITY_NOT_FOUND",
      });
      expect(mockFindTouristByIdentity).toHaveBeenCalledTimes(1);
      expect(mockGetGuestIdentity).not.toHaveBeenCalled();
    });

    it("rejects an unsupported authenticated provider instead of treating it as email", async () => {
      vi.mocked(createSupabaseServerClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: "auth-uuid-unsupported",
                app_metadata: { provider: "azure" },
              },
            },
            error: null,
          }),
        },
      } as never);
      vi.mocked(getGuestIdentity).mockResolvedValue("guest-token-existing");

      const { resolveTouristId } = await importGuards();

      await expect(resolveTouristId()).rejects.toMatchObject({
        code: "TOURIST_IDENTITY_NOT_FOUND",
      });
      expect(findTouristByIdentity).not.toHaveBeenCalled();
      expect(getGuestIdentity).not.toHaveBeenCalled();
    });

    it("handles auth error gracefully and falls back to guest", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);
      const mockCreateSupabaseServerClient = vi.mocked(createSupabaseServerClient);

      mockCreateSupabaseServerClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockRejectedValue(new Error("Network error")),
        },
      } as never);
      mockGetGuestIdentity.mockResolvedValue("guest-token-fallback");
      mockFindTouristByIdentity.mockReset();
      mockFindTouristByIdentity.mockResolvedValue("tourist-uuid-fallback");

      const { resolveTouristId } = await importGuards();
      const result = await resolveTouristId();

      expect(result).toBe("tourist-uuid-fallback");
    });
  });

  describe("resolveCurrentTouristId backward compatibility", () => {
    it("delegates to resolveTouristId", async () => {
      const mockGetGuestIdentity = vi.mocked(getGuestIdentity);
      const mockFindTouristByIdentity = vi.mocked(findTouristByIdentity);

      vi.mocked(createSupabaseServerClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as never);
      mockGetGuestIdentity.mockResolvedValue("guest-token-legacy");
      mockFindTouristByIdentity.mockResolvedValue("tourist-uuid-legacy");

      const { resolveCurrentTouristId } = await importGuards();
      const result = await resolveCurrentTouristId();

      expect(result).toBe("tourist-uuid-legacy");
    });
  });
});

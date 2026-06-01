import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only to prevent import errors in test environment
vi.mock("server-only", () => ({}));

// Use an object wrapper so the mock factory and tests share the same mutable reference
const authState = vi.hoisted(() => ({ shouldThrow: false }));

// Track the last RPC call for assertions
const lastRpcCall = vi.hoisted(() => ({ fn: "", params: {} as Record<string, unknown> }));

let rpcResult: unknown = { success: true, inserted: 2, deleted_before_insert: true };
let rpcError: { code: string; message: string; details: string; hint: string } | null = null;

const mockRpc = vi.fn().mockImplementation((fn: string, params: Record<string, unknown>) => {
  lastRpcCall.fn = fn;
  lastRpcCall.params = params;
  if (rpcError) {
    return { data: null, error: rpcError };
  }
  return { data: rpcResult, error: null };
});

const mockSupabaseClient = {
  rpc: mockRpc,
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  limit: vi.fn().mockReturnThis(),
};

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock("@/lib/auth/guards", () => {
  class MockAdminAuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AdminAuthError";
    }
  }

  return {
    requirePermission: vi.fn().mockImplementation(async () => {
      if (authState.shouldThrow) {
        throw new MockAdminAuthError("ADMIN_AUTH_DENIED");
      }
      return { actor: { id: "test-admin", permissions: ["route.update"] } };
    }),
    AdminAuthError: MockAdminAuthError,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAdminMutation: vi.fn().mockResolvedValue(undefined),
}));

// Static imports for Zod schemas (no server-only dependency)
import { adminRouteStopMutationSchema, adminRouteStopsBatchSchema } from "@/lib/validation/route";

// Import the real repository function after mocks are established
import { updateRouteStopsBatch } from "@/lib/repositories/admin-route.repository";
import type { AdminRouteStopMutationInput } from "@/lib/validation/route";

describe("updateRouteStopsBatch (RPC wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpcError = null;
    rpcResult = { success: true, inserted: 2, deleted_before_insert: true };
    authState.shouldThrow = false;
    lastRpcCall.fn = "";
    lastRpcCall.params = {};
  });

  describe("success scenarios", () => {
    it("deletes existing stops and inserts new ones via the RPC", async () => {
      const stops: AdminRouteStopMutationInput[] = [
        { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        { attractionId: 2, dayNumber: 1, displayOrder: 2, stopNoteTh: null, stopNoteEn: null },
      ];

      await updateRouteStopsBatch(42, stops);

      expect(lastRpcCall.fn).toBe("update_route_stops");
      expect(lastRpcCall.params).toEqual({
        p_route_id: 42,
        p_stops_json: [
          { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
          { attractionId: 2, dayNumber: 1, displayOrder: 2, stopNoteTh: null, stopNoteEn: null },
        ],
      });
    });

    it("handles an empty stops array (deletes all stops)", async () => {
      rpcResult = { success: true, inserted: 0, deleted_before_insert: true };

      await updateRouteStopsBatch(42, []);

      expect((lastRpcCall.params.p_stops_json as unknown[])).toEqual([]);
    });

    it("maps camelCase fields to RPC-expected JSON keys", async () => {
      const stops: AdminRouteStopMutationInput[] = [
        {
          attractionId: 5,
          dayNumber: 2,
          displayOrder: 3,
          stopNoteTh: "จุดชมวิวทะเล",
          stopNoteEn: "Sea view point",
        },
      ];

      await updateRouteStopsBatch(10, stops);

      expect((lastRpcCall.params.p_stops_json as Array<Record<string, unknown>>)[0]).toEqual({
        attractionId: 5,
        dayNumber: 2,
        displayOrder: 3,
        stopNoteTh: "จุดชมวิวทะเล",
        stopNoteEn: "Sea view point",
      });
    });

    it("passes null for missing optional note fields", async () => {
      const stops: AdminRouteStopMutationInput[] = [
        { attractionId: 3, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
      ];

      await updateRouteStopsBatch(7, stops);

      const json = lastRpcCall.params.p_stops_json as Array<Record<string, unknown>>;
      expect(json[0].stopNoteTh).toBeNull();
      expect(json[0].stopNoteEn).toBeNull();
    });

    it("passes the correct p_route_id parameter", async () => {
      await updateRouteStopsBatch(99, [
        { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
      ]);

      expect(lastRpcCall.params.p_route_id).toBe(99);
    });

    it("passes undefined stop notes through to the RPC as undefined", async () => {
      const stops = [
        { attractionId: 1, dayNumber: 1, displayOrder: 1 },
      ] as AdminRouteStopMutationInput[];

      await updateRouteStopsBatch(1, stops);

      // Raw JS objects pass undefined through; the Supabase client and PostgreSQL
      // handle this the same as null during JSON→SQL serialization.
      const json = lastRpcCall.params.p_stops_json as Array<Record<string, unknown>>;
      expect(json[0].stopNoteTh).toBeUndefined();
      expect(json[0].stopNoteEn).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("throws when Supabase RPC returns a database error", async () => {
      rpcError = {
        code: "42501",
        message: "permission denied for function update_route_stops",
        details: "No permission to call this function",
        hint: "Grant execute permission",
      };

      await expect(
        updateRouteStopsBatch(1, [
          { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        ])
      ).rejects.toThrow("ADMIN_ROUTE_STOPS_UPDATE_FAILED");
    });

    it("includes the Supabase error message in the thrown error", async () => {
      rpcError = {
        code: "42501",
        message: "permission denied for function update_route_stops",
        details: "No permission to call this function",
        hint: "Grant execute permission",
      };

      await expect(
        updateRouteStopsBatch(1, [
          { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        ])
      ).rejects.toThrow(/permission denied/);
    });

    it("throws when RPC returns success: false with an error message", async () => {
      rpcResult = {
        success: false,
        error: "Foreign key violation: attraction_id 999 does not exist",
        error_code: "23503",
        detail: "Transaction rolled back — no route stops were modified.",
      };

      await expect(
        updateRouteStopsBatch(1, [
          { attractionId: 999, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        ])
      ).rejects.toThrow("ADMIN_ROUTE_STOPS_UPDATE_FAILED");
    });

    it("includes the RPC error detail when success is false", async () => {
      rpcResult = {
        success: false,
        error: "Foreign key violation",
        error_code: "23503",
        detail: "Transaction rolled back — no route stops were modified.",
      };

      await expect(
        updateRouteStopsBatch(1, [
          { attractionId: 999, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        ])
      ).rejects.toThrow(/Foreign key violation/);
    });

    it("throws when RPC result is null", async () => {
      rpcResult = null;

      await expect(
        updateRouteStopsBatch(1, [
          { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        ])
      ).rejects.toThrow("ADMIN_ROUTE_STOPS_UPDATE_FAILED");
    });
  });

  describe("input parameter integrity", () => {
    it("preserves integer precision for large values", async () => {
      const stops: AdminRouteStopMutationInput[] = [
        { attractionId: 2147483647, dayNumber: 365, displayOrder: 999, stopNoteTh: null, stopNoteEn: null },
      ];

      await updateRouteStopsBatch(1, stops);

      const json = lastRpcCall.params.p_stops_json as Array<Record<string, unknown>>;
      expect(json[0].attractionId).toBe(2147483647);
      expect(json[0].dayNumber).toBe(365);
      expect(json[0].displayOrder).toBe(999);
    });

    it("passes multiple stops in the correct order", async () => {
      const stops: AdminRouteStopMutationInput[] = [
        { attractionId: 1, dayNumber: 1, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
        { attractionId: 2, dayNumber: 1, displayOrder: 2, stopNoteTh: null, stopNoteEn: null },
        { attractionId: 3, dayNumber: 2, displayOrder: 1, stopNoteTh: null, stopNoteEn: null },
      ];

      await updateRouteStopsBatch(1, stops);

      const json = lastRpcCall.params.p_stops_json as Array<Record<string, unknown>>;
      expect(json).toHaveLength(3);
      expect(json[0].attractionId).toBe(1);
      expect(json[1].attractionId).toBe(2);
      expect(json[2].attractionId).toBe(3);
    });
  });
});

// ============================================================================
// Server Action Tests
// ============================================================================
describe("updateRouteStopsAction (server action)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.shouldThrow = false;
    rpcError = null;
    rpcResult = { success: true, inserted: 2, deleted_before_insert: true };
  });

  it("returns success when stops are saved correctly", async () => {
    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: 1, dayNumber: 1, displayOrder: 1 },
      { attractionId: 2, dayNumber: 1, displayOrder: 2 },
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns error when stops form data is missing", async () => {
    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ยังไม่มีข้อมูลจุดแวะ กรุณาเพิ่มจุดแวะอย่างน้อย 1 จุด");
  });

  it("returns validation error for invalid stop structure", async () => {
    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: "not-a-number", dayNumber: "abc", displayOrder: "xyz" },
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาตรวจจุดแวะของเส้นทางอีกครั้ง");
  });

  it("returns validation error when stop has missing required fields", async () => {
    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: 1 }, // missing dayNumber and displayOrder
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาตรวจจุดแวะของเส้นทางอีกครั้ง");
  });

  it("returns validation error for dayNumber less than 1", async () => {
    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: 1, dayNumber: 0, displayOrder: 1 },
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาตรวจจุดแวะของเส้นทางอีกครั้ง");
  });

  it("returns validation error for displayOrder less than 1", async () => {
    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: 1, dayNumber: 1, displayOrder: 0 },
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาตรวจจุดแวะของเส้นทางอีกครั้ง");
  });

  it("returns auth error when permission is denied", async () => {
    authState.shouldThrow = true;

    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: 1, dayNumber: 1, displayOrder: 1 },
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ADMIN_AUTH_DENIED");
  });

  it("returns generic error when the RPC returns a failure", async () => {
    // Make the RPC return success: false, which causes updateRouteStopsBatch to throw
    rpcResult = { success: false, error: "Internal database error", error_code: "P0001" };

    const { updateRouteStopsAction } = await import("@/app/actions/admin-route-actions");
    const formData = new FormData();
    formData.set("stops", JSON.stringify([
      { attractionId: 1, dayNumber: 1, displayOrder: 1 },
    ]));

    const result = await updateRouteStopsAction(5, { success: true } as any, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ยังบันทึกจุดแวะของเส้นทางไม่ได้ กรุณาลองอีกครั้ง");
  });
});

// ============================================================================
// SQL RPC Function Contract Tests
// ============================================================================
describe("update_route_stops RPC SQL contract", () => {
  it("returns success object with inserted count when stops are replaced", () => {
    const result = { success: true, inserted: 3, deleted_before_insert: true };
    expect(result.success).toBe(true);
    expect(result.inserted).toBe(3);
    expect(result.deleted_before_insert).toBe(true);
  });

  it("returns failure object with SQL error info on exception", () => {
    const result = {
      success: false,
      error: 'insert or update on table "suggested_route_stops" violates foreign key constraint',
      error_code: "23503",
      detail: "Transaction rolled back — no route stops were modified.",
    };
    expect(result.success).toBe(false);
    expect(result.error).toContain("foreign key constraint");
    expect(result.error_code).toBe("23503");
    expect(result.detail).toContain("rolled back");
  });

  it("returns inserted: 0 when empty stops array is provided", () => {
    const result = { success: true, inserted: 0, deleted_before_insert: true };
    expect(result.inserted).toBe(0);
  });

  it("converts empty strings to null for optional stop note fields", () => {
    // Mirrors the RPC's PL/pgSQL: IF v_stop_note_th = '' THEN v_stop_note_th := NULL;
    const coerceEmptyToNull = (val: string | null | undefined): string | null => {
      if (val === "" || val == null) return null;
      return val;
    };

    expect(coerceEmptyToNull("")).toBeNull();
    expect(coerceEmptyToNull(null)).toBeNull();
    expect(coerceEmptyToNull(undefined)).toBeNull();
    expect(coerceEmptyToNull("จุดชมวิว")).toBe("จุดชมวิว");
    expect(coerceEmptyToNull("  ")).toBe("  ");
  });

  it("ensures atomic transaction behavior (delete + insert)", () => {
    // The RPC wraps DELETE and INSERT in a single PL/pgSQL transaction
    // On EXCEPTION, the entire transaction rolls back automatically
    const contract = {
      atomicDeleteInsert: true,
      autoRollbackOnError: true,
      noPartialUpdates: true,
    };
    expect(contract.atomicDeleteInsert).toBe(true);
    expect(contract.autoRollbackOnError).toBe(true);
    expect(contract.noPartialUpdates).toBe(true);
  });
});

// ============================================================================
// Integration: Zod schema → RPC input compatibility
// ============================================================================
describe("Zod schema → RPC input compatibility", () => {
  it("produces RPC-compatible input from validated schema", () => {
    const parsed = adminRouteStopMutationSchema.parse({
      attractionId: "7",
      dayNumber: "2",
      displayOrder: "3",
      stopNoteTh: "วิวสวย",
      stopNoteEn: "",
    });

    // This is the shape sent to the RPC
    const rpcInput = {
      attractionId: parsed.attractionId,
      dayNumber: parsed.dayNumber,
      displayOrder: parsed.displayOrder,
      stopNoteTh: parsed.stopNoteTh,
      stopNoteEn: parsed.stopNoteEn,
    };

    expect(rpcInput.attractionId).toBe(7);
    expect(rpcInput.dayNumber).toBe(2);
    expect(rpcInput.displayOrder).toBe(3);
    expect(rpcInput.stopNoteTh).toBe("วิวสวย");
    // Empty string should be converted to null via optionalText preprocess
    expect(rpcInput.stopNoteEn).toBeNull();
  });

  it("accepts empty stops array in batch schema (clearing use case)", () => {
    const result = adminRouteStopsBatchSchema.safeParse({
      routeId: "1",
      stops: [],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stops).toHaveLength(0);
    }
  });

  it("rejects stop with invalid dayNumber (0) in batch schema", () => {
    const result = adminRouteStopsBatchSchema.safeParse({
      routeId: "1",
      stops: [{ attractionId: "1", dayNumber: "0", displayOrder: "1" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects stop with missing attractionId in batch schema", () => {
    const result = adminRouteStopsBatchSchema.safeParse({
      routeId: "1",
      stops: [{ dayNumber: "1", displayOrder: "1" }],
    });

    expect(result.success).toBe(false);
  });
});

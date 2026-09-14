// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), client: vi.fn(), rpc: vi.fn(), single: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ auth: { getUser: mocks.user } }) }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: mocks.client }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { requestAdminNfcRecoveryRetryAction } from "@/app/actions/admin-nfc-retry-actions";
const input = { requestId: "40000000-0000-4000-8000-000000000001", tagId: "40000000-0000-4000-8000-000000000002",
  assetId: "40000000-0000-4000-8000-000000000003", expectedAttemptCount: 2, reason: "provider_restored" };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NFC_EVIDENCE_RECOVERY_ENABLED", "true"); vi.stubEnv("NFC_EVIDENCE_OPERATOR_RETRY_ENABLED", "true");
  mocks.client.mockReturnValue({ rpc: mocks.rpc, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.single }) }) }) });
});
afterEach(() => vi.unstubAllEnvs());
it.each([null, { message: "private session failure" }])("rejects missing sessions through the real guard without a database call", async error => {
  mocks.user.mockResolvedValue({ data: { user: null }, error });
  expect(await requestAdminNfcRecoveryRetryAction(input)).toMatchObject({ success: false, outcome: "rejected", code: "unauthorized" });
  expect(mocks.client).not.toHaveBeenCalled(); expect(mocks.redirect).not.toHaveBeenCalled();
});
it.each([false, true])("rejects inactive or unprivileged admin through the real guard (active=%s)", async active => {
  mocks.user.mockResolvedValue({ data: { user: { id: "test-auth-user", email: "test@local.invalid" } }, error: null });
  mocks.single.mockResolvedValue({ data: { admin_id: input.assetId, is_active: active, admin_user_roles: [] }, error: null });
  expect(await requestAdminNfcRecoveryRetryAction(input)).toMatchObject({ success: false, outcome: "rejected", code: "forbidden" });
  expect(mocks.rpc).not.toHaveBeenCalled(); expect(mocks.redirect).not.toHaveBeenCalled();
});
it("derives an authorized operator from the real guard and rejects payload identity", async () => {
  const operatorId = "40000000-0000-4000-8000-000000000004";
  mocks.user.mockResolvedValue({ data: { user: { id: "test-auth-user", email: "test@local.invalid" } }, error: null });
  mocks.single.mockResolvedValue({ data: { admin_id: operatorId, is_active: true, admin_user_roles: [{ roles: {
    role_name: "custom_operator", is_active: true, role_permissions: [{ permissions: { permission_name: "checkin_code.manage" } }],
  } }] }, error: null });
  mocks.rpc.mockResolvedValue({ data: input.requestId, error: null });
  expect(await requestAdminNfcRecoveryRetryAction(input)).toEqual({ success: true, requestId: input.requestId });
  expect(mocks.rpc).toHaveBeenCalledWith("request_nfc_evidence_recovery_retry", expect.objectContaining({ p_operator_id: operatorId }));
  mocks.rpc.mockClear();
  expect(await requestAdminNfcRecoveryRetryAction({ ...input, operatorId: input.assetId })).toMatchObject({ success: false, code: "invalid" });
  expect(mocks.rpc).not.toHaveBeenCalled();
});

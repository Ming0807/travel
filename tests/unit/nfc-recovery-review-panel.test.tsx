import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ list: vi.fn(), history: vi.fn() }));
const retryMocks = vi.hoisted(() => ({ retry: vi.fn() }));
vi.mock("@/app/actions/admin-nfc-retry-actions", () => ({ requestAdminNfcRecoveryRetryAction: retryMocks.retry }));
vi.mock("@/app/actions/admin-nfc-recovery-actions", () => ({ getAdminNfcRecoveryAction: mocks.list, getAdminNfcRecoveryHistoryAction: mocks.history }));
import { NfcRecoveryReview } from "@/components/admin/checkin-codes/NfcRecoveryReview";
const tagId = "40000000-0000-4000-8000-000000000001";
const row = { asset_id: "40000000-0000-4000-8000-000000000002", tag_version: 1, intent_state: "prepared", created_at: "2026-09-11T00:00:00Z",
  attempt_count: 2, last_attempt_at: "2026-09-11T00:01:00Z", next_attempt_at: "2026-09-11T00:02:00Z", last_outcome: "content_conflict", completed_at: null, status: "review" };
beforeEach(() => {
  vi.resetAllMocks();
  mocks.list.mockResolvedValue({ success: true, enabled: true, rows: [row], page: 1, pageSize: 20, hasMore: false });
  mocks.history.mockResolvedValue({ success: true, enabled: true, rows: [], nextBeforeId: null });
});
afterEach(cleanup);
it("does not load automatically and distinguishes review from successful uploads", async () => {
  render(<NfcRecoveryReview tagId={tagId} />); expect(mocks.list).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "โหลดรายการกู้คืน" }));
  expect(await screen.findByText("ต้องตรวจสอบ")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /ลองกู้คืน|ลบไฟล์/ })).not.toBeInTheDocument();
});
it("shows disabled separately from an empty queue", async () => {
  mocks.list.mockResolvedValue({ success: true, enabled: false });
  render(<NfcRecoveryReview tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการกู้คืน" }));
  expect(await screen.findByText("ยังไม่เปิดระบบกู้คืนหลักฐาน")).toBeInTheDocument();
  expect(screen.queryByText("ยังไม่มีรายการกู้คืนของแท็กนี้")).not.toBeInTheDocument();
});
it("shows a recoverable error without retaining stale successful rows", async () => {
  render(<NfcRecoveryReview tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการกู้คืน" }));
  await screen.findByText("ต้องตรวจสอบ"); mocks.list.mockRejectedValue(new Error("network"));
  const refresh = screen.getByRole("button", { name: "รีเฟรชรายการกู้คืน" });
  await waitFor(() => expect(refresh).toBeEnabled());
  fireEvent.click(refresh);
  expect(await screen.findByRole("alert")).toHaveTextContent("เชื่อมต่อไม่สำเร็จ");
  expect(screen.queryByText("ต้องตรวจสอบ")).not.toBeInTheDocument();
});
it("loads the next page for the same tag", async () => {
  mocks.list.mockResolvedValue({ success: true, enabled: true, rows: [row], page: 1, pageSize: 20, hasMore: true });
  render(<NfcRecoveryReview tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการกู้คืน" }));
  const next = await screen.findByRole("button", { name: "รายการกู้คืนหน้าถัดไป" });
  await waitFor(() => expect(next).toBeEnabled()); fireEvent.click(next);
  await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith({ tagId, page: 2 }));
});
it("loads a scoped history only on demand", async () => {
  render(<NfcRecoveryReview tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการกู้คืน" }));
  fireEvent.click(await screen.findByRole("button", { name: "ดูประวัติการกู้คืน" }));
  await waitFor(() => expect(mocks.history).toHaveBeenCalledWith({ tagId, assetId: row.asset_id }));
  expect(await screen.findByText("ยังไม่มีประวัติที่บันทึกไว้")).toBeInTheDocument();
});
it("keeps an uncertain retry identity when the user refreshes the list", async () => {
  mocks.list.mockResolvedValue({ success: true, enabled: true, retryEnabled: true, rows: [{ ...row, status: "waiting", last_outcome: "provider_unavailable" }], page: 1, hasMore: false });
  retryMocks.retry.mockResolvedValue({ success: false, outcome: "uncertain", message: "ผลยังไม่ชัดเจน" });
  render(<NfcRecoveryReview tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการกู้คืน" }));
  fireEvent.click(await screen.findByRole("button", { name: "จัดคิวตรวจซ้ำ" }));
  fireEvent.click(screen.getByRole("button", { name: "ยืนยันจัดคิวตรวจซ้ำ" }));
  await screen.findByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" });
  mocks.list.mockResolvedValue({ success: true, enabled: true, retryEnabled: false, rows: [], page: 1, hasMore: false });
  fireEvent.click(screen.getByRole("button", { name: "รีเฟรชรายการกู้คืน" }));
  await screen.findByText("ยังไม่มีรายการกู้คืนของแท็กนี้");
  fireEvent.click(screen.getByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" }));
  await waitFor(() => expect(retryMocks.retry).toHaveBeenCalledTimes(2));
  expect(retryMocks.retry.mock.calls[0][0]).toEqual(retryMocks.retry.mock.calls[1][0]);
});

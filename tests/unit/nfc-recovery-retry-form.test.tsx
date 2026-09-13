import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ retry: vi.fn() }));
vi.mock("@/app/actions/admin-nfc-retry-actions", () => ({ requestAdminNfcRecoveryRetryAction: mocks.retry }));
import { NfcRecoveryRetryForm } from "@/components/admin/checkin-codes/NfcRecoveryRetryForm";
const props = { tagId: "40000000-0000-4000-8000-000000000001", assetId: "40000000-0000-4000-8000-000000000002",
  expectedAttemptCount: 3, onClose: vi.fn(), onScheduled: vi.fn() };
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
it("retains exact identity and reason after an uncertain network result", async () => {
  mocks.retry.mockRejectedValueOnce(new Error("offline")).mockImplementationOnce(async input => ({ success: true, requestId: input.requestId }));
  render(<NfcRecoveryRetryForm {...props} />);
  fireEvent.change(screen.getByLabelText("เหตุผลในการตรวจซ้ำ"), { target: { value: "connectivity_restored" } });
  fireEvent.click(screen.getByRole("button", { name: "ยืนยันจัดคิวตรวจซ้ำ" }));
  const retry = await screen.findByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" });
  await waitFor(() => expect(retry).toBeEnabled());
  expect(screen.getByLabelText("เหตุผลในการตรวจซ้ำ")).toBeDisabled();
  expect(screen.queryByRole("button", { name: "ยกเลิก" })).not.toBeInTheDocument();
  fireEvent.click(retry);
  await screen.findByText("จัดคิวตรวจซ้ำแล้ว ยังไม่ได้ยืนยันว่ากู้คืนไฟล์สำเร็จ");
  expect(mocks.retry.mock.calls[0][0]).toEqual(mocks.retry.mock.calls[1][0]);
  expect(mocks.retry.mock.calls[0][0]).toMatchObject({ tagId: props.tagId, assetId: props.assetId, expectedAttemptCount: 3, reason: "connectivity_restored" });
  expect(props.onScheduled).toHaveBeenCalledTimes(1);
});
it("treats a mismatched success acknowledgement as uncertain", async () => {
  mocks.retry.mockResolvedValue({ success: true, requestId: props.assetId });
  render(<NfcRecoveryRetryForm {...props} />); fireEvent.click(screen.getByRole("button", { name: "ยืนยันจัดคิวตรวจซ้ำ" }));
  expect(await screen.findByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" })).toBeInTheDocument();
  expect(props.onScheduled).not.toHaveBeenCalled();
});
it("shows definite rejection without allowing a stale mutation retry", async () => {
  mocks.retry.mockResolvedValue({ success: false, outcome: "rejected", message: "สถานะเปลี่ยนแล้ว" });
  render(<NfcRecoveryRetryForm {...props} />); fireEvent.click(screen.getByRole("button", { name: "ยืนยันจัดคิวตรวจซ้ำ" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("สถานะเปลี่ยนแล้ว");
  expect(screen.queryByRole("button", { name: "ส่งคำขอเดิมอีกครั้ง" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ปิดคำขอ" })); expect(props.onClose).toHaveBeenCalled();
});
it("cancel before submission does not create a request", () => {
  render(<NfcRecoveryRetryForm {...props} />); fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));
  expect(props.onClose).toHaveBeenCalled(); expect(mocks.retry).not.toHaveBeenCalled();
});
it("does not submit twice while the acknowledgement is pending", async () => {
  let finish!: (value: { success: true; requestId: string }) => void;
  mocks.retry.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  render(<NfcRecoveryRetryForm {...props} />);
  const form = screen.getByRole("form", { name: "คำขอจัดคิวตรวจซ้ำ" });
  fireEvent.submit(form); fireEvent.submit(form);
  expect(mocks.retry).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "กำลังส่งคำขอ" })).toBeDisabled();
  finish({ success: true, requestId: mocks.retry.mock.calls[0][0].requestId });
  await screen.findByText("จัดคิวตรวจซ้ำแล้ว ยังไม่ได้ยืนยันว่ากู้คืนไฟล์สำเร็จ");
  expect(props.onScheduled).toHaveBeenCalledTimes(1);
});

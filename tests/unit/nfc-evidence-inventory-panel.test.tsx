import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("@/app/actions/admin-nfc-inventory-actions", () => ({ getAdminNfcEvidenceInventoryAction: mocks.read }));
import { NfcEvidenceInventory } from "@/components/admin/checkin-codes/NfcEvidenceInventory";
const tagId = "40000000-0000-4000-8000-000000000001";
const row = { asset_id: "40000000-0000-4000-8000-000000000002", created_at: "2026-09-14T00:00:00Z", provider: "supabase", attached: false, has_intent: false, cleanup_state: "acknowledged" };
beforeEach(() => { vi.resetAllMocks(); mocks.read.mockResolvedValue({ success: true, enabled: true, rows: [row], nextAfterAssetId: null }); });
afterEach(cleanup);
it("loads only on demand and does not describe historical acknowledgement as current absence", async () => {
  render(<NfcEvidenceInventory tagId={tagId} />); expect(mocks.read).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" }));
  await screen.findByText("มีบันทึกตอบรับการลบ");
  expect(screen.getByText("ยังไม่ได้ตรวจยืนยันสถานะไฟล์ปัจจุบัน")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /ลบ/ })).not.toBeInTheDocument();
});
it("uses the server cursor and can navigate back", async () => {
  mocks.read.mockResolvedValueOnce({ success: true, enabled: true, rows: [row], nextAfterAssetId: row.asset_id });
  render(<NfcEvidenceInventory tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" }));
  fireEvent.click(await screen.findByRole("button", { name: "หลักฐานหน้าถัดไป" }));
  await waitFor(() => expect(mocks.read).toHaveBeenLastCalledWith({ tagId, afterAssetId: row.asset_id }));
  const back = await screen.findByRole("button", { name: "หลักฐานหน้าก่อนหน้า" });
  await waitFor(() => expect(back).toBeEnabled()); fireEvent.click(back);
  await waitFor(() => expect(mocks.read).toHaveBeenLastCalledWith({ tagId }));
});
it("hides stale rows after a read failure", async () => {
  render(<NfcEvidenceInventory tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" }));
  await screen.findByText(row.asset_id); mocks.read.mockRejectedValue(new Error("offline"));
  fireEvent.click(screen.getByRole("button", { name: "รีเฟรชรายการหลักฐาน" }));
  await screen.findByRole("alert"); expect(screen.queryByText(row.asset_id)).not.toBeInTheDocument();
});
it("distinguishes disabled from an empty inventory", async () => {
  mocks.read.mockResolvedValue({ success: true, enabled: false });
  render(<NfcEvidenceInventory tagId={tagId} />); fireEvent.click(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" }));
  await screen.findByText("ยังไม่เปิดรายการตรวจสอบหลักฐาน");
  expect(screen.queryByText("ยังไม่มีหลักฐานที่ลงทะเบียนในหน้านี้")).not.toBeInTheDocument();
});
it("shows an empty successful inventory without an error", async () => {
  mocks.read.mockResolvedValue({ success: true, enabled: true, rows: [], nextAfterAssetId: null });
  render(<NfcEvidenceInventory tagId={tagId} />);
  fireEvent.click(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" }));
  await screen.findByText("ยังไม่มีหลักฐานที่ลงทะเบียนในหน้านี้");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
it("does not issue duplicate reads while a request is pending", async () => {
  let finish!: (value: unknown) => void;
  mocks.read.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  render(<NfcEvidenceInventory tagId={tagId} />);
  const load = screen.getByRole("button", { name: "โหลดรายการหลักฐาน" });
  fireEvent.click(load); fireEvent.click(load);
  expect(load).toBeDisabled(); expect(mocks.read).toHaveBeenCalledTimes(1);
  finish({ success: true, enabled: true, rows: [row], nextAfterAssetId: null });
  await screen.findByText(row.asset_id);
});
it("clears the previous tag inventory without automatically reading the next tag", async () => {
  const view = render(<NfcEvidenceInventory tagId={tagId} />);
  fireEvent.click(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" }));
  await screen.findByText(row.asset_id);
  view.rerender(<NfcEvidenceInventory tagId="40000000-0000-4000-8000-000000000009" />);
  expect(screen.queryByText(row.asset_id)).not.toBeInTheDocument();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "โหลดรายการหลักฐาน" })).toBeEnabled();
});

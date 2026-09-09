import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ save: vi.fn(), list: vi.fn() }));
vi.mock("@/app/actions/admin-nfc-actions", () => ({ saveAdminNfcFieldCheckAction: mocks.save, getAdminNfcFieldChecksAction: mocks.list }));
import { NfcFieldChecks } from "@/components/admin/checkin-codes/NfcFieldChecks";
import type { AdminNfcTag } from "@/lib/repositories/admin-nfc.repository";
const tag: AdminNfcTag = { nfc_tag_id: "11111111-1111-4111-8111-111111111111", public_token: "22222222-2222-4222-8222-222222222222", version: 1, status: "draft", verified_at: null, verification_reference: null, checkin_code_id: 10, code_snapshot: "yala", label: "Gate", replaces_tag_id: null, created_at: "2026-09-08", updated_at: "2026-09-08" };
beforeEach(() => { vi.resetAllMocks(); mocks.list.mockResolvedValue({ success: true, rows: [], total: 0, page: 1, pageSize: 10 }); });
afterEach(cleanup);
function fill() {
  fireEvent.click(screen.getByText("บันทึกการตรวจครั้งใหม่"));
  fireEvent.change(screen.getByLabelText("ตำแหน่งติดตั้ง"), { target: { value: "Main gate" } });
  fireEvent.change(screen.getByLabelText("อุปกรณ์และเบราว์เซอร์"), { target: { value: "Pixel Chrome" } });
  fireEvent.change(screen.getByLabelText("ผลทดสอบ QR"), { target: { value: "passed" } });
}
it("keeps the exact request and payload across an uncertain network retry", async () => {
  mocks.save.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ success: true });
  render(<NfcFieldChecks tag={tag} canManage />); fill();
  fireEvent.click(screen.getByRole("button", { name: "บันทึกผลตรวจ" }));
  await screen.findByText("ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งรายการเดิมอีกครั้ง");
  expect(screen.getByLabelText("ตำแหน่งติดตั้ง")).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "ลองส่งรายการเดิมอีกครั้ง" }));
  await screen.findByText("บันทึกผลตรวจแล้ว สถานะแท็กยังไม่เปลี่ยน");
  expect(mocks.save.mock.calls[0][0]).toEqual(mocks.save.mock.calls[1][0]);
  expect(mocks.save.mock.calls[0][0]).toMatchObject({ tagId: tag.nfc_tag_id, version: 1, nfcResult: "not_tested", qrResult: "passed" });
});
it("denies NFC pass for unverified tags and requires a tested channel", async () => {
  render(<NfcFieldChecks tag={tag} canManage />);
  fireEvent.click(screen.getByText("บันทึกการตรวจครั้งใหม่"));
  const nfc = screen.getByLabelText("ผลทดสอบ NFC") as HTMLSelectElement;
  expect(nfc.querySelector('option[value="passed"]')).toBeDisabled();
  fireEvent.submit(screen.getByLabelText("ตำแหน่งติดตั้ง").closest("form")!);
  expect(mocks.save).not.toHaveBeenCalled();
});
it("keeps read-only users out of the write form and shows history errors", async () => {
  mocks.list.mockResolvedValue({ success: false, message: "Unavailable schema" });
  render(<NfcFieldChecks tag={tag} canManage={false} />);
  expect(screen.queryByText("บันทึกการตรวจครั้งใหม่")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "โหลดประวัติ" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Unavailable schema");
  expect(mocks.save).not.toHaveBeenCalled();
});
it("requests paginated history for the exact tag", async () => {
  mocks.list.mockResolvedValueOnce({ success: true, rows: [], total: 11, page: 1, pageSize: 10 })
    .mockResolvedValueOnce({ success: true, rows: [], total: 11, page: 2, pageSize: 10 });
  render(<NfcFieldChecks tag={tag} canManage={false} />);
  fireEvent.click(screen.getByRole("button", { name: "โหลดประวัติ" }));
  const next = await screen.findByRole("button", { name: "หน้าถัดไป" });
  await waitFor(() => expect(next).toBeEnabled());
  fireEvent.click(next);
  await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith({ tagId: tag.nfc_tag_id, page: 2 }));
  expect(await screen.findByText("หน้า 2 / 2")).toBeInTheDocument();
});

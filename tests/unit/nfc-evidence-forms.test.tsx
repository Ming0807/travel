import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ upload: vi.fn(), load: vi.fn(), save: vi.fn(), list: vi.fn(), revoke: vi.fn() }));
vi.mock("@/lib/media/nfc-evidence-client", () => ({ uploadNfcEvidencePhoto: mocks.upload, loadNfcEvidencePhoto: mocks.load }));
vi.mock("@/app/actions/admin-nfc-actions", () => ({ saveAdminNfcFieldCheckAction: mocks.save, getAdminNfcFieldChecksAction: mocks.list }));
import { NfcFieldChecks } from "@/components/admin/checkin-codes/NfcFieldChecks";
import { NfcEvidencePhoto, NfcEvidencePicker } from "@/components/admin/checkin-codes/NfcEvidencePhotos";
import type { AdminNfcTag } from "@/lib/repositories/admin-nfc.repository";
const id = "11111111-1111-4111-8111-111111111111";
const tag: AdminNfcTag = { nfc_tag_id: id, public_token: id, version: 1, status: "draft", verified_at: null, verification_reference: null, checkin_code_id: 10, code_snapshot: "yala", label: "Gate", replaces_tag_id: null, created_at: "2026-09-08", updated_at: "2026-09-08" };
const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
const NativeURL = URL;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("URL", class extends NativeURL { static createObjectURL = () => "blob:local-test"; static revokeObjectURL = mocks.revoke; });
  mocks.list.mockResolvedValue({ success: true, rows: [], total: 0, page: 1, pageSize: 10 });
  mocks.save.mockResolvedValue({ success: true });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function fill() {
  fireEvent.click(screen.getByText("บันทึกการตรวจครั้งใหม่"));
  fireEvent.change(screen.getByLabelText("ตำแหน่งติดตั้ง"), { target: { value: "Main gate" } });
  fireEvent.change(screen.getByLabelText("อุปกรณ์และเบราว์เซอร์"), { target: { value: "Pixel Chrome" } });
  fireEvent.change(screen.getByLabelText("ผลทดสอบ QR"), { target: { value: "passed" } });
}
it("keeps the photo picker absent when the rollout is disabled", () => {
  render(<NfcFieldChecks tag={tag} canManage />);
  fill(); expect(screen.queryByLabelText("เลือกรูปหลักฐาน")).not.toBeInTheDocument();
});
it("blocks report writes during upload and preserves photo IDs across uncertain retries", async () => {
  let finish!: (value: unknown) => void;
  mocks.upload.mockImplementation((_file, _context, stage) => { stage("uploading"); return new Promise(resolve => { finish = resolve; }); });
  mocks.save.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ success: true });
  render(<NfcFieldChecks tag={tag} canManage evidenceEnabled />); fill();
  fireEvent.change(screen.getByLabelText("เลือกรูปหลักฐาน"), { target: { files: [file] } });
  expect(screen.getByRole("button", { name: "บันทึกผลตรวจ" })).toBeDisabled();
  fireEvent.submit(screen.getByLabelText("ตำแหน่งติดตั้ง").closest("form")!);
  expect(mocks.save).not.toHaveBeenCalled();
  finish({ assetId: id, previewFile: file, sizeBytes: 100 });
  await waitFor(() => expect(screen.getByRole("button", { name: "บันทึกผลตรวจ" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "บันทึกผลตรวจ" }));
  const retry = await screen.findByRole("button", { name: "ลองส่งรายการเดิมอีกครั้ง" });
  await waitFor(() => expect(retry).toBeEnabled());
  expect(screen.getByLabelText("เลือกรูปหลักฐาน")).toBeDisabled();
  fireEvent.click(retry);
  await screen.findByText("บันทึกผลตรวจแล้ว สถานะแท็กยังไม่เปลี่ยน");
  expect(mocks.save.mock.calls[0][0].assetIds).toEqual([id]);
  expect(mocks.save.mock.calls[1][0]).toEqual(mocks.save.mock.calls[0][0]);
});
it("requires explicit cancellation after a failed upload", async () => {
  mocks.upload.mockRejectedValue(new Error("offline"));
  const blocked = vi.fn();
  render(<NfcEvidencePicker tagId={id} version={1} disabled={false} onChange={vi.fn()} onBlockedChange={blocked} />);
  fireEvent.change(screen.getByLabelText("เลือกรูปหลักฐาน"), { target: { files: [file] } });
  await screen.findByRole("alert");
  expect(blocked).toHaveBeenLastCalledWith(true);
  fireEvent.click(screen.getByRole("button", { name: "ยกเลิกรูปนี้" }));
  expect(blocked).toHaveBeenLastCalledWith(false);
});
it("revokes local image URLs when a selected photo is removed", async () => {
  mocks.upload.mockResolvedValue({ assetId: id, previewFile: file, sizeBytes: 100 });
  const changed = vi.fn();
  render(<NfcEvidencePicker tagId={id} version={1} disabled={false} onChange={changed} onBlockedChange={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("เลือกรูปหลักฐาน"), { target: { files: [file] } });
  fireEvent.click(await screen.findByRole("button", { name: "เอารูป 1 ออก" }));
  expect(changed).toHaveBeenLastCalledWith([]); expect(mocks.revoke).toHaveBeenCalledWith("blob:local-test");
});
it("loads historical photos only on demand and offers expired-image recovery", async () => {
  mocks.load.mockResolvedValue("https://private.test/timed");
  render(<NfcEvidencePhoto assetId={id} tagId={id} position={1} />);
  expect(mocks.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "ดูรูปหลักฐาน 1" }));
  const image = await screen.findByRole("img");
  expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  fireEvent.error(image);
  expect(await screen.findByRole("alert")).toHaveTextContent("หมดอายุ");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

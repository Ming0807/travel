import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NfcCreateForm, NfcTagControls, NfcTagHistory } from "@/components/admin/checkin-codes/NfcManagementForms";
import type { AdminNfcTag } from "@/lib/repositories/admin-nfc.repository";

const actions = vi.hoisted(() => ({ save: vi.fn(), history: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: actions.refresh }) }));
vi.mock("@phosphor-icons/react", () => ({ CheckCircle: () => null, Copy: () => null, Plus: () => null, Warning: () => null }));
vi.mock("@/app/actions/admin-nfc-actions", () => ({ saveAdminNfcAction: actions.save, getAdminNfcHistoryAction: actions.history }));

const tag: AdminNfcTag = {
  nfc_tag_id: "11111111-1111-4111-8111-111111111111", public_token: "22222222-2222-4222-8222-222222222222",
  checkin_code_id: 10, code_snapshot: "fixture", label: "Test tag", status: "inactive", version: 2,
  verified_at: "2026-09-05T00:00:00Z", verification_reference: "Test evidence", replaces_tag_id: null,
  created_at: "2026-09-05T00:00:00Z", updated_at: "2026-09-05T00:00:00Z",
};

describe("NFC lifecycle forms", () => {
  beforeEach(() => { vi.clearAllMocks(); actions.save.mockResolvedValue({ success: true }); });

  it("sends the new default command after refreshed status changes", async () => {
    const view = render(<NfcTagControls tag={tag} payload={null} />);
    view.rerender(<NfcTagControls tag={{ ...tag, status: "active", version: 3 }} payload={null} />);
    expect(screen.getByRole("combobox")).toHaveValue("inactive");
    fireEvent.change(screen.getByLabelText("เหตุผล"), { target: { value: "Pause for maintenance" } });
    fireEvent.submit(screen.getByRole("button", { name: "บันทึกสถานะ" }).closest("form")!);
    await waitFor(() => expect(actions.save).toHaveBeenCalledWith("change", expect.objectContaining({ version: 3, status: "inactive" })));
  });

  it("clears destructive intent and confirmation when the server version changes", () => {
    const view = render(<NfcTagControls tag={tag} payload={null} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "revoked" } });
    fireEvent.click(screen.getByRole("checkbox"));
    view.rerender(<NfcTagControls tag={{ ...tag, version: 3 }} payload={null} />);
    expect(screen.getByRole("combobox")).toHaveValue("active");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("allows revoking an unverified draft without requiring a read-back URL", async () => {
    render(<NfcTagControls tag={{ ...tag, status: "draft", verified_at: null }} payload={null} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "revoked" } });
    expect(screen.queryByLabelText("URL ที่อ่านกลับจากแท็ก")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeRequired();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("เหตุผล"), { target: { value: "Damaged before deployment" } });
    const submit = screen.getByRole("button", { name: "บันทึกสถานะ" });
    expect(submit).toBeEnabled();
    fireEvent.submit(submit.closest("form")!);
    await waitFor(() => expect(actions.save).toHaveBeenCalledWith("change", expect.objectContaining({ operation: "status", status: "revoked" })));
  });

  it("discards loaded history when switching tags", async () => {
    actions.history.mockResolvedValue({ success: true, rows: [{ version: 2, event_type: "deactivated", status: "inactive", reason: "Old tag maintenance", occurred_at: tag.updated_at }], nextVersion: null });
    const view = render(<NfcTagHistory tagId={tag.nfc_tag_id} />);
    fireEvent.click(screen.getByRole("button", { name: "ดูประวัติการเปลี่ยนแปลง" }));
    await screen.findByText("Old tag maintenance");
    view.rerender(<NfcTagHistory tagId={tag.public_token} />);
    expect(screen.queryByText("Old tag maintenance")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ดูประวัติการเปลี่ยนแปลง" })).toBeEnabled();
  });

  it("reloads history from the first page after a new server version", async () => {
    actions.history.mockResolvedValue({ success: true, rows: [{ version: 2, event_type: "deactivated", status: "inactive", reason: "Earlier event", occurred_at: tag.updated_at }], nextVersion: 2 });
    const view = render(<NfcTagHistory tagId={tag.nfc_tag_id} version={2} />);
    fireEvent.click(screen.getByRole("button", { name: "ดูประวัติการเปลี่ยนแปลง" }));
    await screen.findByText("Earlier event");
    view.rerender(<NfcTagHistory tagId={tag.nfc_tag_id} version={3} />);
    fireEvent.click(screen.getByRole("button", { name: "ดูประวัติการเปลี่ยนแปลง" }));
    await waitFor(() => expect(actions.history).toHaveBeenLastCalledWith({ tagId: tag.nfc_tag_id, beforeVersion: undefined }));
  });

  it("preserves the reason for retry and does not refresh on failed saves", async () => {
    actions.save.mockResolvedValue({ success: false, message: "Temporary failure" });
    render(<NfcTagControls tag={tag} payload={null} />);
    fireEvent.change(screen.getByLabelText("เหตุผล"), { target: { value: "Reopen after maintenance" } });
    fireEvent.submit(screen.getByRole("button", { name: "บันทึกสถานะ" }).closest("form")!);
    await screen.findByText("Temporary failure");
    expect(screen.getByLabelText("เหตุผล")).toHaveValue("Reopen after maintenance");
    expect(actions.refresh).not.toHaveBeenCalled();
  });

  it("links a replacement result to the exact saved tag", async () => {
    const href = `/admin/checkin-codes/10/nfc?tagId=${tag.public_token}`;
    actions.save.mockResolvedValue({ success: true, tagHref: href });
    render(<NfcCreateForm checkinCodeId={10} replacesTagId={tag.nfc_tag_id} />);
    fireEvent.click(screen.getByText("สร้างแท็กทดแทน"));
    fireEvent.change(screen.getByLabelText("ชื่ออ้างอิงแท็ก"), { target: { value: "Replacement" } });
    fireEvent.change(screen.getByLabelText("เหตุผลการเพิ่ม"), { target: { value: "Broken tag" } });
    fireEvent.submit(screen.getByRole("button", { name: "สร้างแท็กฉบับร่าง" }).closest("form")!);
    expect(await screen.findByRole("link", { name: "เปิดแท็กที่บันทึก" })).toHaveAttribute("href", href);
    expect(actions.save).toHaveBeenCalledWith("create", expect.objectContaining({ replacesTagId: tag.nfc_tag_id, checkinCodeId: 10 }));
  });

  it("shows an audit action and actor without relying only on a reason", async () => {
    actions.history.mockResolvedValue({ success: true, rows: [{ version: 2, event_type: "verified", status: "draft", actor_name: "Test staff", reason: "Read-back inspection", occurred_at: tag.updated_at }], nextVersion: null });
    render(<NfcTagHistory tagId={tag.nfc_tag_id} />);
    fireEvent.click(screen.getByRole("button", { name: "ดูประวัติการเปลี่ยนแปลง" }));
    expect(await screen.findByText("ผู้ดำเนินการ: Test staff")).toBeInTheDocument();
    expect(screen.getByText("ตรวจสอบ URL · สถานะ: ฉบับร่าง")).toBeInTheDocument();
  });
});

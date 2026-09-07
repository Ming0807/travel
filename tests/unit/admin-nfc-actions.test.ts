import { beforeEach, describe, expect, it, vi } from "vitest";

const service = vi.hoisted(() => ({ createNfcTag: vi.fn(), changeNfcTag: vi.fn(), getNfcHistory: vi.fn() }));
const revalidatePath = vi.hoisted(() => vi.fn());
vi.mock("@/lib/services/admin-nfc.service", () => service);
vi.mock("next/cache", () => ({ revalidatePath }));
import { getAdminNfcHistoryAction, saveAdminNfcAction } from "@/app/actions/admin-nfc-actions";

describe("NFC server action boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.createNfcTag.mockResolvedValue({ checkin_code_id: 10, nfc_tag_id: "11111111-1111-4111-8111-111111111111" });
    service.changeNfcTag.mockResolvedValue({ checkin_code_id: 10 });
  });

  it.each(["delete", "", null, {}, 1])("rejects unknown commands before dispatch (%s)", async (operation) => {
    expect(await saveAdminNfcAction(operation, {})).toMatchObject({ success: false });
    expect(service.changeNfcTag).not.toHaveBeenCalled();
    expect(service.createNfcTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each(["create", "change"] as const)("invalidates only the saved tag's code after %s", async (operation) => {
    const result = await saveAdminNfcAction(operation, { checkinCodeId: 999 });
    expect(result).toMatchObject({ success: true });
    if (operation === "create") expect(result).toHaveProperty("tagHref", "/admin/checkin-codes/10/nfc?tagId=11111111-1111-4111-8111-111111111111");
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/admin/checkin-codes/10/nfc");
  });

  it("does not expose backend errors or refresh after a failed write", async () => {
    service.changeNfcTag.mockRejectedValue(new Error("private database detail"));
    const result = await saveAdminNfcAction("change", {});
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("private database detail");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not return private history errors", async () => {
    service.getNfcHistory.mockRejectedValue(new Error("private actor detail"));
    const result = await getAdminNfcHistoryAction({});
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("private actor detail");
  });
});

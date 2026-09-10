import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({guard:vi.fn(),tag:vi.fn(),process:vi.fn(),upload:vi.fn()}));
vi.mock("@/lib/auth/guards",()=>({requirePermission:mocks.guard}));
vi.mock("@/lib/repositories/admin-nfc.repository",()=>({readAdminNfcTag:mocks.tag}));
vi.mock("@/lib/services/nfc-evidence-image.service",()=>({processNfcEvidenceImage:mocks.process}));
vi.mock("@/lib/services/nfc-recoverable-upload.service",()=>({uploadProcessedNfcEvidenceRecoverably:mocks.upload}));
import { uploadNfcEvidenceRecoverably } from "@/lib/services/nfc-recoverable-source.service";
const context={requestId:"10000000-0000-4000-8000-000000000001",tagId:"30000000-0000-4000-8000-000000000001",version:1};
const file={type:"image/jpeg",size:3,arrayBuffer:async()=>new ArrayBuffer(3)};
beforeEach(()=>{vi.resetAllMocks();mocks.guard.mockResolvedValue({adminId:"admin"});mocks.tag.mockResolvedValue({version:1,status:"draft"});
  mocks.process.mockResolvedValue({buffer:Buffer.from("processed")});mocks.upload.mockResolvedValue({assetId:"result"});});
it("uses the shared processor and preserves request identity",async()=>{
  expect(await uploadNfcEvidenceRecoverably(context,file)).toEqual({assetId:"result"});
  expect(mocks.upload).toHaveBeenCalledWith(context,Buffer.from("processed"));
  expect(mocks.process).toHaveBeenCalledWith(file);
});
it("rejects unauthorized callers before processing",async()=>{
  mocks.guard.mockRejectedValue(new Error("FORBIDDEN"));await expect(uploadNfcEvidenceRecoverably(context,file)).rejects.toThrow("FORBIDDEN");
  expect(mocks.tag).not.toHaveBeenCalled();expect(mocks.process).not.toHaveBeenCalled();
});
it.each([null,{version:2,status:"draft"},{version:1,status:"revoked"}])("rejects invalid tag before image work",async tag=>{
  mocks.tag.mockResolvedValue(tag);await expect(uploadNfcEvidenceRecoverably(context,file)).rejects.toThrow();expect(mocks.process).not.toHaveBeenCalled();
});
it("does not prepare/upload if image processing fails",async()=>{
  mocks.process.mockRejectedValue(new Error("IMAGE_INVALID"));await expect(uploadNfcEvidenceRecoverably(context,file)).rejects.toThrow("IMAGE_INVALID");expect(mocks.upload).not.toHaveBeenCalled();
});

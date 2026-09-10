import sharp from "sharp";
import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({guard:vi.fn(),prepare:vi.fn(),upload:vi.fn(),confirm:vi.fn(),destination:vi.fn()}));
vi.mock("@/lib/auth/guards",()=>({requirePermission:mocks.guard}));
vi.mock("@/lib/repositories/nfc-upload-intent.repository",()=>({prepareNfcEvidenceUpload:mocks.prepare}));
vi.mock("@/lib/storage/nfc-prepared-storage",()=>({getNfcUploadDestination:mocks.destination,uploadPreparedNfcEvidence:mocks.upload}));
vi.mock("@/lib/services/nfc-evidence-confirmation.service",()=>({confirmNfcEvidenceUpload:mocks.confirm}));
import { uploadProcessedNfcEvidenceRecoverably } from "@/lib/services/nfc-recoverable-upload.service";
const actor="20000000-0000-4000-8000-000000000001",asset="40000000-0000-4000-8000-000000000001";
const context={requestId:"10000000-0000-4000-8000-000000000001",tagId:"30000000-0000-4000-8000-000000000001",version:1};
async function image(){return sharp({create:{width:2,height:3,channels:3,background:"white"}}).webp().toBuffer();}
beforeEach(()=>{vi.resetAllMocks();mocks.guard.mockResolvedValue({adminId:actor});
  mocks.destination.mockReturnValue({provider:"supabase",provider_account:"account",storage_prefix:"nfc-evidence"});
  mocks.prepare.mockImplementation(async binding=>({...binding,asset_id:asset,state:"prepared",created_at:new Date().toISOString()}));
  mocks.upload.mockResolvedValue({storagePath:`nfc-evidence/${asset}.webp`});mocks.confirm.mockResolvedValue({assetId:asset,width:2,height:3,sizeBytes:100});});
it("persists the content-bound intent before any upload and confirms afterwards",async()=>{
  await uploadProcessedNfcEvidenceRecoverably(context,await image());
  expect(mocks.prepare.mock.calls[0][0]).toMatchObject({request_id:context.requestId,actor_id:actor,nfc_tag_id:context.tagId,width:2,height:3});
  expect(mocks.prepare.mock.invocationCallOrder[0]).toBeLessThan(mocks.upload.mock.invocationCallOrder[0]);
  expect(mocks.upload.mock.invocationCallOrder[0]).toBeLessThan(mocks.confirm.mock.invocationCallOrder[0]);
});
it("does no provider work when authorization or preparation fails",async()=>{
  const bytes=await image();mocks.guard.mockRejectedValueOnce(new Error("FORBIDDEN"));
  await expect(uploadProcessedNfcEvidenceRecoverably(context,bytes)).rejects.toThrow("FORBIDDEN");expect(mocks.prepare).not.toHaveBeenCalled();
  mocks.prepare.mockRejectedValueOnce(new Error("DATABASE_UNAVAILABLE"));
  await expect(uploadProcessedNfcEvidenceRecoverably(context,bytes)).rejects.toThrow("DATABASE_UNAVAILABLE");expect(mocks.upload).not.toHaveBeenCalled();
});
it("recovers an ambiguous upload by confirming the same asset once",async()=>{
  mocks.upload.mockRejectedValue(new Error("STORAGE_UPLOAD_FAILED"));
  await expect(uploadProcessedNfcEvidenceRecoverably(context,await image())).resolves.toMatchObject({assetId:asset});
  expect(mocks.confirm).toHaveBeenCalledExactlyOnceWith({assetId:asset});expect(mocks.prepare).toHaveBeenCalledOnce();
});
it("does not loop or create new intent if recovery is unavailable",async()=>{
  mocks.upload.mockRejectedValue(new Error("STORAGE_UPLOAD_FAILED"));mocks.confirm.mockRejectedValue(new Error("NFC_READBACK_UNAVAILABLE"));
  await expect(uploadProcessedNfcEvidenceRecoverably(context,await image())).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
  expect(mocks.upload).toHaveBeenCalledOnce();expect(mocks.confirm).toHaveBeenCalledOnce();
});
it.each(["available","abandoned"])("does not upload terminal state %s again",async state=>{
  mocks.prepare.mockImplementation(async binding=>({...binding,asset_id:asset,state}));
  const pending=uploadProcessedNfcEvidenceRecoverably(context,await image());
  if(state==="available") await expect(pending).resolves.toMatchObject({assetId:asset});
  else await expect(pending).rejects.toThrow("NFC_UPLOAD_ABANDONED");
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("rejects stale prepared intents before provider work",async()=>{
  mocks.prepare.mockImplementation(async binding=>({...binding,asset_id:asset,state:"prepared",created_at:"2020-01-01T00:00:00Z"}));
  await expect(uploadProcessedNfcEvidenceRecoverably(context,await image())).rejects.toThrow("NFC_UPLOAD_EXPIRED");expect(mocks.upload).not.toHaveBeenCalled();
});
it("rejects unsupported source bytes before preparing",async()=>{
  await expect(uploadProcessedNfcEvidenceRecoverably(context,Buffer.from("not webp"))).rejects.toThrow("NFC_UPLOAD_CONTENT_MISMATCH");expect(mocks.prepare).not.toHaveBeenCalled();
});

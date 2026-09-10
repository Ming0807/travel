import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({guard:vi.fn(),read:vi.fn(),verify:vi.fn(),finalize:vi.fn(),discover:vi.fn()}));
vi.mock("@/lib/auth/guards",()=>({requirePermission:mocks.guard}));
vi.mock("@/lib/repositories/nfc-upload-intent.repository",()=>({readOwnedNfcUploadIntent:mocks.read,finalizeNfcEvidenceUpload:mocks.finalize}));
vi.mock("@/lib/storage/nfc-evidence-readback",()=>({verifyNfcEvidenceReadback:mocks.verify}));
vi.mock("@/lib/storage/nfc-evidence-discovery",()=>({discoverNfcEvidenceLocator:mocks.discover}));
import { confirmNfcEvidenceUpload } from "@/lib/services/nfc-evidence-confirmation.service";
const asset="40000000-0000-4000-8000-000000000001",actor="20000000-0000-4000-8000-000000000001";
const path=`nfc-evidence/${asset}.webp`;
const intent={asset_id:asset,actor_id:actor,provider:"supabase",provider_account:"account",object_key:path,
  state:"prepared",created_at:new Date().toISOString(),storage_path:null,sha256:"a".repeat(64),size_bytes:1000,width:2,height:3};
beforeEach(()=>{vi.resetAllMocks();mocks.guard.mockResolvedValue({adminId:actor});mocks.read.mockResolvedValue(intent);mocks.discover.mockResolvedValue(path);
  mocks.verify.mockResolvedValue({storagePath:path,sha256:intent.sha256,sizeBytes:1000,width:2,height:3});mocks.finalize.mockResolvedValue(asset);});
it("authorizes and verifies owned durable metadata before finalization",async()=>{
  expect(await confirmNfcEvidenceUpload({assetId:asset})).toEqual({assetId:asset,width:2,height:3,sizeBytes:1000});
  expect(mocks.guard).toHaveBeenCalledWith("checkin_code.manage",{unauthenticated:"throw"});
  expect(mocks.read).toHaveBeenCalledWith(asset,actor);
  expect(mocks.verify).toHaveBeenCalledWith({...intent,storage_path:path});
  expect(mocks.verify.mock.invocationCallOrder[0]).toBeLessThan(mocks.finalize.mock.invocationCallOrder[0]);
});
it("denies unauthorized callers before reading",async()=>{
  mocks.guard.mockRejectedValue(new Error("FORBIDDEN"));
  await expect(confirmNfcEvidenceUpload({assetId:asset})).rejects.toThrow("FORBIDDEN");expect(mocks.read).not.toHaveBeenCalled();
});
it.each([null,{...intent,state:"abandoned"},{...intent,actor_id:"wrong"}])("does not verify unavailable/foreign intent",async row=>{
  mocks.read.mockResolvedValue(row);await expect(confirmNfcEvidenceUpload({assetId:asset})).rejects.toThrow();expect(mocks.verify).not.toHaveBeenCalled();
});
it("never finalizes after failed readback",async()=>{
  mocks.verify.mockRejectedValue(new Error("NFC_READBACK_CONTENT_MISMATCH"));
  await expect(confirmNfcEvidenceUpload({assetId:asset})).rejects.toThrow("NFC_READBACK_CONTENT_MISMATCH");expect(mocks.finalize).not.toHaveBeenCalled();
});
it("discovers a lost Cloudinary version before independent readback",async()=>{
  const cloud={...intent,provider:"cloudinary",object_key:`tourism/nfc-evidence/${asset}`};
  mocks.read.mockResolvedValue(cloud);
  const locator=`cloudinary:image:authenticated:v123:webp:${cloud.object_key}`;mocks.discover.mockResolvedValue(locator);
  await confirmNfcEvidenceUpload({assetId:asset});
  expect(mocks.verify).toHaveBeenCalledWith({...cloud,storage_path:locator});
});
it("rejects browser-supplied content metadata",async()=>{
  await expect(confirmNfcEvidenceUpload({assetId:asset,sha256:"b".repeat(64)})).rejects.toThrow();expect(mocks.read).not.toHaveBeenCalled();
});
it("revalidates available retries through the authoritative finalize RPC",async()=>{
  mocks.read.mockResolvedValue({...intent,state:"available",storage_path:path});
  await expect(confirmNfcEvidenceUpload({assetId:asset})).resolves.toMatchObject({assetId:asset});
  expect(mocks.finalize).toHaveBeenCalledOnce();
});
it("does not return success after an ambiguous finalize acknowledgement",async()=>{
  mocks.finalize.mockRejectedValue(new Error("NFC_UPLOAD_RESPONSE_INVALID"));
  await expect(confirmNfcEvidenceUpload({assetId:asset})).rejects.toThrow("NFC_UPLOAD_RESPONSE_INVALID");
});
it("refuses a changed locator on an already finalized intent",async()=>{
  mocks.read.mockResolvedValue({...intent,state:"available",storage_path:path});
  await expect(confirmNfcEvidenceUpload({assetId:asset,storagePath:"different"})).rejects.toThrow("NFC_UPLOAD_FINALIZE_CONFLICT");
  expect(mocks.verify).not.toHaveBeenCalled();
});
it("stops before readback/finalize when exact locator discovery fails",async()=>{
  mocks.discover.mockRejectedValue(new Error("NFC_UPLOAD_DISCOVERY_UNAVAILABLE"));
  await expect(confirmNfcEvidenceUpload({assetId:asset})).rejects.toThrow("NFC_UPLOAD_DISCOVERY_UNAVAILABLE");
  expect(mocks.verify).not.toHaveBeenCalled();expect(mocks.finalize).not.toHaveBeenCalled();
});
it.each(["invalid", new Date(Date.now()-86400000).toISOString(), new Date(Date.now()+3600000).toISOString()])("rejects ineligible prepared timestamp %s before provider access",async created_at=>{
  mocks.read.mockResolvedValue({...intent,created_at});
  await expect(confirmNfcEvidenceUpload({assetId:asset})).rejects.toThrow("NFC_UPLOAD_EXPIRED");
  expect(mocks.discover).not.toHaveBeenCalled();expect(mocks.verify).not.toHaveBeenCalled();expect(mocks.finalize).not.toHaveBeenCalled();
});
it("lets SQL revalidate old available intents rather than expiring finalized history",async()=>{
  mocks.read.mockResolvedValue({...intent,state:"available",storage_path:path,created_at:"2020-01-01T00:00:00Z"});
  await expect(confirmNfcEvidenceUpload({assetId:asset})).resolves.toMatchObject({assetId:asset});
  expect(mocks.finalize).toHaveBeenCalledOnce();
});

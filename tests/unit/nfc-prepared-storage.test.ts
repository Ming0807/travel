import { createHash } from "node:crypto";
import sharp from "sharp";
import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({env:vi.fn(),publicEnv:vi.fn(),upload:vi.fn()}));
vi.mock("@/lib/config/server-env",()=>({getServerEnv:mocks.env}));
vi.mock("@/lib/config/public-env",()=>({getPublicEnv:mocks.publicEnv}));
vi.mock("@/lib/storage/private-files",()=>({uploadPrivateFile:mocks.upload}));
import { getNfcUploadDestination, uploadPreparedNfcEvidence } from "@/lib/storage/nfc-prepared-storage";
const asset="40000000-0000-4000-8000-000000000001";
beforeEach(()=>{
  vi.resetAllMocks();
  mocks.env.mockReturnValue({STORAGE_PROVIDER:"supabase",CLOUDINARY_CLOUD_NAME:"test-cloud",CLOUDINARY_UPLOAD_FOLDER:"tourism"});
  mocks.publicEnv.mockReturnValue({NEXT_PUBLIC_SUPABASE_URL:"https://test.supabase.co"});
  mocks.upload.mockResolvedValue({provider:"supabase",storagePath:`nfc-evidence/${asset}.webp`,bucket:"nfc-evidence"});
});
async function fixture(){
  const bytes=await sharp({create:{width:2,height:3,channels:3,background:"white"}}).webp().toBuffer();
  return {bytes,intent:{asset_id:asset,state:"prepared" as const,...getNfcUploadDestination(),
    object_key:`nfc-evidence/${asset}.webp`,sha256:createHash("sha256").update(bytes).digest("hex"),size_bytes:bytes.length,width:2,height:3}};
}
it("uses a credential-free deterministic Supabase endpoint fingerprint",()=>{
  const first=getNfcUploadDestination();
  expect(first.provider_account).toMatch(/^[a-f0-9]{64}$/);
  mocks.publicEnv.mockReturnValue({NEXT_PUBLIC_SUPABASE_URL:"https://test.supabase.co/"});
  expect(getNfcUploadDestination()).toEqual(first);
});
it("uploads matching prepared WebP bytes without overwriting or finalizing",async()=>{
  const {bytes,intent}=await fixture();
  expect((await uploadPreparedNfcEvidence(intent,bytes)).storagePath).toBe(intent.object_key);
  expect(mocks.upload).toHaveBeenCalledWith({bucket:"nfc-evidence",path:intent.object_key,data:bytes,contentType:"image/webp"});
});
it.each(["account","provider","folder"])("blocks changed %s before storage access",async change=>{
  const {bytes,intent}=await fixture();
  if(change==="account") mocks.publicEnv.mockReturnValue({NEXT_PUBLIC_SUPABASE_URL:"https://other.supabase.co"});
  else if(change==="provider") mocks.env.mockReturnValue({...mocks.env(),STORAGE_PROVIDER:"cloudinary"});
  else intent.storage_prefix="other";
  await expect(uploadPreparedNfcEvidence(intent,bytes)).rejects.toThrow("NFC_UPLOAD_DESTINATION_CHANGED");
  expect(mocks.upload).not.toHaveBeenCalled();
});
it.each([{sha256:"b".repeat(64)},{width:9},{height:9},{size_bytes:1},{state:"available"},{state:"abandoned"},{object_key:"public/file.webp"}])("rejects invalid upload binding %j",async patch=>{
  const {bytes,intent}=await fixture();
  await expect(uploadPreparedNfcEvidence({...intent,...patch},bytes)).rejects.toThrow();
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("rejects non-WebP even when its hash matches",async()=>{
  const {intent}=await fixture();
  const bytes=await sharp({create:{width:2,height:3,channels:3,background:"white"}}).png().toBuffer();
  await expect(uploadPreparedNfcEvidence({...intent,sha256:createHash("sha256").update(bytes).digest("hex"),size_bytes:bytes.length},bytes)).rejects.toThrow("NFC_UPLOAD_CONTENT_MISMATCH");
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("validates Cloudinary's exact authenticated returned locator",async()=>{
  mocks.env.mockReturnValue({...mocks.env(),STORAGE_PROVIDER:"cloudinary"});
  const {bytes,intent}=await fixture(); intent.object_key=`tourism/nfc-evidence/${asset}`;
  mocks.upload.mockResolvedValue({provider:"cloudinary",storagePath:`cloudinary:image:authenticated:v123:webp:${intent.object_key}`,bucket:"nfc-evidence"});
  expect((await uploadPreparedNfcEvidence(intent,bytes)).storagePath).toContain(":v123:");
  mocks.upload.mockResolvedValue({provider:"cloudinary",storagePath:`cloudinary:image:upload:v123:webp:${intent.object_key}`,bucket:"nfc-evidence"});
  await expect(uploadPreparedNfcEvidence(intent,bytes)).rejects.toThrow("NFC_UPLOAD_STORAGE_RESPONSE_INVALID");
});
it("does not send caller mutations made while image decoding yields",async()=>{
  const {bytes,intent}=await fixture();
  const original=Buffer.from(bytes);
  const pending=uploadPreparedNfcEvidence(intent,bytes);
  bytes.fill(0);
  await pending;
  expect(mocks.upload.mock.calls[0][0].data).toEqual(original);
});
it("rechecks destination after asynchronous image decoding",async()=>{
  const {bytes,intent}=await fixture();
  mocks.publicEnv.mockReturnValueOnce({NEXT_PUBLIC_SUPABASE_URL:"https://test.supabase.co"})
    .mockReturnValue({NEXT_PUBLIC_SUPABASE_URL:"https://changed.supabase.co"});
  await expect(uploadPreparedNfcEvidence(intent,bytes)).rejects.toThrow("NFC_UPLOAD_DESTINATION_CHANGED");
  expect(mocks.upload).not.toHaveBeenCalled();
});

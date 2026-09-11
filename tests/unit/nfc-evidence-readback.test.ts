import sharp from "sharp";
import { createHash } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({destination:vi.fn(),sign:vi.fn(),publicEnv:vi.fn(),fetch:vi.fn()}));
vi.mock("@/lib/storage/nfc-prepared-storage",()=>({getNfcUploadDestination:mocks.destination}));
vi.mock("@/lib/storage/private-files",()=>({createPrivateFileSignedUrl:mocks.sign}));
vi.mock("@/lib/config/public-env",()=>({getPublicEnv:mocks.publicEnv}));
import { verifyNfcEvidenceReadback, inspectNfcRecoveryReadback } from "@/lib/storage/nfc-evidence-readback";
const asset="40000000-0000-4000-8000-000000000001";
const path=`nfc-evidence/${asset}.webp`;
beforeEach(()=>{
  vi.resetAllMocks(); vi.stubGlobal("fetch",mocks.fetch);
  mocks.destination.mockReturnValue({provider:"supabase",provider_account:"account",storage_prefix:"nfc-evidence"});
  mocks.publicEnv.mockReturnValue({NEXT_PUBLIC_SUPABASE_URL:"https://test.supabase.co"});
  mocks.sign.mockResolvedValue("https://test.supabase.co/storage/v1/object/sign/nfc-evidence/test?token=secret");
});
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
async function fixture(){
  const bytes=await sharp({create:{width:2,height:3,channels:3,background:"white"}}).webp().toBuffer();
  return {bytes,input:{asset_id:asset,...mocks.destination(),object_key:path,storage_path:path,
    sha256:createHash("sha256").update(bytes).digest("hex"),size_bytes:bytes.length,width:2,height:3}};
}
it("reads and validates bytes independently of upload acknowledgement",async()=>{
  const {bytes,input}=await fixture(); mocks.fetch.mockResolvedValue(new Response(Uint8Array.from(bytes)));
  expect(await verifyNfcEvidenceReadback(input)).toEqual({storagePath:path,sha256:input.sha256,sizeBytes:bytes.length,width:2,height:3});
  expect(mocks.sign).toHaveBeenCalledWith("nfc-evidence",path,60);
  expect(mocks.fetch.mock.calls[0][1]).toMatchObject({redirect:"error",cache:"no-store"});
});
it.each([401,403,404,500])("does not treat HTTP %s as absence or permission to delete",async status=>{
  const {input}=await fixture();mocks.fetch.mockResolvedValue(new Response(null,{status}));
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
});
it("rejects another host before requesting it",async()=>{
  const {input}=await fixture();mocks.sign.mockResolvedValue("https://attacker.test/image");
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_URL_INVALID");
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it("rejects changed destination before signing",async()=>{
  const {input}=await fixture();mocks.destination.mockReturnValue({...mocks.destination(),provider_account:"other"});
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_UPLOAD_DESTINATION_CHANGED");
  expect(mocks.sign).not.toHaveBeenCalled();
});
it("rejects oversized streamed content without trusting headers",async()=>{
  const {input}=await fixture(); const cancel=vi.fn();
  mocks.fetch.mockResolvedValue(new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(input.size_bytes+1));},cancel})));
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_CONTENT_MISMATCH");
  expect(cancel).toHaveBeenCalled();
});
it("rejects wrong bytes and mismatched dimensions",async()=>{
  const {bytes,input}=await fixture();mocks.fetch.mockResolvedValueOnce(new Response(Buffer.alloc(bytes.length)));
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_CONTENT_MISMATCH");
  mocks.fetch.mockResolvedValueOnce(new Response(Uint8Array.from(bytes)));
  await expect(verifyNfcEvidenceReadback({...input,width:9})).rejects.toThrow("NFC_READBACK_CONTENT_MISMATCH");
});
it("sanitizes signed URL and network errors",async()=>{
  const {input}=await fixture();mocks.fetch.mockRejectedValue(new Error("secret signed URL"));
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
});
it("aborts a stalled fetch after the bounded readback deadline",async()=>{
  const {input}=await fixture();vi.useFakeTimers();
  try {
    mocks.fetch.mockImplementation((_url,options)=>new Promise((_resolve,reject)=>{
      options.signal.addEventListener("abort",()=>reject(new Error("aborted secret URL")),{once:true});
    }));
    const result=expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
    await vi.advanceTimersByTimeAsync(15001);await result;
    expect(mocks.fetch.mock.calls[0][1].signal.aborted).toBe(true);
  } finally {vi.useRealTimers();}
});
it("rechecks the pinned destination after asynchronous signing",async()=>{
  const {input}=await fixture();
  mocks.sign.mockImplementation(async()=>{
    mocks.destination.mockReturnValue({...mocks.destination(),provider_account:"changed"});
    return "https://test.supabase.co/storage/v1/object/sign/nfc-evidence/test?token=secret";
  });
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_UPLOAD_DESTINATION_CHANGED");
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it("bounds stalled signing and never fetches a late signed URL",async()=>{
  const {input}=await fixture();vi.useFakeTimers();
  let resolve!: (value:string)=>void;
  mocks.sign.mockReturnValue(new Promise(value=>{resolve=value;}));
  const result=expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
  await vi.advanceTimersByTimeAsync(15000);await result;
  resolve("https://test.supabase.co/storage/v1/object/sign/nfc-evidence/test?token=secret");
  await Promise.resolve();
  expect(mocks.fetch).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
it("returns verified metadata only after validating actual bytes",async()=>{
  const {bytes,input}=await fixture();mocks.fetch.mockResolvedValue(new Response(Uint8Array.from(bytes)));
  expect(await inspectNfcRecoveryReadback(input)).toEqual({status:"verified",content:{storagePath:path,
    sha256:input.sha256,sizeBytes:bytes.length,width:2,height:3}});
});
it("observes a signed endpoint 404 without changing the browser error contract",async()=>{
  const {input}=await fixture();mocks.fetch.mockImplementation(async()=>new Response(null,{status:404}));
  expect(await inspectNfcRecoveryReadback(input)).toEqual({status:"absent"});
  await expect(verifyNfcEvidenceReadback(input)).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
});
it.each([401,403,429,500])("keeps worker HTTP %s retryable and private",async status=>{
  const {input}=await fixture();mocks.fetch.mockResolvedValue(new Response(null,{status}));
  expect(await inspectNfcRecoveryReadback(input)).toEqual({status:"provider_unavailable"});
});
it("does not report absence after a namespace change during fetch",async()=>{
  const {input}=await fixture();mocks.fetch.mockImplementation(async()=>{
    mocks.destination.mockReturnValue({...mocks.destination(),provider_account:"changed"});
    return new Response(null,{status:404});
  });
  expect(await inspectNfcRecoveryReadback(input)).toEqual({status:"namespace_changed"});
});
it("routes content mismatch to review without returning private bytes",async()=>{
  const {input}=await fixture();mocks.fetch.mockResolvedValue(new Response("not an image"));
  expect(await inspectNfcRecoveryReadback(input)).toEqual({status:"content_conflict"});
});

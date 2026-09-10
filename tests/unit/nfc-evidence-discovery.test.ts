import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({env:vi.fn(),destination:vi.fn(),resource:vi.fn()}));
vi.mock("@/lib/config/server-env",()=>({getServerEnv:mocks.env}));
vi.mock("@/lib/storage/nfc-prepared-storage",()=>({getNfcUploadDestination:mocks.destination}));
vi.mock("cloudinary",()=>({v2:{api:{resource:mocks.resource}}}));
import { discoverNfcEvidenceLocator } from "@/lib/storage/nfc-evidence-discovery";
const asset="40000000-0000-4000-8000-000000000001";
const intent={asset_id:asset,provider:"cloudinary",provider_account:"test-cloud",storage_prefix:"tourism/nfc-evidence",object_key:`tourism/nfc-evidence/${asset}`};
beforeEach(()=>{vi.resetAllMocks();mocks.destination.mockReturnValue({provider:intent.provider,provider_account:intent.provider_account,storage_prefix:intent.storage_prefix});
  mocks.env.mockReturnValue({CLOUDINARY_CLOUD_NAME:"test-cloud",CLOUDINARY_API_KEY:"test-key",CLOUDINARY_API_SECRET:"test-secret"});
  mocks.resource.mockResolvedValue({public_id:intent.object_key,resource_type:"image",type:"authenticated",format:"webp",version:123});});
it("queries only the exact authenticated image with pinned account options",async()=>{
  expect(await discoverNfcEvidenceLocator(intent)).toBe(`cloudinary:image:authenticated:v123:webp:${intent.object_key}`);
  expect(mocks.resource).toHaveBeenCalledWith(intent.object_key,expect.objectContaining({cloud_name:"test-cloud",resource_type:"image",type:"authenticated",timeout:15000}));
});
it.each([{public_id:"other"},{type:"upload"},{format:"jpg"},{version:0},{version:1.2},{resource_type:"raw"}])("rejects conflicting metadata %j",async patch=>{
  mocks.resource.mockResolvedValue({...await mocks.resource(),...patch});
  await expect(discoverNfcEvidenceLocator(intent)).rejects.toThrow("NFC_UPLOAD_DISCOVERY_CONFLICT");
});
it.each([404,403,500])("keeps %s unavailable rather than declaring safe absence",async http_code=>{
  mocks.resource.mockRejectedValue({error:{http_code,message:"private detail"}});
  await expect(discoverNfcEvidenceLocator(intent)).rejects.toThrow("NFC_UPLOAD_DISCOVERY_UNAVAILABLE");
});
it("blocks changed cloud before calling the provider",async()=>{
  mocks.destination.mockReturnValue({...mocks.destination(),provider_account:"different"});
  await expect(discoverNfcEvidenceLocator(intent)).rejects.toThrow("NFC_UPLOAD_DESTINATION_CHANGED");expect(mocks.resource).not.toHaveBeenCalled();
});
it("returns the deterministic Supabase key without listing storage",async()=>{
  const supabase={...intent,provider:"supabase",provider_account:"project",storage_prefix:"nfc-evidence",object_key:`nfc-evidence/${asset}.webp`};
  mocks.destination.mockReturnValue(supabase);
  expect(await discoverNfcEvidenceLocator(supabase)).toBe(supabase.object_key);expect(mocks.resource).not.toHaveBeenCalled();
});

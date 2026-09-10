import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({ rpc:vi.fn() }));
vi.mock("@/lib/supabase/service-role",()=>({ createSupabaseServiceRoleClient:()=>mocks }));
import { prepareNfcEvidenceUpload, finalizeNfcEvidenceUpload, abandonStaleNfcEvidenceUpload } from "@/lib/repositories/nfc-upload-intent.repository";
const input={
  request_id:"10000000-0000-4000-8000-000000000001",actor_id:"20000000-0000-4000-8000-000000000001",
  nfc_tag_id:"30000000-0000-4000-8000-000000000001",tag_version:1,provider:"supabase",
  provider_account:"test-project",storage_prefix:"nfc-evidence",sha256:"a".repeat(64),size_bytes:1000,width:640,height:480,
};
const asset="40000000-0000-4000-8000-000000000001";
const row={...input,asset_id:asset,object_key:`nfc-evidence/${asset}.webp`,state:"prepared",created_at:"2026-09-10T00:00:00+00:00",finalized_at:null,abandoned_at:null,storage_path:null};
beforeEach(()=>{vi.resetAllMocks();mocks.rpc.mockResolvedValue({data:[row],error:null});});
it("validates the durable binding and sends only preparation metadata",async()=>{
  expect(await prepareNfcEvidenceUpload(input)).toEqual(row);
  expect(mocks.rpc).toHaveBeenCalledWith("prepare_nfc_evidence_upload",{
    p_request_id:input.request_id,p_tag_id:input.nfc_tag_id,p_version:1,p_actor_id:input.actor_id,
    p_provider:"supabase",p_account:"test-project",p_prefix:"nfc-evidence",p_sha256:input.sha256,p_size:1000,p_width:640,p_height:480,
  });
});
it.each([
  {actor_id:"50000000-0000-4000-8000-000000000001"},{sha256:"b".repeat(64)},
  {provider_account:"changed"},{object_key:"public/file.webp"},{tag_version:2},
  {state:"available"},{created_at:"not-a-date"},
])("rejects mismatched or malformed RPC data %j",async patch=>{
  mocks.rpc.mockResolvedValue({data:[{...row,...patch}],error:null});
  await expect(prepareNfcEvidenceUpload(input)).rejects.toThrow("NFC_UPLOAD_RESPONSE_INVALID");
});
it.each([null,[],[row,row]])("rejects missing or ambiguous RPC rows",async data=>{
  mocks.rpc.mockResolvedValue({data,error:null});
  await expect(prepareNfcEvidenceUpload(input)).rejects.toThrow("NFC_UPLOAD_RESPONSE_INVALID");
});
it("accepts a pinned Cloudinary public ID without inventing a version",async()=>{
  const cloud={...input,provider:"cloudinary",provider_account:"test-cloud",storage_prefix:"project/nfc-evidence"};
  mocks.rpc.mockResolvedValue({data:[{...row,...cloud,object_key:`project/nfc-evidence/${asset}`}],error:null});
  expect((await prepareNfcEvidenceUpload(cloud)).object_key).toBe(`project/nfc-evidence/${asset}`);
});
it.each([
  {state:"available",finalized_at:"2026-09-10T01:00:00+00:00",storage_path:row.object_key},
  {state:"abandoned",abandoned_at:"2026-09-11T01:00:00+00:00"},
])("returns validated terminal state on retry without implying another upload %j",async lifecycle=>{
  mocks.rpc.mockResolvedValue({data:[{...row,...lifecycle}],error:null});
  expect((await prepareNfcEvidenceUpload(input)).state).toBe(lifecycle.state);
});
it.each([{storage_prefix:"../nfc-evidence"},{provider_account:"https://user:secret@host"},{size_bytes:2097153}])("rejects invalid preparation before database access %j",async patch=>{
  await expect(prepareNfcEvidenceUpload({...input,...patch})).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("preserves bounded conflict codes without leaking database details",async()=>{
  mocks.rpc.mockResolvedValue({data:null,error:{message:"NFC_UPLOAD_REQUEST_CONFLICT"}});
  await expect(prepareNfcEvidenceUpload(input)).rejects.toThrow("NFC_UPLOAD_REQUEST_CONFLICT");
  mocks.rpc.mockResolvedValue({data:null,error:{message:"private database detail"}});
  await expect(prepareNfcEvidenceUpload(input)).rejects.toThrow("NFC_UPLOAD_PREPARE_FAILED");
});
const verification={assetId:asset,actorId:input.actor_id,providerAccount:input.provider_account,
  storagePath:row.object_key,sha256:input.sha256,sizeBytes:1000,width:640,height:480};
it("finalizes only the exact acknowledged asset",async()=>{
  mocks.rpc.mockResolvedValue({data:asset,error:null});
  expect(await finalizeNfcEvidenceUpload(verification)).toBe(asset);
  expect(mocks.rpc).toHaveBeenCalledWith("finalize_nfc_evidence_upload",{
    p_asset_id:asset,p_actor_id:input.actor_id,p_account:input.provider_account,p_path:row.object_key,
    p_sha256:input.sha256,p_size:1000,p_width:640,p_height:480,
  });
});
it.each([null,true,[],"50000000-0000-4000-8000-000000000001"])("rejects ambiguous finalization acknowledgement %j",async data=>{
  mocks.rpc.mockResolvedValue({data,error:null});
  await expect(finalizeNfcEvidenceUpload(verification)).rejects.toThrow("NFC_UPLOAD_RESPONSE_INVALID");
});
it("requires explicit abandonment acknowledgement",async()=>{
  mocks.rpc.mockResolvedValue({data:true,error:null});
  await expect(abandonStaleNfcEvidenceUpload({assetId:asset,operatorId:input.actor_id})).resolves.toBe(true);
  expect(mocks.rpc).toHaveBeenCalledWith("abandon_stale_nfc_evidence_upload",{p_asset_id:asset,p_operator_id:input.actor_id});
  mocks.rpc.mockResolvedValue({data:false,error:null});
  await expect(abandonStaleNfcEvidenceUpload({assetId:asset,operatorId:input.actor_id})).rejects.toThrow("NFC_UPLOAD_RESPONSE_INVALID");
});
it("preserves terminal-state refusals but sanitizes unknown lifecycle errors",async()=>{
  mocks.rpc.mockResolvedValue({data:null,error:{message:"NFC_UPLOAD_ABANDONED"}});
  await expect(finalizeNfcEvidenceUpload(verification)).rejects.toThrow("NFC_UPLOAD_ABANDONED");
  mocks.rpc.mockResolvedValue({data:null,error:{message:"private provider detail"}});
  await expect(finalizeNfcEvidenceUpload(verification)).rejects.toThrow("NFC_UPLOAD_FINALIZE_FAILED");
  await expect(abandonStaleNfcEvidenceUpload({assetId:asset,operatorId:input.actor_id})).rejects.toThrow("NFC_UPLOAD_ABANDON_FAILED");
});
it("rejects invalid lifecycle input without contacting the database",async()=>{
  await expect(finalizeNfcEvidenceUpload({...verification,sizeBytes:0})).rejects.toThrow();
  await expect(abandonStaleNfcEvidenceUpload({assetId:asset,operatorId:"invalid"})).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});

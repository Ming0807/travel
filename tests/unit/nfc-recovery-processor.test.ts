import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({claim:vi.fn(),read:vi.fn(),renew:vi.fn(),abandon:vi.fn(),defer:vi.fn(),finalize:vi.fn(),locate:vi.fn(),verify:vi.fn()}));
vi.mock("@/lib/repositories/nfc-recovery-job.repository",()=>({claimNfcRecoveryJobs:mocks.claim,
  renewNfcRecoveryLease:mocks.renew,abandonLeasedNfcRecovery:mocks.abandon,deferNfcRecoveryJob:mocks.defer,finalizeLeasedNfcRecovery:mocks.finalize}));
vi.mock("@/lib/repositories/nfc-upload-intent.repository",()=>({readLeasedNfcRecoveryIntent:mocks.read}));
vi.mock("@/lib/storage/nfc-evidence-discovery",()=>({inspectNfcRecoveryLocator:mocks.locate}));
vi.mock("@/lib/storage/nfc-evidence-readback",()=>({inspectNfcRecoveryReadback:mocks.verify}));
import { runAuthorizedNfcRecovery } from "@/lib/services/nfc-recovery-processor.service";
const asset="40000000-0000-4000-8000-000000000001", token="40000000-0000-4000-8000-000000000002";
const lease={assetId:asset,leaseToken:token}, secret="test-machine-secret-".repeat(3),auth=`Bearer ${secret}`;
const intent={asset_id:asset,state:"prepared",storage_path:null,provider_account:"test-project",object_key:`nfc-evidence/${asset}.webp`};
const content={storagePath:intent.object_key,sha256:"a".repeat(64),sizeBytes:1000,width:640,height:480};
beforeEach(()=>{
  vi.resetAllMocks();vi.stubEnv("CRON_SECRET",secret);vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED","true");
  mocks.claim.mockResolvedValue([{asset_id:asset,lease_token:token}]);mocks.read.mockResolvedValue(intent);
  mocks.renew.mockResolvedValue("2026-09-11T12:00:00Z");mocks.abandon.mockRejectedValue(new Error("NFC_UPLOAD_NOT_STALE"));
  mocks.locate.mockResolvedValue({status:"located",storagePath:intent.object_key});mocks.verify.mockResolvedValue({status:"verified",content});
  mocks.finalize.mockResolvedValue(asset);mocks.defer.mockResolvedValue(true);
});
afterEach(()=>vi.unstubAllEnvs());
it("authenticates before any processing",async()=>{
  await expect(runAuthorizedNfcRecovery("Bearer wrong")).rejects.toThrow("NFC_RECOVERY_UNAUTHORIZED");
  expect(mocks.claim).not.toHaveBeenCalled();expect(mocks.read).not.toHaveBeenCalled();
});
it("does no work when disabled",async()=>{
  vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED","false");expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"disabled"});
  expect(mocks.claim).not.toHaveBeenCalled();
});
it("returns idle only for an actual empty queue",async()=>{
  mocks.claim.mockResolvedValue([]);expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"idle"});
});
it("verifies durable bytes and finalizes exactly one leased job",async()=>{
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"completed"});
  expect(mocks.claim).toHaveBeenCalledExactlyOnceWith(1);expect(mocks.read).toHaveBeenCalledWith(lease);
  expect(mocks.renew).toHaveBeenCalledWith(lease);expect(mocks.verify).toHaveBeenCalledWith({...intent,storage_path:intent.object_key});
  expect(mocks.finalize).toHaveBeenCalledWith({...lease,providerAccount:intent.provider_account,...content});
  expect(mocks.defer).not.toHaveBeenCalled();
});
it.each(["absent","provider_unavailable","namespace_changed","content_conflict"])("defers or reviews discovery %s without reading bytes",async status=>{
  mocks.locate.mockResolvedValue({status});
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:["absent","provider_unavailable"].includes(status)?"deferred":"review",outcome:status});
  expect(mocks.defer).toHaveBeenCalledWith({...lease,outcome:status});expect(mocks.verify).not.toHaveBeenCalled();expect(mocks.finalize).not.toHaveBeenCalled();
});
it("does not rediscover a finalized private locator",async()=>{
  mocks.read.mockResolvedValue({...intent,state:"available",storage_path:intent.object_key});
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"completed"});
  expect(mocks.locate).not.toHaveBeenCalled();expect(mocks.abandon).not.toHaveBeenCalled();
});
it("retains expired intents and defers a missing late arrival",async()=>{
  mocks.abandon.mockResolvedValue(true);mocks.locate.mockResolvedValue({status:"absent"});
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"deferred",outcome:"absent"});
  expect(mocks.finalize).not.toHaveBeenCalled();
});
it("sends verified content on an abandoned intent to review, never finalization",async()=>{
  mocks.read.mockResolvedValue({...intent,state:"abandoned"});
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"review",outcome:"content_conflict"});
  expect(mocks.finalize).not.toHaveBeenCalled();
});
it("stops on lost lease before provider access",async()=>{
  mocks.renew.mockRejectedValue(new Error("NFC_RECOVERY_LEASE_LOST"));
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"lease_lost"});
  expect(mocks.locate).not.toHaveBeenCalled();expect(mocks.defer).not.toHaveBeenCalled();
});
it.each(["NFC_UPLOAD_ACTOR_UNAVAILABLE","NFC_VERSION_CONFLICT","NFC_UPLOAD_TAG_UNAVAILABLE"])("reviews authoritative denial %s",async message=>{
  mocks.finalize.mockRejectedValue(new Error(message));
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"review",outcome:message==="NFC_UPLOAD_ACTOR_UNAVAILABLE"?"actor_unavailable":"tag_changed"});
});
it("does not acknowledge an unknown database failure",async()=>{
  mocks.finalize.mockRejectedValue(new Error("private database detail"));
  await expect(runAuthorizedNfcRecovery(auth)).rejects.toThrow("NFC_RECOVERY_PROCESSING_FAILED");
  expect(mocks.defer).not.toHaveBeenCalled();
});
it("does not report deferred success when acknowledgement loses the lease",async()=>{
  mocks.locate.mockResolvedValue({status:"absent"});mocks.defer.mockRejectedValue(new Error("NFC_RECOVERY_LEASE_LOST"));
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"lease_lost"});
});
it.each(["absent","provider_unavailable","namespace_changed","content_conflict"])("routes readback %s without finalization",async status=>{
  mocks.verify.mockResolvedValue({status});
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:["absent","provider_unavailable"].includes(status)?"deferred":"review",outcome:status});
  expect(mocks.finalize).not.toHaveBeenCalled();
});
it("refreshes a browser-finalized intent after a retirement race",async()=>{
  mocks.abandon.mockRejectedValue(new Error("NFC_UPLOAD_NOT_ABANDONABLE"));
  mocks.read.mockResolvedValueOnce(intent).mockResolvedValueOnce({...intent,state:"available",storage_path:intent.object_key});
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"completed"});
  expect(mocks.read).toHaveBeenCalledTimes(2);expect(mocks.locate).not.toHaveBeenCalled();
});
it("retires and reviews content when expiry happens during provider verification",async()=>{
  mocks.finalize.mockRejectedValue(new Error("NFC_UPLOAD_EXPIRED"));
  mocks.abandon.mockRejectedValueOnce(new Error("NFC_UPLOAD_NOT_STALE")).mockResolvedValueOnce(true);
  expect(await runAuthorizedNfcRecovery(auth)).toEqual({status:"review",outcome:"content_conflict"});
  expect(mocks.abandon).toHaveBeenCalledTimes(2);
});
it("does not swallow review acknowledgement failures",async()=>{
  mocks.finalize.mockRejectedValue(new Error("NFC_UPLOAD_ACTOR_UNAVAILABLE"));mocks.defer.mockRejectedValue(new Error("DB unavailable"));
  await expect(runAuthorizedNfcRecovery(auth)).rejects.toThrow("NFC_RECOVERY_PROCESSING_FAILED");
});
it("does not interpret inherited object keys as database outcomes",async()=>{
  mocks.finalize.mockRejectedValue(new Error("constructor"));
  await expect(runAuthorizedNfcRecovery(auth)).rejects.toThrow("NFC_RECOVERY_PROCESSING_FAILED");
  expect(mocks.defer).not.toHaveBeenCalled();
});

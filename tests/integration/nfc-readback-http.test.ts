// @vitest-environment node
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
const state=vi.hoisted(()=>({origin:"",route:"/ok",hits:[] as string[]}));
vi.mock("@/lib/storage/nfc-prepared-storage",()=>({getNfcUploadDestination:()=>({provider:"supabase",provider_account:"local-qa",storage_prefix:"nfc-evidence"})}));
vi.mock("@/lib/config/public-env",()=>({getPublicEnv:()=>({NEXT_PUBLIC_SUPABASE_URL:state.origin})}));
vi.mock("@/lib/storage/private-files",()=>({createPrivateFileSignedUrl:async()=>`${state.origin}${state.route}`}));
import { verifyNfcEvidenceReadback, inspectNfcRecoveryReadback } from "@/lib/storage/nfc-evidence-readback";
let bytes:Buffer;
const server=createServer((request,response)=>{
  state.hits.push(request.url ?? "");
  if(request.url==="/missing") {response.writeHead(404);response.end("private provider details");return;}
  if(request.url==="/unavailable") {response.writeHead(503);response.end("private provider details");return;}
  if(request.url==="/redirect") {response.writeHead(302,{Location:"/ok"});response.end();return;}
  if(request.url==="/oversized") {response.writeHead(200);response.write(bytes);response.end(Buffer.from([0]));return;}
  if(request.url==="/truncated") {response.writeHead(200);response.end(bytes.subarray(0,bytes.length-1));return;}
  response.writeHead(200,{"Content-Type":"image/webp"});response.end(bytes);
});
beforeAll(async()=>{
  bytes=await sharp({create:{width:4,height:5,channels:3,background:"white"}}).webp().toBuffer();
  await new Promise<void>((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
  const address=server.address();
  if(!address || typeof address==="string") throw new Error("Loopback QA listener unavailable");
  state.origin=`http://127.0.0.1:${address.port}`;
});
afterAll(async()=>{
  server.closeAllConnections();
  await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
});
function input(){
  const asset="40000000-0000-4000-8000-000000000001";const path=`nfc-evidence/${asset}.webp`;
  return {asset_id:asset,provider:"supabase",provider_account:"local-qa",storage_prefix:"nfc-evidence",
    object_key:path,storage_path:path,sha256:createHash("sha256").update(bytes).digest("hex"),size_bytes:bytes.length,width:4,height:5};
}
it("verifies actual HTTP response bytes",async()=>{
  state.route="/ok";
  expect(await verifyNfcEvidenceReadback(input())).toMatchObject({sha256:input().sha256,width:4,height:5});
});
it.each(["/oversized","/truncated"])("rejects an actual %s response",async route=>{
  state.route=route;
  await expect(verifyNfcEvidenceReadback(input())).rejects.toThrow("NFC_READBACK_CONTENT_MISMATCH");
});
it("does not follow redirects even to the allowed origin",async()=>{
  state.route="/redirect";state.hits=[];
  await expect(verifyNfcEvidenceReadback(input())).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
  expect(state.hits).toEqual(["/redirect"]);
});
it("classifies an actual 404 as an observation while preserving the browser contract",async()=>{
  state.route="/missing";
  expect(await inspectNfcRecoveryReadback(input())).toEqual({status:"absent"});
  await expect(verifyNfcEvidenceReadback(input())).rejects.toThrow("NFC_READBACK_UNAVAILABLE");
});
it("classifies an actual outage without returning its response body",async()=>{
  state.route="/unavailable";
  expect(await inspectNfcRecoveryReadback(input())).toEqual({status:"provider_unavailable"});
});
it("verifies actual HTTP bytes before returning worker metadata",async()=>{
  state.route="/ok";
  expect(await inspectNfcRecoveryReadback(input())).toEqual({status:"verified",content:{storagePath:input().storage_path,
    sha256:input().sha256,sizeBytes:bytes.length,width:4,height:5}});
});

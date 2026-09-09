import { expect, it, vi } from "vitest";
import { readBoundedRequestBody } from "@/lib/http/bounded-request-body";
it("bounds chunked data even without Content-Length and cancels excess input", async () => {
  const cancel = vi.fn();
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(4)); controller.enqueue(new Uint8Array(4)); }, cancel });
  const request = { headers: new Headers(), body: stream } as Request;
  await expect(readBoundedRequestBody(request, 5)).rejects.toThrow();
  expect(cancel).toHaveBeenCalledOnce();
});
it("copies allowed chunks and rejects misleading lengths or empty bodies", async () => {
  expect(Buffer.from(await readBoundedRequestBody(new Request("https://test", { method: "POST", body: "abc" }), 3)).toString()).toBe("abc");
  await expect(readBoundedRequestBody(new Request("https://test", { method: "POST", body: "abc", headers: { "content-length": "1" } }), 3)).rejects.toThrow();
  await expect(readBoundedRequestBody(new Request("https://test"), 3)).rejects.toThrow();
});

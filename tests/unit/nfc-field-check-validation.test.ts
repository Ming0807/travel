import { expect, it } from "vitest";
import { nfcFieldCheckSchema } from "@/lib/validation/nfc-field-check";
const input = {
  requestId: "11111111-1111-4111-8111-111111111111", tagId: "22222222-2222-4222-8222-222222222222",
  version: 1, locationNote: "Entrance", deviceLabel: "iPhone Safari", platform: "ios",
  nfcResult: "passed", qrResult: "not_tested", notes: "", evidenceReference: "",
};
it("accepts partial checks without inventing an untested result", () => {
  expect(nfcFieldCheckSchema.parse(input).qrResult).toBe("not_tested");
});
it("requires at least one actual test and notes for failures", () => {
  expect(nfcFieldCheckSchema.safeParse({ ...input, nfcResult: "not_tested" }).success).toBe(false);
  expect(nfcFieldCheckSchema.safeParse({ ...input, qrResult: "failed" }).success).toBe(false);
  expect(nfcFieldCheckSchema.safeParse({ ...input, qrResult: "failed", notes: "Unreadable QR" }).success).toBe(true);
});
it("rejects identity injection, unknown results and oversized evidence", () => {
  for (const override of [{ actorId: input.requestId }, { nfcResult: "verified" }, { version: 0 }, { evidenceReference: "x".repeat(301) }]) {
    expect(nfcFieldCheckSchema.safeParse({ ...input, ...override }).success).toBe(false);
  }
});

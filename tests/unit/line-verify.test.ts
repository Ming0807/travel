import { describe, expect, it } from "vitest";

import { LineVerificationError, verifyLineIdTokenWithChannel } from "@/lib/line/verify-core";
import { lineLinkRequestSchema } from "@/lib/validation/line";

describe("LINE ID token verification", () => {
  it("verifies a LINE ID token without exposing provider_user_id to callers by default", async () => {
    const requests: Array<{ url: string; body: string }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      requests.push({
        url: String(input),
        body: String(init?.body)
      });

      return new Response(
        JSON.stringify({
          sub: "U123456789",
          aud: "line-channel-id",
          name: "Traveller"
        }),
        { status: 200 }
      );
    };

    const result = await verifyLineIdTokenWithChannel({
      idToken: "valid-line-id-token",
      channelId: "line-channel-id",
      fetchImpl
    });

    expect(result).toMatchObject({
      provider: "line",
      providerUserId: "U123456789",
      displayName: "Traveller"
    });
    expect(requests[0]?.url).toBe("https://api.line.me/oauth2/v2.1/verify");
    expect(requests[0]?.body).toContain("client_id=line-channel-id");
  });

  it("rejects a token with the wrong LINE channel audience", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          sub: "U123456789",
          aud: "other-channel-id"
        }),
        { status: 200 }
      );

    await expect(
      verifyLineIdTokenWithChannel({
        idToken: "valid-line-id-token",
        channelId: "line-channel-id",
        fetchImpl
      })
    ).rejects.toMatchObject({
      name: "LineVerificationError",
      code: "LINE_TOKEN_INVALID"
    });
  });

  it("requires explicit consent in the LINE linking request", () => {
    expect(() =>
      lineLinkRequestSchema.parse({
        idToken: "valid-line-id-token-value",
        hasConsented: false,
        language: "th"
      })
    ).toThrow();
  });

  it("reports missing LINE channel configuration safely", async () => {
    await expect(
      verifyLineIdTokenWithChannel({
        idToken: "valid-line-id-token",
        channelId: "",
        fetchImpl: async () => new Response("{}", { status: 200 })
      })
    ).rejects.toBeInstanceOf(LineVerificationError);
  });
});

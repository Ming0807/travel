import "server-only";

import { getServerEnv } from "@/lib/config/server-env";
import {
  LineVerificationError,
  verifyLineIdTokenWithChannel,
  type VerifiedLineIdentity
} from "@/lib/line/verify-core";

export { LineVerificationError, type VerifiedLineIdentity };

type LineVerifyOptions = {
  channelId?: string;
  fetchImpl?: typeof fetch;
};

function getLineChannelId(channelIdOverride?: string) {
  if (channelIdOverride !== undefined) {
    return channelIdOverride.trim();
  }

  return getServerEnv().LINE_CHANNEL_ID?.trim() ?? "";
}

export async function verifyLineIdToken(
  idToken: string,
  options: LineVerifyOptions = {}
): Promise<VerifiedLineIdentity> {
  return verifyLineIdTokenWithChannel({
    idToken,
    channelId: getLineChannelId(options.channelId),
    fetchImpl: options.fetchImpl
  });
}

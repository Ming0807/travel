import "server-only";

import { z } from "zod";
import { hashCheckinBrowserId, isCheckinBrowserId } from "@/lib/auth/checkin-entry";
import { getCheckinEntryConfig } from "@/lib/config/checkin-entry";
import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import {
  beginCheckinEntrySession,
  createVisitFromCheckinEntry,
  readCheckinEntrySession,
  type CheckinEntrySession,
} from "@/lib/repositories/checkin-entry.repository";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { resolveNfcCheckin } from "@/lib/services/nfc-checkin.service";

type BlockedEntry = { mode: "blocked"; status: "nfc_unavailable" | "unavailable" };
type LegacyEntry = { mode: "legacy"; status: "valid"; details: CheckinCodeDetails };
type SessionEntry = {
  mode: "session";
  status: "valid";
  details: CheckinCodeDetails;
  sessionId: string;
  wasCreated: boolean;
  channel: "qr" | "nfc";
};

export type BeginCheckinEntryResult = BlockedEntry | LegacyEntry | SessionEntry;
export type ResolvedCheckinFlow = BlockedEntry | LegacyEntry | {
  mode: "session";
  status: "valid";
  details: CheckinCodeDetails;
  session: CheckinEntrySession;
};

const flowIdSchema = z.uuidv4();

function matchesLiveContext(session: CheckinEntrySession, details: CheckinCodeDetails): boolean {
  return session.checkinCodeId === details.checkin_code_id
    && session.code === details.code
    && session.attractionId === details.attraction?.attraction_id
    && session.photoSpotId === (details.photo_spot?.photo_spot_id ?? null);
}

async function resolveLegacy(code: string): Promise<LegacyEntry | BlockedEntry> {
  const context = await resolveAndValidateCheckinCode(code);
  if (context.status !== "valid" || !context.details) {
    return { mode: "blocked", status: "unavailable" };
  }
  return { mode: "legacy", status: "valid", details: context.details };
}

export async function beginCanonicalCheckinEntry(input: {
  code: string;
  nfcToken: string | null;
  browserId: string;
}): Promise<BeginCheckinEntryResult> {
  try {
    const config = getCheckinEntryConfig();

    if (input.nfcToken !== null && (!config.sessionsEnabled || !config.nfcEnabled)) {
      return { mode: "blocked", status: "nfc_unavailable" };
    }

    if (!config.sessionsEnabled) {
      return await resolveLegacy(input.code);
    }

    if (!config.hashSecret || !isCheckinBrowserId(input.browserId)) {
      return { mode: "blocked", status: "unavailable" };
    }

    const browserHash = hashCheckinBrowserId(input.browserId, config.hashSecret);
    let details: CheckinCodeDetails;
    let channel: "qr" | "nfc";
    let tagId: string | null;

    if (input.nfcToken !== null) {
      const resolution = await resolveNfcCheckin(input.code, input.nfcToken);
      if (resolution.status !== "valid") {
        return { mode: "blocked", status: "nfc_unavailable" };
      }
      details = resolution.details;
      channel = "nfc";
      tagId = resolution.tagId;
    } else {
      const resolution = await resolveAndValidateCheckinCode(input.code);
      if (resolution.status !== "valid" || !resolution.details) {
        return { mode: "blocked", status: "unavailable" };
      }
      details = resolution.details;
      channel = "qr";
      tagId = null;
    }

    const started = await beginCheckinEntrySession({
      browserHash,
      code: input.code,
      channel,
      tagId,
    });

    return {
      mode: "session",
      status: "valid",
      details,
      sessionId: started.sessionId,
      wasCreated: started.wasCreated,
      channel,
    };
  } catch {
    return { mode: "blocked", status: "unavailable" };
  }
}

export async function resolveCheckinFlow(input: {
  code: string;
  flowId: string | null;
  browserId: string | null;
}): Promise<ResolvedCheckinFlow> {
  try {
    const config = getCheckinEntryConfig();

    if (input.flowId === null) {
      return await resolveLegacy(input.code);
    }

    if (!config.sessionsEnabled
      || !config.hashSecret
      || !input.browserId
      || !isCheckinBrowserId(input.browserId)
      || !flowIdSchema.safeParse(input.flowId).success) {
      return { mode: "blocked", status: "unavailable" };
    }

    const session = await readCheckinEntrySession({
      sessionId: input.flowId,
      browserHash: hashCheckinBrowserId(input.browserId, config.hashSecret),
      code: input.code,
    });
    if (session.channel === "nfc" && !config.nfcEnabled) {
      return { mode: "blocked", status: "nfc_unavailable" };
    }
    const context = await resolveAndValidateCheckinCode(input.code);
    if (context.status !== "valid" || !context.details || !matchesLiveContext(session, context.details)) {
      return { mode: "blocked", status: "unavailable" };
    }

    return { mode: "session", status: "valid", session, details: context.details };
  } catch {
    return { mode: "blocked", status: "unavailable" };
  }
}

export async function completeCheckinEntryVisit(input: {
  code: string;
  flowId: string;
  browserId: string | null;
  touristId: string;
}): Promise<string> {
  const config = getCheckinEntryConfig();
  if (!config.sessionsEnabled
    || !config.hashSecret
    || !input.browserId
    || !isCheckinBrowserId(input.browserId)
    || !flowIdSchema.safeParse(input.flowId).success
    || !flowIdSchema.safeParse(input.touristId).success) {
    throw new Error("CHECKIN_ENTRY_CONTEXT_INVALID");
  }

  return createVisitFromCheckinEntry({
    sessionId: input.flowId,
    browserHash: hashCheckinBrowserId(input.browserId, config.hashSecret),
    code: input.code,
    touristId: input.touristId,
  });
}

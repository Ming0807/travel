import { z } from "zod";

export const nfcTokenSchema = z.uuid();
export const nfcCheckinCodeSchema = z.string().min(3).max(100).regex(/^[a-zA-Z0-9_-]+$/);
export type NfcAssignment = {
  checkinCodeId: number;
  code: string;
  attractionId: number;
  photoSpotId: number | null;
  campaignId: number | null;
};

export function buildNfcPayload(origin: string, code: string, token: string): string {
  const base = new URL(origin);
  if (base.protocol !== "https:" || base.username || base.password || base.pathname !== "/" || base.search || base.hash) {
    throw new Error("NFC_OFFICIAL_HTTPS_ORIGIN_REQUIRED");
  }
  const url = new URL(`/c/${nfcCheckinCodeSchema.parse(code)}`, base.origin);
  url.searchParams.set("nfc", nfcTokenSchema.parse(token));
  return url.toString();
}

export function isNfcAssignmentCurrent(snapshot: NfcAssignment, current: NfcAssignment): boolean {
  return snapshot.checkinCodeId === current.checkinCodeId
    && snapshot.code === current.code
    && snapshot.attractionId === current.attractionId
    && snapshot.photoSpotId === current.photoSpotId
    && snapshot.campaignId === current.campaignId;
}

import { parseCheckinEntryConfig } from "@/lib/config/checkin-entry";

export function researchBrowserProvisioningEnabled(source: Record<string, string | undefined> = process.env): boolean {
  const flag = source.RESEARCH_BROWSER_GRANTS_ENABLED;
  if (flag === undefined || flag === "" || flag === "false") return false;
  if (flag !== "true") throw new Error("RESEARCH_BROWSER_GRANTS_ENABLED must be exactly true or false");
  if (!parseCheckinEntryConfig(source).sessionsEnabled) throw new Error("Research browser grants require entry sessions");
  return true;
}

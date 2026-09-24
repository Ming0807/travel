import { z } from "zod";

const entrySessionIdSchema = z.uuidv4();

export function safeResearchReturnPath(value: unknown, checkinCode: string): string {
  const basePath = `/checkin/${encodeURIComponent(checkinCode)}/start`;
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return basePath;
  }

  try {
    const url = new URL(value, "https://research.invalid");
    if (url.origin !== "https://research.invalid" || url.pathname !== basePath || url.hash) return basePath;
    if (url.searchParams.size === 0) return basePath;
    const flow = url.searchParams.getAll("flow");
    if (url.searchParams.size !== 1 || flow.length !== 1 || !entrySessionIdSchema.safeParse(flow[0]).success) {
      return basePath;
    }
    return `${basePath}?flow=${encodeURIComponent(flow[0])}`;
  } catch {
    return basePath;
  }
}

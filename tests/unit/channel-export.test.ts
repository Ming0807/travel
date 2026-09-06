import { describe, expect, it } from "vitest";
import { buildChannelExportRows } from "@/lib/dashboard/channel-export";
import { buildAttractionChannelAnalytics } from "@/lib/services/attraction-analytics.service";
const asOf = "2026-09-05T00:00:00Z";
describe("channel export", () => {
  it("exports disabled status without inventing measured zeros", () => {
    const rows = buildChannelExportRows(buildAttractionChannelAnalytics([], [], "all_records", false, asOf));
    expect(rows).toHaveLength(2);
    expect(rows[0].Value).toBe("tracking_not_activated");
  });
  it("preserves suppressed values and never exports identities", () => {
    const data = buildAttractionChannelAnalytics([{ entry_session_id: "private-id", browser_hash: "secret", evidence_scope: "unknown", entry_channel: "qr", created_at: asOf }], [], "all_records", true, asOf);
    const rows = buildChannelExportRows(data);
    expect(rows.find((row) => row.Section === "Entry channel totals")?.Value).toBe("SUPPRESSED_OR_UNAVAILABLE");
    expect(JSON.stringify(rows)).not.toMatch(/private-id|secret/);
  });
  it("retains same-channel entry denominators and measured zero outcomes", () => {
    const data = buildAttractionChannelAnalytics(Array.from({ length: 20 }, (_, index) => ({ entry_session_id: `e${index}`, evidence_scope: "unknown", entry_channel: "qr", created_at: asOf })), [], "all_records", true, asOf);
    const rows = buildChannelExportRows(data);
    expect(rows.find((row) => row.Metric === "qr_visits")).toMatchObject({ Value: 0, Denominator: 20 });
    expect(rows.find((row) => row.Metric === "qr_visits_percent")).toMatchObject({ Value: 0, Denominator: 20 });
  });
});

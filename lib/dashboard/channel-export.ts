import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";
type ChannelData = AttractionAnalyticsViewModel["channels"];
type ExportRow = { Section: string; Metric: string; Value: string | number; Denominator: string | number; Note: string };
const visible = (value: number | null) => value === null ? "SUPPRESSED_OR_UNAVAILABLE" : value;

export function buildChannelExportRows(data: ChannelData): ExportRow[] {
  const rows: ExportRow[] = [
    { Section: "Entry channel metadata", Metric: "status", Value: data.status, Denominator: "", Note: data.note },
    { Section: "Entry channel metadata", Metric: "as_of", Value: data.asOf, Denominator: "", Note: "Outcome cutoff; entry-date cohort, not Visit-date cohort" },
  ];
  if (data.status !== "ready") return rows;
  for (const channel of data.channels) {
    const base = visible(channel.entries);
    for (const [metric, count, rate] of [
      ["visits", channel.linkedVisits, channel.visitConversion],
      ["certificates", channel.certificates, channel.certificateConversion],
      ["surveys", channel.surveys, channel.surveyConversion],
    ] as const) {
      rows.push({ Section: "Entry channel outcomes", Metric: `${channel.channel}_${metric}`, Value: visible(count), Denominator: base, Note: "Same-channel entry cohort; not people or physical taps" });
      rows.push({ Section: "Entry channel conversion", Metric: `${channel.channel}_${metric}_percent`, Value: visible(rate), Denominator: base, Note: "Percent; missing or suppressed is never zero" });
    }
    rows.push({ Section: "Entry channel totals", Metric: channel.channel, Value: base, Denominator: visible(data.entries), Note: "Distinct entry sessions" });
  }
  for (const day of data.daily) {
    for (const channel of ["qr", "nfc"] as const) rows.push({ Section: "Entry channel daily trend", Metric: `${day.date}_${channel}`, Value: visible(day[channel]), Denominator: "", Note: "Bangkok entry-start date; distinct sessions" });
  }
  rows.push({ Section: "Entry attribution coverage", Metric: "linked_visit_percent", Value: visible(data.attributionCoverage), Denominator: data.attributionVisitBase, Note: "Visit-date base, NOT entry conversion; includes entries started before selected dates" });
  return rows;
}

import type { DashboardEvidenceScope } from "@/types/dashboard";

type Row = Record<string, unknown>;

function asRecord(value: unknown): Row | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Row : null;
}

function relations(row: Row, key: string): Row[] {
  const value = row[key];
  if (Array.isArray(value)) return value.map(asRecord).filter((item): item is Row => item !== null);
  const relation = asRecord(value);
  return relation ? [relation] : [];
}

function includedResearchSessions(row: Row): Row[] {
  return relations(row, "research_sessions").filter((session) => {
    const status = String(session.status ?? "");
    return session.inclusion_status !== "excluded" && !["withdrawn", "excluded", "expired"].includes(status);
  });
}

function studyKind(session: Row): string {
  return String(relations(session, "research_studies")[0]?.study_kind ?? "");
}

export function visitMatchesDashboardEvidenceScope(row: Row, scope: DashboardEvidenceScope): boolean {
  if (scope === "all_records") return true;

  const sessions = includedResearchSessions(row);
  if (scope === "pilot_only") {
    return sessions.some((session) => studyKind(session) === "pilot" || session.collection_mode === "pilot_internal");
  }
  if (scope === "simulated_only") {
    return sessions.some((session) => session.collection_mode === "simulated_usability");
  }

  // Existing operational visits without a research session remain valid field
  // records. Explicit pilot and simulated sessions are excluded from field claims.
  if (sessions.length === 0) return true;
  return sessions.some((session) => studyKind(session) === "final_collection" && session.collection_mode === "field_observation");
}

export function filterVisitsByDashboardEvidenceScope<T extends Row>(rows: T[], scope: DashboardEvidenceScope): T[] {
  return rows.filter((row) => visitMatchesDashboardEvidenceScope(row, scope));
}

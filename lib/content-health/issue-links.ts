/**
 * Maps content-health issue descriptions to editor section hash fragments.
 *
 * Pure function — no React or browser dependencies.
 * Used by ContentHealthDashboard (admin UI) and unit tests.
 */
export function getIssueHash(issue: string): string {
  if (issue === "draft" || issue === "inactive") return "#settings";
  if (issue === "stock/demo media" || issue.includes("media") || issue.includes("cover")) return "#gallery";
  if (issue.includes("English") || issue.includes("summary")) return "#content";
  return "";
}

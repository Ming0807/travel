"use client";

import { useEffect } from "react";
import { withPreparedResearchBrowser } from "@/lib/services/research-browser.client";

export function ResearchVisitCredentialMigration({ visitId }: { visitId: string }) {
  useEffect(() => {
    // Migration is optional maintenance: legacy evaluation/withdrawal stays usable.
    void withPreparedResearchBrowser(async () => {
      const response = await fetch(`/api/research/browser/migrate?visitId=${encodeURIComponent(visitId)}`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
      });
      if (!response.ok) throw new Error("MIGRATION_UNAVAILABLE");
    }).catch(() => undefined);
  }, [visitId]);
  return null;
}

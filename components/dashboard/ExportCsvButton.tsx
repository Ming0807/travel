"use client";

import { useSearchParams } from "next/navigation";
import { ExportPrivacyDialog } from "@/components/dashboard/ExportPrivacyDialog";

export function ExportCsvButton() {
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ? `${searchParams.toString()}&` : "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportPrivacyDialog
        endpoint="/api/admin/dashboard/export"
        exportType="summary"
        label="Summary"
        searchParams={queryString}
      />
      <ExportPrivacyDialog
        endpoint="/api/admin/dashboard/export"
        exportType="tourists"
        label="Tourists"
        searchParams={queryString}
      />
      <ExportPrivacyDialog
        endpoint="/api/admin/dashboard/export"
        exportType="visits"
        label="Visits"
        searchParams={queryString}
      />
      <ExportPrivacyDialog
        endpoint="/api/admin/dashboard/export"
        exportType="surveys"
        label="Surveys"
        searchParams={queryString}
      />
      <ExportPrivacyDialog
        endpoint="/api/admin/dashboard/export"
        exportType="expenses"
        label="Expenses"
        searchParams={queryString}
      />
    </div>
  );
}

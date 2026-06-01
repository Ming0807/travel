"use client";

import { useState, useCallback, useRef } from "react";
import { WarningCircle, DownloadSimple, X } from "@phosphor-icons/react/dist/ssr";

type ExportType = "summary" | "tourists" | "visits" | "surveys" | "expenses";

const EXPORT_LABELS: Record<ExportType, string> = {
  summary: "Summary",
  tourists: "Tourists",
  visits: "Visits",
  surveys: "Surveys",
  expenses: "Expenses",
};

const EXPORT_DETAILS: Record<string, { includes: string; excludes: string }> = {
  tourists: {
    includes:
      "Aggregated tourist profile data: age group, origin country, origin province, and preferred language. No personally identifiable information (PII).",
    excludes:
      "Tourist names, email addresses, phone numbers, LINE IDs, device tokens, guest tokens, tourist IDs, and visit IDs are never exported.",
  },
  visits: {
    includes:
      "Visit records with: visit date, attraction, destination province, age group, origin country/province, group size, overnight status, companion, transport, and purpose.",
    excludes:
      "Tourist names, email addresses, phone numbers, LINE IDs, device tokens, guest tokens, tourist IDs, and visit IDs are never exported.",
  },
  surveys: {
    includes:
      "Survey responses with: submission date, visit date, attraction, province, overall score, cleanliness score, facility score, safety score, revisit intention, and recommend intention.",
    excludes:
      "Tourist names, email addresses, phone numbers, LINE IDs, device tokens, guest tokens, free-text comments with potential PII, tourist IDs, and visit IDs are never exported.",
  },
  expenses: {
    includes:
      "Aggregated spending distribution and expense category breakdown from optional survey responses. Spending ranges with min/max THB values. No personally identifiable information.",
    excludes:
      "Tourist names, email addresses, phone numbers, LINE IDs, device tokens, guest tokens, tourist IDs, visit IDs, and individual expense amounts are never exported.",
  },
};

export function ExportPrivacyDialog({
  endpoint,
  exportType,
  label,
  searchParams,
}: {
  endpoint: string;
  exportType: ExportType;
  label: string;
  searchParams: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleDownload = useCallback(() => {
    const url = `${endpoint}?${searchParams}type=${exportType}`;
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.click();
    }
    setIsOpen(false);
  }, [endpoint, searchParams, exportType]);

  const details = EXPORT_DETAILS[exportType];

  // Summary exports don't need a privacy warning
  if (exportType === "summary") {
    const url = `${endpoint}?${searchParams}type=summary`;
    return (
      <a
        href={url}
        download
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <DownloadSimple className="h-4 w-4" />
        {label}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <DownloadSimple className="h-4 w-4" />
        {label}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-privacy-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <WarningCircle className="h-5 w-5 text-amber-600" weight="fill" />
                </div>
                <h3 id="export-privacy-title" className="text-lg font-black text-slate-800">
                  Privacy & data notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                You are about to export <strong>{EXPORT_LABELS[exportType]}</strong> data from the dashboard.
              </p>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Data included
                </p>
                <p className="text-sm text-emerald-800">{details.includes}</p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-700">
                  Data never included
                </p>
                <p className="text-sm text-rose-800">{details.excludes}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Important limitations
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                  <li>Tourist profiles represent system profiles, not verified unique people.</li>
                  <li>QR scan events are tracked separately from completed visits.</li>
                  <li>Estimated spending is self-reported range data, not verified revenue.</li>
                  <li>Missing or unanswered fields display as blank — they are not zero.</li>
                  <li>Small sample sizes may not be statistically representative.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A6B62] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#073F37]"
              >
                <DownloadSimple className="h-4 w-4" weight="bold" />
                Download {EXPORT_LABELS[exportType]}
              </button>
              <a ref={downloadRef} className="hidden" aria-hidden="true" tabIndex={-1} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

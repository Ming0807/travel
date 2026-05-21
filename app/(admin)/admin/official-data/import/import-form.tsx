"use client";

import { useState } from "react";
import { parseAndImportOfficialStats } from "../actions";
import { CheckCircle, WarningCircle, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ImportFormResult = {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
};

export function ImportForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportFormResult | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await parseAndImportOfficialStats(formData);
      setResult(response);
      if (response.success) {
        e.currentTarget.reset();
        router.refresh();
      }
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="source_name" className="block text-sm font-bold text-slate-700">Data Source Name *</label>
          <input 
            id="source_name" 
            name="source_name" 
            placeholder="e.g. Ministry of Tourism 2025" 
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="source_url" className="block text-sm font-bold text-slate-700">Source URL (Optional)</label>
          <input 
            id="source_url" 
            name="source_url" 
            type="url"
            placeholder="https://..." 
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-bold text-slate-700">CSV File *</label>
          <input 
            id="file" 
            name="file" 
            type="file" 
            accept=".csv"
            required 
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-bold hover:file:bg-slate-200 focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Required columns: province_name, year, visitor_count
          </p>
        </div>
      </div>

      {result && (
        <div className={`rounded-xl border p-4 ${result.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" weight="fill" />
            ) : (
              <WarningCircle className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" weight="fill" />
            )}
            <div>
              <h4 className="font-bold">{result.success ? "Success" : "Import Failed"}</h4>
              <p className="mt-1 text-sm opacity-90">
                {result.success ? result.message : result.error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
        <Link 
          href="/admin/official-data"
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 rounded-lg bg-[#0A6B62] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#08524b] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing Import..." : "Import Data"}
        </button>
      </div>
    </form>
  );
}

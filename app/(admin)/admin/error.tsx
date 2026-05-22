"use client";

import { useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
        <WarningCircle size={32} weight="fill" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Section Error</h2>
      <p className="text-sm text-slate-600 mb-6 max-w-md">
        An error occurred while loading this admin module. 
        {error.message && <span className="block mt-2 font-mono text-xs text-red-600">{error.message}</span>}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        Try again
      </button>
    </div>
  );
}

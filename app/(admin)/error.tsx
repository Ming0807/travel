"use client";

import { useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Error Boundary Caught:", error);
  }, [error]);

  const isUnauthorized =
    error.message?.includes("UNAUTHORIZED") ||
    error.message?.includes("sign in") ||
    error.code === "UNAUTHORIZED";

  const isForbidden =
    error.message?.includes("FORBIDDEN") ||
    error.message?.includes("permission") ||
    error.code === "FORBIDDEN";

  let title = "Something went wrong";
  let description = "An unexpected error occurred while loading this admin page.";

  if (isUnauthorized) {
    title = "Authentication Required";
    description = "You must be signed in as an administrator to access this page.";
  } else if (isForbidden) {
    title = "Access Denied";
    description = "You do not have the required permissions to view this page or perform this action.";
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Error" title={title} description="Could not load the requested page." />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <span className="text-2xl font-black">!</span>
          </div>
          <h3 className="mt-4 text-lg font-black text-[#073F37]">{title}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="rounded-xl bg-[#0A6B62] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#085A53]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

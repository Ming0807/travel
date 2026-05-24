"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

type Tourist = {
  id: string;
  name: string;
  location: string;
  joinedAt: string;
  providers: string[];
  certificateCount: number;
};

export function TouristListClient({ initialTourists }: { initialTourists: Tourist[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTourists = initialTourists.filter((t) => 
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <MagnifyingGlass size={20} />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]/20"
            placeholder="Search tourists by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {filteredTourists.length} tourist{filteredTourists.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filteredTourists.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">No tourists found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tourist Profile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Auth Methods
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Certificates
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredTourists.map((tourist) => (
                    <tr key={tourist.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{tourist.name || "Anonymous Guest"}</span>
                          <span className="text-xs text-slate-400 font-mono">{tourist.id.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {tourist.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(tourist.providers)).map((provider) => (
                            <span key={provider} className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EF] px-2 py-1 text-[10px] font-bold text-[#0A6B62] uppercase tracking-wider">
                              {provider.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {tourist.certificateCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                        {format(new Date(tourist.joinedAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {filteredTourists.map((tourist) => (
              <div
                key={tourist.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">{tourist.name || "Anonymous Guest"}</span>
                    <span className="text-xs text-slate-400 font-mono">{tourist.id.substring(0, 8)}...</span>
                  </div>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 shrink-0">
                    {tourist.certificateCount}
                  </span>
                </div>

                <div className="text-sm">
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="font-semibold text-slate-700">{tourist.location}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-400">Auth Methods</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(tourist.providers)).map((provider) => (
                      <span key={provider} className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EF] px-2 py-1 text-[10px] font-bold text-[#0A6B62] uppercase tracking-wider">
                        {provider.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    Joined {format(new Date(tourist.joinedAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

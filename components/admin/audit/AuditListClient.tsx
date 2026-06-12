"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MagnifyingGlass,
  FileText,
  Funnel,
  DownloadSimple,
  X,
  CheckCircle,
  WarningCircle,
  XCircle,
  Sliders,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter, usePathname } from "next/navigation";
import { Pagination } from "@/components/admin/Pagination";

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "attraction", label: "Attraction" },
  { value: "story", label: "Story" },
  { value: "route", label: "Route" },
  { value: "restaurant", label: "Restaurant" },
  { value: "accommodation", label: "Accommodation" },
  { value: "media", label: "Media" },
  { value: "photo_spot", label: "Photo Spot" },
  { value: "checkin_code", label: "Check-in Code" },
  { value: "badge", label: "Badge" },
  { value: "review", label: "Review" },
  { value: "admin_users", label: "Admin User" },
  { value: "roles", label: "Role" },
  { value: "content_media", label: "Content Media" },
  { value: "settings", label: "Settings" },
  { value: "site_settings", label: "Site Settings" },
  { value: "certificate", label: "Certificate" },
];

const ACTION_PREFIX_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "archive", label: "Archive" },
  { value: "publish", label: "Publish" },
  { value: "unpublish", label: "Unpublish" },
  { value: "activate", label: "Activate" },
  { value: "deactivate", label: "Deactivate" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "export", label: "Export" },
  { value: "login", label: "Login" },
];

function extractResult(newData: any): "success" | "failed" | "denied" | null {
  const result = newData?._audit?.result;
  if (result === "success" || result === "failed" || result === "denied") return result;
  return null;
}

function ResultBadge({ result }: { result: "success" | "failed" | "denied" | null }) {
  if (!result) return null;
  const styles = {
    success: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
    failed: { bg: "bg-rose-50", text: "text-rose-700", icon: XCircle },
    denied: { bg: "bg-amber-50", text: "text-amber-700", icon: WarningCircle },
  };
  const s = styles[result];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold uppercase ${s.bg} ${s.text}`}>
      <Icon size={11} weight="fill" />
      {result}
    </span>
  );
}

function activeFilterCount(filters: Record<string, string | undefined>): number {
  return Object.entries(filters).filter(([key, val]) => key !== "search" && val).length;
}

type AuditListClientProps = {
  initialData: {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  adminUsers: any[];
  initialFilters: {
    adminId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
};

export function AuditListClient({ initialData, adminUsers, initialFilters }: AuditListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [filters, setFilters] = useState(initialFilters);
  const [selectedDetails, setSelectedDetails] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = (page = 1) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({});
    router.push(pathname);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      // Just redirecting to an API endpoint that streams the CSV
      window.location.href = `/api/admin/audit/export?${params.toString()}`;
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const logs = initialData.data;

  // Render JSON beautifully
  const renderDetails = (json: any) => {
    if (!json) return null;
    return (
      <div className="bg-slate-900 rounded-lg p-4 text-emerald-400 font-mono text-xs overflow-auto max-h-[60vh]">
        <pre>{JSON.stringify(json, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <MagnifyingGlass size={20} />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-[#0A6B62] focus:outline-none focus:ring-1 focus:ring-[#0A6B62]/20"
            placeholder="Search action or entity..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters(1)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isFilterOpen || activeFilterCount(filters) > 0
                ? "bg-[#E6F4EF] text-[#0A6B62] border border-[#0A6B62]/20"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Sliders size={18} />
            Filters
            {activeFilterCount(filters) > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A6B62] px-1.5 text-xs font-extrabold text-white">
                {activeFilterCount(filters)}
              </span>
            ) : null}
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <DownloadSimple size={18} />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount(filters) > 0 && !isFilterOpen ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Active filters:</span>              {Object.entries(filters).map(([key, val]) => {
            if (!val || key === "search") return null;
            const labelMap: Record<string, string> = {
              adminId: "Admin",
              action: "Action",
              entityType: "Entity",
              startDate: "From",
              endDate: "To",
            };
            const displayKey = labelMap[key] || key;
            const displayVal = key === "adminId"
              ? (adminUsers.find(u => u.admin_id === val)?.display_name ?? val)
              : val;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm"
              >
                {displayKey}: {displayVal.length > 20 ? displayVal.slice(0, 20) + "..." : displayVal}
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...filters, [key]: "" } as Record<string, string>;
                    setFilters(updated);
                    const params = new URLSearchParams();
                    Object.entries(updated).forEach(([k, v]) => {
                      if (v) params.set(k, v);
                    });
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200"
                  aria-label={`Remove ${key} filter`}
                >
                  <X size={12} weight="bold" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Admin User</label>
              <select
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={filters.adminId || ""}
                onChange={(e) => handleFilterChange("adminId", e.target.value)}
              >
                <option value="">All Users</option>
                <option value="system">System (No User ID)</option>
                {adminUsers.map(u => (
                  <option key={u.admin_id} value={u.admin_id}>{u.display_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Action</label>
              <select
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={filters.action || ""}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              >
                {ACTION_PREFIX_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Entity Type</label>
              <select
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={filters.entityType || ""}
                onChange={(e) => handleFilterChange("entityType", e.target.value)}
              >
                {ENTITY_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                  value={filters.startDate || ""}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  aria-label="Start date"
                />
                <span className="flex items-center text-slate-400 text-xs">-</span>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                  value={filters.endDate || ""}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  aria-label="End date"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Clear All
            </button>
            <button 
              onClick={() => applyFilters(1)}
              className="rounded-lg bg-[#F3704C] px-4 py-2 text-sm font-medium text-white hover:bg-[#E55A35]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Admin User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No audit logs match your filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                        {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.admin_users ? (
                          <>
                            <div className="font-medium text-slate-900">{log.admin_users.display_name}</div>
                            <div className="text-xs text-slate-500">{log.admin_users.email}</div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-md bg-[#E6F4EF] border border-[#0A6B62]/10 px-2.5 py-0.5 text-xs font-medium text-[#0A6B62]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id.length > 12 ? log.entity_id.substring(0, 8) + '...' : log.entity_id})` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <ResultBadge result={extractResult(log.new_data)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {((log.new_data && Object.keys(log.new_data).length > 0) || (log.old_data && Object.keys(log.old_data).length > 0)) ? (
                          <button 
                            onClick={() => setSelectedDetails(log.log_id)}
                            className="text-[#0A6B62] hover:text-[#F3704C] inline-flex items-center gap-1 bg-[#E6F4EF] px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            <FileText size={16} />
                            View Data
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-3 p-4 md:hidden">
            {logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                No audit logs match your filters.
              </div>
            ) : (
              logs.map((log) => {
                const result = extractResult(log.new_data);
                return (
                  <div
                    key={log.log_id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] text-slate-500">
                          {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-md bg-[#E6F4EF] border border-[#0A6B62]/10 px-2 py-0.5 text-xs font-medium text-[#0A6B62]">
                            {log.action}
                          </span>
                          <ResultBadge result={result} />
                        </div>
                      </div>
                      {((log.new_data && Object.keys(log.new_data).length > 0) || (log.old_data && Object.keys(log.old_data).length > 0)) ? (
                        <button
                          onClick={() => setSelectedDetails(log.log_id)}
                          className="shrink-0 rounded-lg bg-[#E6F4EF] p-2 text-[#0A6B62] transition hover:bg-[#d1ede3]"
                          aria-label="View data"
                        >
                          <FileText size={18} weight="bold" />
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-bold text-slate-500">Admin</p>
                        <p className="mt-0.5 font-semibold text-slate-800">
                          {log.admin_users?.display_name || "System"}
                        </p>
                        {log.admin_users?.email ? (
                          <p className="text-xs text-slate-500">{log.admin_users.email}</p>
                        ) : null}
                      </div>
                      <div>
                        <p className="font-bold text-slate-500">Entity</p>
                        <p className="mt-0.5 font-mono text-xs text-slate-800">
                          {log.entity_type}
                        </p>
                        {log.entity_id ? (
                          <p className="truncate text-xs text-slate-500">
                            ID: {log.entity_id.length > 16 ? log.entity_id.substring(0, 14) + "..." : log.entity_id}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {initialData.totalPages > 1 && (
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
            <Pagination page={initialData.page} pageSize={initialData.limit} total={initialData.total} />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Audit Log Record Data</h3>
              <button 
                onClick={() => setSelectedDetails(null)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              {logs.find(l => l.log_id === selectedDetails)?.old_data && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Old Data</h4>
                  {renderDetails(logs.find(l => l.log_id === selectedDetails)?.old_data)}
                </div>
              )}
              {logs.find(l => l.log_id === selectedDetails)?.new_data && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">New Data / Details</h4>
                  {renderDetails(logs.find(l => l.log_id === selectedDetails)?.new_data)}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedDetails(null)}
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

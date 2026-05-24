"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MagnifyingGlass, FileText, Funnel, DownloadSimple, X } from "@phosphor-icons/react/dist/ssr";
import { useRouter, usePathname } from "next/navigation";
import { Pagination } from "@/components/admin/Pagination";

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
              isFilterOpen || Object.keys(filters).some(k => k !== 'search' && (filters as any)[k])
                ? "bg-[#E6F4EF] text-[#0A6B62] border border-[#0A6B62]/20"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Funnel size={18} />
            Filters
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Entity Type</label>
              <input
                type="text"
                placeholder="e.g. users, roles, attractions"
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={filters.entityType || ""}
                onChange={(e) => handleFilterChange("entityType", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Clear
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
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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

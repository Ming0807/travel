import { AdminOfficialDataRepository } from "@/lib/repositories/admin-official-data.repository";
import Link from "next/link";
import { UploadSimple, FileCsv } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requirePermission } from "@/lib/auth/guards";
import { DataImportLog, OfficialTourismStatWithProvince } from "@/types/official-data";

export const metadata = {
  title: "Official Data | Admin Dashboard",
};

export default async function OfficialDataPage() {
  await requirePermission("official_data.read");

  const [importLogs, stats] = await Promise.all([
    AdminOfficialDataRepository.listImportLogs(10, 0),
    AdminOfficialDataRepository.getTourismStats(20, 0)
  ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <AdminPageHeader
            eyebrow="Master Data"
            title="Official Data"
            description="Manage and review imported official tourism statistics."
          />
          <Link 
            href="/admin/official-data/import" 
            className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#08524b] shrink-0"
          >
            <UploadSimple className="h-4 w-4" />
            Import CSV
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Imports</h2>
            <DataTable 
              columns={[
                { key: "date", label: "Date" },
                { key: "source", label: "Source" },
                { key: "status", label: "Status" },
                { key: "stats", label: "Inserted / Failed", className: "text-right" }
              ]}
            >
              {importLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-slate-500 py-8">
                    No import logs found
                  </td>
                </tr>
              ) : (
                importLogs.map((log: DataImportLog) => (
                  <tr key={log.import_log_id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.imported_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{log.source_name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">
                        {log.source_file_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge 
                        label={log.status} 
                        tone={
                          log.status === 'success' ? 'green' : 
                          log.status === 'partial_success' ? 'gold' : 
                          log.status === 'failed' ? 'red' : 'gray'
                        } 
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-600 font-bold">{log.records_inserted}</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="text-rose-600 font-bold">{log.records_failed}</span>
                    </td>
                  </tr>
                ))
              )}
            </DataTable>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Sample Imported Stats</h2>
            <DataTable 
              columns={[
                { key: "province", label: "Province" },
                { key: "period", label: "Period" },
                { key: "type", label: "Type" },
                { key: "visitors", label: "Visitors", className: "text-right" }
              ]}
            >
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-slate-500 py-8">
                    No statistics available
                  </td>
                </tr>
              ) : (
                stats.map((stat: OfficialTourismStatWithProvince) => (
                  <tr key={stat.official_stat_id}>
                    <td className="px-4 py-3 font-medium">{stat.provinces?.province_name_en || stat.province_id}</td>
                    <td className="px-4 py-3">
                      {stat.month ? `${stat.month}/${stat.year}` : stat.year}
                    </td>
                    <td className="px-4 py-3 capitalize">{stat.tourist_type}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {stat.visitor_count.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </DataTable>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <FileCsv className="h-4 w-4 text-[#D6A13D]" /> CSV Format Guide
          </h3>
          <p className="mb-2 text-slate-600">
            Your CSV file must include the following headers: 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">province_name</code>, 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">year</code>, 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">visitor_count</code>.
          </p>
          <p className="text-slate-600">
            Optional headers: 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">month</code> (1-12), 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">tourist_type</code> (thai, foreign, total), 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">revenue_amount</code>, 
            <code className="mx-1 text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded">currency_code</code>.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}

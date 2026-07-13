import { AdminShell } from "@/components/admin/AdminShell";

export default function DashboardLoading() {
  return (
    <AdminShell>
      <div aria-busy="true" aria-label="กำลังโหลด Dashboard" className="animate-pulse space-y-5">
        <div className="space-y-2"><div className="h-4 w-32 rounded bg-slate-200" /><div className="h-8 w-64 max-w-full rounded bg-slate-200" /><div className="h-4 w-full max-w-xl rounded bg-slate-100" /></div>
        <div className="h-16 rounded-lg bg-slate-100" />
        <div className="h-24 rounded-lg bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 rounded-lg bg-slate-100" />)}</div>
        <div className="grid gap-4 xl:grid-cols-2"><div className="h-72 rounded-lg bg-slate-100" /><div className="h-72 rounded-lg bg-slate-100" /></div>
      </div>
    </AdminShell>
  );
}

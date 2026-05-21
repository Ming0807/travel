import { ImportForm } from "./import-form";

export const metadata = {
  title: "Import Official Data | Admin Dashboard",
};

export default function ImportOfficialDataPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Import Official Data</h1>
        <p className="text-slate-500 mt-1">
          Upload a CSV file containing official tourism statistics.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <ImportForm />
      </div>
    </div>
  );
}

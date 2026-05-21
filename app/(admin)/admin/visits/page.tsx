export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminVisits } from "@/lib/repositories/admin-visit.repository";
import { adminVisitFiltersSchema } from "@/lib/validation/admin-visit";
import { Certificate, Stamp } from "@phosphor-icons/react/dist/ssr";
import { ExportButton } from "@/components/admin/ExportButton";

export const metadata: Metadata = {
  title: "Visit Records | Admin",
};

const columns = [
  { key: "date", label: "วันที่" },
  { key: "tourist", label: "นักท่องเที่ยว" },
  { key: "attraction", label: "แหล่งท่องเที่ยว", className: "hidden md:table-cell" },
  { key: "province", label: "จังหวัด", className: "hidden lg:table-cell" },
  { key: "status", label: "สถานะ" },
  { key: "rewards", label: "รางวัล", className: "hidden md:table-cell" },
];

const statusOptions = [
  { value: "started", label: "เริ่มต้น" },
  { value: "minimal_form_completed", label: "กรอกฟอร์มแล้ว" },
  { value: "photo_uploaded", label: "อัปโหลดภาพแล้ว" },
  { value: "certificate_generated", label: "สร้างใบประกาศแล้ว" },
  { value: "survey_completed", label: "ทำแบบสอบถามแล้ว" },
  { value: "abandoned", label: "ยกเลิก" },
];

const statusToneMap: Record<string, "green" | "gold" | "gray" | "red" | "teal"> = {
  started: "gray",
  minimal_form_completed: "gold",
  photo_uploaded: "teal",
  certificate_generated: "green",
  survey_completed: "green",
  abandoned: "red",
};

const statusLabelMap: Record<string, string> = {
  started: "เริ่มต้น",
  minimal_form_completed: "กรอกฟอร์ม",
  photo_uploaded: "อัปโหลดภาพ",
  certificate_generated: "ใบประกาศ",
  survey_completed: "แบบสอบถาม",
  abandoned: "ยกเลิก",
};

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("visit.read");
  const raw = await searchParams;
  const parsed = adminVisitFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminVisits(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Data Records"
          title="Visit Records"
          description="บันทึกการเข้าชมทั้งหมดจากระบบ QR Check-in"
          actions={<ExportButton endpoint="/api/admin/export/visits" label="Export CSV" />}
        />

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหา..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="completionStatus"
            options={statusOptions}
          />
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบบันทึกการเข้าชม"
            description="ยังไม่มีนักท่องเที่ยว Check-in หรือลองเปลี่ยนตัวกรอง"
          />
        ) : (
          <>
            <DataTable columns={columns}>
              {items.map((visit) => (
                <tr key={visit.visit_id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-[#073F37]">
                      {new Date(visit.visit_date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(visit.created_at).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {visit.tourist_display_name ?? "Guest"}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-xs font-semibold text-slate-600">
                      {visit.attraction_name_th ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-xs text-slate-500">
                      {visit.province_name_th ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={statusLabelMap[visit.completion_status] ?? visit.completion_status}
                      tone={statusToneMap[visit.completion_status] ?? "gray"}
                    />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex items-center gap-2">
                      {visit.has_certificate && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#0A6B62]">
                          <Certificate size={14} weight="fill" /> ใบประกาศ
                        </span>
                      )}
                      {visit.has_stamp && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#D6A13D]">
                          <Stamp size={14} weight="fill" /> ตราประทับ
                        </span>
                      )}
                      {!visit.has_certificate && !visit.has_stamp && (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} pageSize={pageSize} total={total} />
          </>
        )}
      </div>
    </AdminShell>
  );
}

import Link from "next/link";
import { Edit3, ExternalLink } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { StatusBadge } from "@/components/admin/StatusBadge";

export type AttractionTableRow = {
  attraction_id: number;
  name_th: string;
  name_en: string | null;
  slug: string;
  province_name: string;
  type_name: string | null;
  is_published: boolean;
  is_active: boolean;
  photo_spot_count: number;
  checkin_code_count: number;
  updated_at: string | null;
};

type AttractionTableProps = {
  rows: AttractionTableRow[];
  permissions: readonly string[];
};

export function AttractionTable({ rows, permissions }: AttractionTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        description="ยังไม่มีรายการที่ตรงกับเงื่อนไข ควรเริ่มจากสร้างแหล่งท่องเที่ยวหลักก่อนจึงผูก photo spot และ QR check-in code ภายหลัง"
        title="ไม่พบแหล่งท่องเที่ยว"
      />
    );
  }

  return (
    <DataTable
      columns={[
        { key: "name", label: "Attraction", className: "min-w-64" },
        { key: "province", label: "Province" },
        { key: "status", label: "Status" },
        { key: "flow", label: "QR Flow" },
        { key: "updated", label: "Updated" },
        { key: "actions", label: "Actions", className: "text-right" }
      ]}
    >
      {rows.map((row) => (
        <tr className="align-top" key={row.attraction_id}>
          <td className="px-4 py-4">
            <p className="font-black text-[#073F37]">{row.name_th}</p>
            <p className="mt-1 text-xs text-slate-500">{row.name_en || row.slug}</p>
          </td>
          <td className="px-4 py-4">
            <p className="font-bold">{row.province_name}</p>
            <p className="mt-1 text-xs text-slate-500">{row.type_name || "ไม่ระบุประเภท"}</p>
          </td>
          <td className="space-y-2 px-4 py-4">
            <StatusBadge label={row.is_published ? "Published" : "Draft"} tone={row.is_published ? "green" : "gold"} />
            <StatusBadge label={row.is_active ? "Active" : "Inactive"} tone={row.is_active ? "teal" : "gray"} />
          </td>
          <td className="px-4 py-4 text-sm">
            <p>{row.photo_spot_count} photo spots</p>
            <p className="text-slate-500">{row.checkin_code_count} QR codes</p>
          </td>
          <td className="px-4 py-4 text-xs text-slate-500">{row.updated_at ? new Date(row.updated_at).toLocaleDateString("th-TH") : "No update"}</td>
          <td className="px-4 py-4">
            <div className="flex justify-end gap-2">
              <Link className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" href={`/attractions/${row.slug}`} title="Open public page">
                <ExternalLink aria-hidden="true" size={16} />
              </Link>
              <PermissionGate permissions={permissions} anyOf={["attraction.update", "attraction.manage"]}>
                <Link className="rounded-full bg-[#073F37] p-2 text-white hover:bg-[#0A6B62]" href={`/admin/attractions/${row.attraction_id}/edit`} title="Edit attraction">
                  <Edit3 aria-hidden="true" size={16} />
                </Link>
              </PermissionGate>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

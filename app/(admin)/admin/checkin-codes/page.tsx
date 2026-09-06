export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut, CheckCircle, QrCode, ShieldCheck, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { listAdminCheckinCodes } from "@/lib/repositories/admin-checkin-code.repository";
import { adminCheckinCodeFiltersSchema } from "@/lib/validation/checkin-code";
import { CheckinCodeStatusAction } from "@/components/admin/checkin-codes/CheckinCodeStatusAction";
import { DownloadQrAction } from "@/components/admin/checkin-codes/DownloadQrAction";
import { CopyCheckinUrlAction } from "@/components/admin/checkin-codes/CopyCheckinUrlAction";
import { ExportButton } from "@/components/admin/ExportButton";
import { getAdminAttractionsList, getAdminPhotoSpotsList } from "@/lib/repositories/admin-attraction.repository";

export const metadata: Metadata = {
  title: "QR Check-in Codes | Admin",
};

const columns = [
  { key: "code", label: "รหัสเช็กอิน" },
  { key: "attraction", label: "สถานที่", className: "hidden md:table-cell" },
  { key: "spot", label: "จุดถ่ายภาพ", className: "hidden lg:table-cell" },
  { key: "label", label: "ชื่ออ้างอิง", className: "hidden lg:table-cell" },
  { key: "period", label: "ช่วงเวลา", className: "hidden xl:table-cell" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-48" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

function AttractionStatusWarnings({
  isActive,
  isPublished,
}: {
  isActive: boolean | null;
  isPublished: boolean | null;
}) {
  if (isActive !== false && isPublished !== false) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {isActive === false ? <StatusBadge label="Attraction inactive" tone="red" /> : null}
      {isPublished === false ? <StatusBadge label="Attraction draft" tone="gold" /> : null}
    </div>
  );
}

function getAvailabilityStatus(startsAt: string | null, endsAt: string | null) {
  const now = Date.now();
  if (startsAt && new Date(startsAt).getTime() > now) {
    return { label: "ยังไม่เริ่ม", tone: "gold" as const };
  }
  if (endsAt && new Date(endsAt).getTime() < now) {
    return { label: "หมดอายุ", tone: "gray" as const };
  }
  return { label: "อยู่ในช่วงเวลา", tone: "green" as const };
}

function CheckinCodeActions({
  code,
  label,
  id,
  canEdit,
  canDownload,
}: {
  code: string;
  label?: string | null;
  id: number;
  canEdit: boolean;
  canDownload: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/checkin-codes/${id}/nfc`} className="inline-flex min-h-11 items-center rounded border border-slate-200 bg-white px-3 text-xs font-bold text-teal-800">NFC</Link>
      <CopyCheckinUrlAction code={code} />
      {canEdit ? (
        <Link
          href={`/admin/checkin-codes/${id}/edit`}
          aria-label={`แก้ไขรหัส ${code}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0A6B62]"
        >
          <PencilSimple size={18} weight="bold" />
        </Link>
      ) : null}
      <Link
        href={`/c/${code}`}
        target="_blank"
        aria-label={`เปิดหน้าทดสอบ QR ${code}`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0A6B62]"
      >
        <ArrowSquareOut size={18} weight="bold" />
      </Link>
      {canDownload ? <DownloadQrAction code={code} label={label || code} /> : null}
    </div>
  );
}

export default async function AdminCheckinCodesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("checkin_code.read");
  const raw = await searchParams;
  const parsed = adminCheckinCodeFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const [{ items, total, page, pageSize }, attractionsList, photoSpotsList] = await Promise.all([
    listAdminCheckinCodes(filters),
    getAdminAttractionsList(),
    getAdminPhotoSpotsList(),
  ]);
  const canCreate = hasPermission(guard.actor, "checkin_code.create");
  const canEdit = hasPermission(guard.actor, "checkin_code.update");
  const canToggle = hasPermission(guard.actor, "checkin_code.deactivate");
  const canDownload = hasPermission(guard.actor, "checkin_code.download_qr");
  const canExport = hasPermission(guard.actor, "export.checkin_codes");

  return (
    <ListPageShell
      eyebrow="Content Management"
      title="QR Check-in Codes"
      description="จัดการ QR ที่นักท่องเที่ยวสแกนเพื่อเข้า flow check-in, certificate, และ stamp"
      createHref="/admin/checkin-codes/new"
      createLabel="สร้างรหัสใหม่"
      hideCreateButton={!canCreate}
      headerActions={canExport ? <ExportButton endpoint="/api/admin/export/checkin-codes" label="ส่งออก" /> : null}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle="ไม่พบ Check-in Code"
      emptyDescription="ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองก่อนสร้าง QR ใหม่"
      filters={
        <FilterBar>
          <div className="w-full sm:min-w-[220px] sm:flex-1">
            <SearchInput placeholder="ค้นหารหัส, label..." />
          </div>
          <FilterSelect
            label="สถานที่"
            paramKey="attractionId"
            allLabel="ทุกสถานที่"
            options={attractionsList.map((a) => ({
              value: a.attraction_id.toString(),
              label: a.name_th,
            }))}
          />
          <FilterSelect
            label="จุดถ่ายภาพ"
            paramKey="photoSpotId"
            allLabel="ทุกจุดถ่ายภาพ"
            options={photoSpotsList.map((spot) => ({
              value: spot.photo_spot_id.toString(),
              label: `${spot.spot_name_th}${spot.is_active ? "" : " (ปิดใช้งาน)"}`,
            }))}
          />
          <FilterSelect
            label="การเปิดใช้งาน"
            paramKey="isActive"
            allLabel="ทั้งหมด"
            options={[
              { value: "true", label: "เปิดใช้งาน" },
              { value: "false", label: "ปิดใช้งาน" },
            ]}
          />
          <FilterSelect
            label="ช่วงเวลา"
            paramKey="availability"
            allLabel="ทุกช่วงเวลา"
            options={[
              { value: "current", label: "อยู่ในช่วงเวลา" },
              { value: "upcoming", label: "ยังไม่เริ่ม" },
              { value: "expired", label: "หมดอายุ" },
            ]}
          />
        </FilterBar>
      }
    >
      <section className="grid gap-3 rounded-2xl border border-[#0A6B62]/15 bg-[#E6F4EF] p-4 text-sm text-[#073F37] shadow-sm md:grid-cols-3">
        <div className="flex gap-3">
          <QrCode className="mt-0.5 shrink-0" size={22} weight="duotone" />
          <div>
            <p className="font-black">1 QR ต่อ 1 จุดจริง</p>
            <p className="mt-1 leading-6">ผูกกับสถานที่หลัก และเลือก photo spot เฉพาะเมื่อมีจุดถ่ายภาพจริง</p>
          </div>
        </div>
        <div className="flex gap-3">
          <CheckCircle className="mt-0.5 shrink-0" size={22} weight="duotone" />
          <div>
            <p className="font-black">ทดสอบก่อนพิมพ์</p>
            <p className="mt-1 leading-6">เปิดหน้า QR หรือ copy URL เพื่อตรวจหน้า scan ก่อนนำไปติดหน้างาน</p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 shrink-0" size={22} weight="duotone" />
          <div>
            <p className="font-black">ไม่แยก QR ตามตัวตน</p>
            <p className="mt-1 leading-6">QR เดียวรองรับ guest, LINE, email และนักท่องเที่ยวต่างชาติ</p>
          </div>
        </div>
      </section>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable columns={columns}>
          {items.map((code) => (
            <tr key={code.checkin_code_id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <p className="font-mono text-sm font-bold text-[#073F37]">{code.code}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">/c/{code.code}</p>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <span className="text-xs font-semibold text-slate-600">
                  {code.attraction_name_th ?? "-"}
                </span>
                <AttractionStatusWarnings
                  isActive={code.attraction_is_active}
                  isPublished={code.attraction_is_published}
                />
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">
                <span className="text-xs text-slate-500">{code.photo_spot_name_th ?? "-"}</span>
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">
                <span className="text-xs text-slate-500">{code.label ?? "-"}</span>
              </td>
              <td className="hidden px-4 py-3 xl:table-cell">
                <span className="text-[11px] text-slate-400">
                  {formatDate(code.starts_at)} - {formatDate(code.ends_at)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <StatusBadge
                    label={code.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    tone={code.is_active ? "green" : "red"}
                  />
                  <StatusBadge {...getAvailabilityStatus(code.starts_at, code.ends_at)} />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <CheckinCodeActions
                    code={code.code}
                    label={code.label}
                    id={code.checkin_code_id}
                    canEdit={canEdit}
                    canDownload={canDownload}
                  />
                  {canToggle ? (
                    <CheckinCodeStatusAction
                      checkinCodeId={code.checkin_code_id}
                      isActive={code.is_active}
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {items.map((code) => (
          <div
            key={code.checkin_code_id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-mono text-sm font-bold text-[#073F37]">{code.code}</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">/c/{code.code}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge
                  label={code.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  tone={code.is_active ? "green" : "red"}
                />
                <StatusBadge {...getAvailabilityStatus(code.starts_at, code.ends_at)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">สถานที่</p>
                <p className="font-semibold text-slate-700">{code.attraction_name_th ?? "-"}</p>
                <AttractionStatusWarnings
                  isActive={code.attraction_is_active}
                  isPublished={code.attraction_is_published}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500">จุดถ่ายภาพ</p>
                <p className="font-semibold text-slate-700">{code.photo_spot_name_th ?? "-"}</p>
              </div>
              {code.label ? (
                <div>
                  <p className="text-xs text-slate-500">ชื่ออ้างอิง</p>
                  <p className="font-semibold text-slate-700">{code.label}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-slate-500">ช่วงเวลา</p>
                <p className="text-[11px] text-slate-500">
                  {formatDate(code.starts_at)} - {formatDate(code.ends_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <CheckinCodeActions
                code={code.code}
                label={code.label}
                id={code.checkin_code_id}
                canEdit={canEdit}
                canDownload={canDownload}
              />
              {canToggle ? (
                <CheckinCodeStatusAction
                  checkinCodeId={code.checkin_code_id}
                  isActive={code.is_active}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ListPageShell>
  );
}

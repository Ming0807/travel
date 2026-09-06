import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { NfcCreateForm, NfcTagControls, NfcTagHistory } from "@/components/admin/checkin-codes/NfcManagementForms";
import { requirePermission, hasPermission } from "@/lib/auth/guards";
import { getAdminCheckinCodeById } from "@/lib/repositories/admin-checkin-code.repository";
import { listNfcManagement } from "@/lib/services/admin-nfc.service";
import { buildNfcPayload } from "@/lib/nfc/contract";
import { adminNfcFiltersSchema } from "@/lib/validation/admin-nfc";
export const dynamic = "force-dynamic";
export const metadata = { title: "NFC Tags | Admin" };
const labels = { draft: "ฉบับร่าง", active: "เปิดใช้งาน", inactive: "พักใช้งาน", revoked: "ยกเลิกถาวร" };

export default async function NfcTagsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guard = await requirePermission("checkin_code.read");
  const id = z.coerce.number().int().positive().safe().safeParse((await params).id);
  if (!id.success) notFound();
  const code = await getAdminCheckinCodeById(id.data);
  if (!code) notFound();
  const query = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  let result;
  let unavailable = false;
  const parsedFilters = adminNfcFiltersSchema.safeParse({ page: first(query.page) ?? 1, status: first(query.status) || undefined, q: first(query.q), checkinCodeId: id.data });
  const invalidFilters = !parsedFilters.success;
  try { result = parsedFilters.success ? await listNfcManagement(parsedFilters.data) : { rows: [], total: 0, page: 1, pageSize: 20 }; }
  catch { unavailable = true; result = { rows: [], total: 0, page: 1, pageSize: 20 }; }
  const canManage = hasPermission(guard.actor, "checkin_code.manage");
  return <ListPageShell admin={guard} eyebrow="Check-in Operations" title={`NFC · ${code.label || code.code}`} description={`${code.attraction_name_th ?? code.code}${code.photo_spot_name_th ? ` · ${code.photo_spot_name_th}` : ""}`} hideCreateButton
    total={result.total} page={result.page} pageSize={result.pageSize}
    headerActions={<Link href="/admin/checkin-codes" className="text-sm font-bold text-orange-800">กลับจุดเช็กอิน</Link>}
    emptyTitle={invalidFilters ? "ตัวกรองไม่ถูกต้อง" : unavailable ? "ยังอ่านทะเบียน NFC ไม่ได้" : "ยังไม่มีแท็กในขอบเขตนี้"}
    emptyDescription={invalidFilters ? "ตรวจคำค้น สถานะ และเลขหน้า แล้วค้นหาอีกครั้ง" : unavailable ? "ตรวจการติดตั้ง migration และการเชื่อมต่อ แล้วรีเฟรชอีกครั้ง" : "แท็กใหม่จะเริ่มเป็นฉบับร่างก่อนตรวจและเปิดใช้"}
    filters={<div className="space-y-4">
      <form className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm font-semibold">ค้นหาชื่อแท็ก<input name="q" maxLength={80} defaultValue={first(query.q) ?? ""} className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3" /></label>
        <label className="text-sm font-semibold">สถานะ<select name="status" defaultValue={first(query.status) ?? ""} className="mt-1 block min-h-11 rounded border border-slate-300 bg-white px-3"><option value="">ทุกสถานะ</option>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <button className="min-h-11 rounded border border-slate-300 bg-white px-4 text-sm font-bold">ค้นหา</button>
        <Link href={`/admin/checkin-codes/${id.data}/nfc`} className="inline-flex min-h-11 items-center px-2 text-sm font-bold text-orange-800">ล้างตัวกรอง</Link>
      </form>
      {canManage && !unavailable ? <NfcCreateForm checkinCodeId={id.data} /> : null}
    </div>}>
    <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {result.rows.map((tag) => {
        let payload: string | null = null;
        try { payload = buildNfcPayload(process.env.NEXT_PUBLIC_APP_URL ?? "", tag.code_snapshot, tag.public_token); } catch { /* Missing trusted origin disables encoding. */ }
        return <article key={`${tag.nfc_tag_id}-${tag.version}`} className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-950">{tag.label}</h2><p className="mt-1 text-xs text-slate-500">เวอร์ชัน {tag.version} · {new Date(tag.updated_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</p></div><span className="text-sm font-bold text-teal-800">{labels[tag.status]}</span></div>
          <details className="mt-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-orange-800">รายละเอียดและจัดการแท็ก</summary>
            {canManage ? <NfcTagControls tag={tag} payload={payload} /> : <p className="text-sm">สิทธิ์อ่านอย่างเดียว</p>}
            <NfcTagHistory tagId={tag.nfc_tag_id} />
          </details>
        </article>;
      })}
    </div>
  </ListPageShell>;
}

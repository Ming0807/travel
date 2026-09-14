"use client";
import { useRef, useState } from "react";
import { ArrowClockwise, CaretLeft, CaretRight, Files } from "@phosphor-icons/react";
import { getAdminNfcEvidenceInventoryAction } from "@/app/actions/admin-nfc-inventory-actions";
import type { NfcEvidenceInventoryRow } from "@/lib/validation/nfc-evidence-inventory";

const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50";
const cleanup = { none: "ไม่มีรายการรอจัดการไฟล์", pending: "มีรายการรอดำเนินการ", acknowledged: "มีบันทึกตอบรับการลบ" };
export function NfcEvidenceInventory({ tagId }: { tagId: string }) {
  return <InventoryPanel key={tagId} tagId={tagId} />;
}
function InventoryPanel({ tagId }: { tagId: string }) {
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ rows: NfcEvidenceInventoryRow[]; nextAfterAssetId: string | null } | null>(null);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  async function load(path: (string | undefined)[]) {
    if (busy.current) return;
    busy.current = true; setPending(true); setError(""); setResult(null); setDisabled(false);
    try {
      const afterAssetId = path[path.length - 1];
      const response = await getAdminNfcEvidenceInventoryAction({ tagId, ...(afterAssetId ? { afterAssetId } : {}) });
      setLoaded(true);
      if (!response.success) { setError(response.message); return; }
      setDisabled(!response.enabled);
      if (response.enabled) { setResult(response); setCursors(path); }
    } catch { setError("เชื่อมต่อไม่สำเร็จ กรุณาลองโหลดรายการหลักฐานอีกครั้ง"); }
    finally { busy.current = false; setPending(false); }
  }
  return <section aria-label="รายการหลักฐาน NFC" aria-busy={pending} className="mt-6 min-w-0 border-t border-slate-200 pt-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><Files size={22} className="text-emerald-700" />รายการหลักฐาน</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">รูปหลักฐานที่ลงทะเบียนกับแท็กนี้</p></div>
      <button type="button" className={button} disabled={pending} onClick={() => void load([undefined])}><ArrowClockwise size={18} className={pending ? "motion-safe:animate-spin" : ""} />{loaded ? "รีเฟรชรายการหลักฐาน" : "โหลดรายการหลักฐาน"}</button>
    </header>
    {pending && <p role="status" className="py-5 text-sm text-slate-600">กำลังอ่านรายการหลักฐาน…</p>}
    {error ? <p role="alert" className="mt-4 border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-950">{error}</p>
      : disabled ? <p role="status" className="py-5 text-sm text-slate-600">ยังไม่เปิดรายการตรวจสอบหลักฐาน</p>
      : result && <>
        <p className="mt-4 text-xs text-slate-600">แสดง {result.rows.length} รายการ · หน้า {cursors.length}</p>
        {!result.rows.length && <p className="py-6 text-sm text-slate-600">ยังไม่มีหลักฐานที่ลงทะเบียนในหน้านี้</p>}
        <ul className="mt-2 divide-y divide-slate-200">{result.rows.map(row => <li key={row.asset_id} className="grid min-w-0 gap-3 py-4 sm:grid-cols-2">
          <div className="min-w-0"><p className="break-all font-mono text-xs font-semibold leading-5 text-slate-800">{row.asset_id}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{new Date(row.created_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" })} · {row.provider === "supabase" ? "Supabase" : "Cloudinary"}</p></div>
          <div className="min-w-0"><span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${row.attached ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{row.attached ? "แนบรายงานแล้ว" : "ยังไม่แนบรายงาน"}</span>
            <p className={`mt-2 text-xs leading-5 ${row.has_intent ? "text-slate-600" : "text-amber-900"}`}>{row.has_intent ? "มีข้อมูลคำขออัปโหลด" : "ข้อมูลเก่า: ไม่มีคำขออัปโหลด"}</p>
            <p className="text-xs leading-5 text-slate-600">{cleanup[row.cleanup_state]}</p>
            {row.cleanup_state === "acknowledged" && <p className="mt-1 text-xs leading-5 text-amber-900">ยังไม่ได้ตรวจยืนยันสถานะไฟล์ปัจจุบัน</p>}
          </div>
        </li>)}</ul>
        {(cursors.length > 1 || result.nextAfterAssetId) && <nav aria-label="หน้ารายการหลักฐาน" className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
          <button type="button" title="หน้าก่อนหน้า" aria-label="หลักฐานหน้าก่อนหน้า" className={button} disabled={pending || cursors.length === 1} onClick={() => void load(cursors.slice(0, -1))}><CaretLeft size={18} /></button>
          <span className="text-sm text-slate-600">หน้า {cursors.length}</span>
          <button type="button" title="หน้าถัดไป" aria-label="หลักฐานหน้าถัดไป" className={button} disabled={pending || !result.nextAfterAssetId} onClick={() => void load([...cursors, result.nextAfterAssetId!])}><CaretRight size={18} /></button>
        </nav>}
      </>}
  </section>;
}

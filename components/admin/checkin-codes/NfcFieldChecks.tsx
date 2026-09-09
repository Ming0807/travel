"use client";
import { useState, useTransition } from "react";
import { ArrowClockwise, CaretLeft, CaretRight, CheckCircle, ClipboardText } from "@phosphor-icons/react";
import { getAdminNfcFieldChecksAction, saveAdminNfcFieldCheckAction } from "@/app/actions/admin-nfc-actions";
import { nfcFieldCheckSchema, type NfcFieldCheckInput } from "@/lib/validation/nfc-field-check";
import type { AdminNfcTag } from "@/lib/repositories/admin-nfc.repository";
import type { NfcFieldCheckRecord } from "@/lib/repositories/nfc-field-check.repository";
import { NfcEvidencePhoto, NfcEvidencePicker } from "@/components/admin/checkin-codes/NfcEvidencePhotos";

const field = "mt-1 min-h-11 w-full min-w-0 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 disabled:bg-slate-50";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50";
const results = { not_tested: "ยังไม่ทดสอบ", passed: "ผ่าน", failed: "ไม่ผ่าน" };
const tones = { not_tested: "bg-slate-100 text-slate-600", passed: "bg-emerald-50 text-emerald-800", failed: "bg-rose-50 text-rose-800" };

export function NfcFieldChecks({ tag, canManage, evidenceEnabled = false }: { tag: AdminNfcTag; canManage: boolean; evidenceEnabled?: boolean }) {
  return <NfcFieldChecksPanel key={`${tag.nfc_tag_id}:${tag.version}:${evidenceEnabled}`} tag={tag} canManage={canManage} evidenceEnabled={evidenceEnabled} />;
}

function NfcFieldChecksPanel({ tag, canManage, evidenceEnabled }: { tag: AdminNfcTag; canManage: boolean; evidenceEnabled: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [attempt, setAttempt] = useState<NfcFieldCheckInput | null>(null);
  const [history, setHistory] = useState<{ rows: NfcFieldCheckRecord[]; page: number; total: number; pageSize: number } | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [photoBlocked, setPhotoBlocked] = useState(false);
  const [photoReset, setPhotoReset] = useState(0);
  async function load(page = 1) {
    setHistoryError("");
    try {
      const result = await getAdminNfcFieldChecksAction({ tagId: tag.nfc_tag_id, page });
      if (!result.success) { setHistoryError(result.message); return; }
      setHistory(result);
    } catch { setHistoryError("เชื่อมต่อไม่สำเร็จ กรุณาลองโหลดประวัติใหม่"); }
  }
  function submit(value: NfcFieldCheckInput) {
    setMessage(""); setAttempt(value);
    start(async () => {
      try {
        const result = await saveAdminNfcFieldCheckAction(value);
        if (!result.success) { setMessage(result.message); return; }
        setSaved(true); setMessage("บันทึกผลตรวจแล้ว สถานะแท็กยังไม่เปลี่ยน");
        await load();
      } catch { setMessage("ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งรายการเดิมอีกครั้ง"); }
    });
  }
  return <section className="mt-6 min-w-0 border-t border-slate-200 pt-5" aria-label="ตรวจหน้างาน NFC">
    <h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><ClipboardText size={20} />ผลตรวจหน้างาน</h3>
    {canManage && <details className="mt-3" open={attempt !== null || undefined}>
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-orange-800">บันทึกการตรวจครั้งใหม่</summary>
      <form className="mt-3 space-y-4" onSubmit={(event) => {
        event.preventDefault();
        if (photoBlocked) { setMessage("กรุณารอรูปอัปโหลดเสร็จ หรือยกเลิกรูปที่อัปโหลดไม่สำเร็จ"); return; }
        if (attempt) { if (!saved) submit(attempt); return; }
        const data = new FormData(event.currentTarget);
        const parsed = nfcFieldCheckSchema.safeParse({ requestId: crypto.randomUUID(), tagId: tag.nfc_tag_id, version: tag.version,
          locationNote: data.get("location"), deviceLabel: data.get("device"), platform: data.get("platform"),
          nfcResult: data.get("nfc"), qrResult: data.get("qr"), notes: data.get("notes"), evidenceReference: data.get("reference"),
          ...(evidenceEnabled ? { assetIds } : {}) });
        if (!parsed.success) { setMessage(parsed.error.issues[0].message); return; }
        submit(parsed.data);
      }}>
        <fieldset disabled={pending || attempt !== null} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-semibold">ตำแหน่งติดตั้ง<input name="location" required minLength={3} maxLength={300} className={field} /></label>
          <label className="min-w-0 text-sm font-semibold">อุปกรณ์และเบราว์เซอร์<input name="device" required minLength={2} maxLength={120} className={field} /></label>
          <label className="text-sm font-semibold">ระบบอุปกรณ์<select name="platform" className={field}><option value="android">Android</option><option value="ios">iPhone / iPad</option><option value="other">อื่น ๆ</option></select></label>
          <label className="min-w-0 text-sm font-semibold">เลขอ้างอิงหลักฐาน (ถ้ามี)<input name="reference" maxLength={300} className={field} /></label>
          {(["nfc", "qr"] as const).map((name) => <label key={name} className="text-sm font-semibold">ผลทดสอบ {name.toUpperCase()}<select name={name} aria-label={`ผลทดสอบ ${name.toUpperCase()}`} className={field} defaultValue="not_tested">
            {Object.entries(results).map(([value, label]) => <option key={value} value={value} disabled={name === "nfc" && value === "passed" && (!tag.verified_at || tag.status === "revoked")}>{label}</option>)}
          </select></label>)}
          <label className="text-sm font-semibold sm:col-span-2">ปัญหาหรือหมายเหตุ<textarea name="notes" rows={3} maxLength={1000} className={field} /></label>
        </fieldset>
        {evidenceEnabled && <NfcEvidencePicker key={photoReset} tagId={tag.nfc_tag_id} version={tag.version} disabled={pending || attempt !== null} onChange={setAssetIds} onBlockedChange={setPhotoBlocked} />}
        <div className="flex flex-wrap gap-2">
          {!saved && <button disabled={pending || photoBlocked} className={`${button} border-orange-700 bg-orange-700 text-white hover:bg-orange-800`}><CheckCircle size={18} />{pending ? "กำลังบันทึก" : attempt ? "ลองส่งรายการเดิมอีกครั้ง" : "บันทึกผลตรวจ"}</button>}
          {attempt && <button type="button" disabled={pending} className={button} onClick={() => { setAttempt(null); setSaved(false); setMessage(""); setAssetIds([]); setPhotoBlocked(false); setPhotoReset(value => value + 1); }}>เริ่มรายการใหม่</button>}
        </div>
        {attempt && !saved && <p className="text-xs leading-5 text-slate-600">ก่อนเริ่มรายการใหม่ กรุณาตรวจประวัติ รายการก่อนหน้าอาจบันทึกสำเร็จแล้ว</p>}
        {message && <p role="status" className="text-sm leading-6 text-slate-800">{message}</p>}
      </form>
    </details>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
      <h4 className="text-sm font-bold">ประวัติการตรวจ{history ? ` (${history.total})` : ""}</h4>
      <button type="button" disabled={pending} className={button} onClick={() => start(() => load())}><ArrowClockwise size={18} />{history ? "รีเฟรชประวัติ" : "โหลดประวัติ"}</button>
    </div>
    {historyError && <p role="alert" className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{historyError}</p>}
    {history && !historyError && <>
      {!history.rows.length && <p className="py-5 text-sm text-slate-500">ยังไม่มีบันทึกตรวจหน้างาน</p>}
      <ol className="divide-y divide-slate-200">{history.rows.map((row) => <li key={row.request_id} className="min-w-0 space-y-2 py-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><strong className="break-words">{row.location_note}</strong><time className="text-xs text-slate-500">{new Date(row.reported_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</time></div>
        <p className="break-words text-slate-600">{row.device_label} · {row.platform} · เวอร์ชันแท็ก {row.tag_version}</p>
        <div className="flex flex-wrap gap-2">{(["nfc", "qr"] as const).map((channel) => <span key={channel} className={`rounded px-2 py-1 text-xs font-bold ${tones[row[`${channel}_result`] ]}`}>{channel.toUpperCase()}: {results[row[`${channel}_result`]]}</span>)}</div>
        {row.notes && <p className="whitespace-pre-wrap break-words leading-6">{row.notes}</p>}
        {row.evidence_reference && <p className="break-all text-xs text-slate-500">หลักฐาน: {row.evidence_reference}</p>}
        {evidenceEnabled && !!row.photos?.length && <div className="grid gap-3 sm:grid-cols-3">{row.photos.map(photo => <NfcEvidencePhoto key={photo.asset_id} assetId={photo.asset_id} tagId={tag.nfc_tag_id} position={photo.position} />)}</div>}
        <details><summary className="cursor-pointer py-2 text-xs text-slate-500">ข้อมูลอ้างอิงการตรวจ</summary><p className="break-all text-xs leading-5 text-slate-500">รายการ {row.request_id}<br />ผู้บันทึก {row.actor_id}</p></details>
      </li>)}</ol>
      {history.total > history.pageSize && <nav aria-label="หน้าประวัติการตรวจ" className="flex items-center justify-between gap-2 pt-3">
        <button type="button" title="หน้าก่อนหน้า" aria-label="หน้าก่อนหน้า" className={button} disabled={pending || history.page === 1} onClick={() => start(() => load(history.page - 1))}><CaretLeft size={18} /></button>
        <span className="text-xs text-slate-600">หน้า {history.page} / {Math.ceil(history.total / history.pageSize)}</span>
        <button type="button" title="หน้าถัดไป" aria-label="หน้าถัดไป" className={button} disabled={pending || history.page * history.pageSize >= history.total} onClick={() => start(() => load(history.page + 1))}><CaretRight size={18} /></button>
      </nav>}
    </>}
  </section>;
}

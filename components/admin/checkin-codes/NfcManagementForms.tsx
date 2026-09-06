"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Plus, Warning } from "@phosphor-icons/react";
import { saveAdminNfcAction, getAdminNfcHistoryAction } from "@/app/actions/admin-nfc-actions";
import type { AdminNfcTag, AdminNfcEvent } from "@/lib/repositories/admin-nfc.repository";

const field = "mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded bg-orange-700 px-4 py-2 text-sm font-bold text-white hover:bg-orange-800 disabled:opacity-50";

function useNfcSave() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  function save(operation: "create" | "change", input: unknown) {
    setMessage("");
    start(async () => {
      try {
        const result = await saveAdminNfcAction(operation, input);
        setMessage(result.success ? "บันทึกเรียบร้อย" : result.message);
        if (result.success) router.refresh();
      } catch { setMessage("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่"); }
    });
  }
  return { pending, message, save };
}

export function NfcCreateForm({ checkinCodeId, replacesTagId }: { checkinCodeId: number; replacesTagId?: string }) {
  const { pending, message, save } = useNfcSave();
  return <details className="border-y border-slate-200 py-4">
    <summary className="cursor-pointer text-sm font-bold text-orange-800">{replacesTagId ? "สร้างแท็กทดแทน" : "เพิ่มแท็ก NFC"}</summary>
    <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
      event.preventDefault(); const data = new FormData(event.currentTarget);
      save("create", { checkinCodeId, replacesTagId, label: data.get("label"), reason: data.get("reason") });
    }}>
      <label className="text-sm font-semibold">ชื่ออ้างอิงแท็ก<input name="label" required maxLength={80} className={field} /></label>
      <label className="text-sm font-semibold">เหตุผลการเพิ่ม<input name="reason" required minLength={3} maxLength={500} className={field} /></label>
      <div className="sm:col-span-2"><button disabled={pending} className={button}><Plus size={18} />{pending ? "กำลังบันทึก" : "สร้างแท็กฉบับร่าง"}</button><p role="status" className="mt-2 text-sm">{message}</p></div>
    </form>
  </details>;
}

export function NfcTagControls({ tag, payload }: { tag: AdminNfcTag; payload: string | null }) {
  const { pending, message, save } = useNfcSave();
  const [copyMessage, setCopyMessage] = useState("");
  const [target, setTarget] = useState(tag.status === "active" ? "inactive" : "active");
  const canVerify = tag.status === "draft" && !tag.verified_at;
  return <div className="mt-4 space-y-4">
    {payload ? <div className="flex min-w-0 flex-wrap items-start gap-2">
      <code className="min-w-0 flex-1 break-all bg-slate-50 p-3 text-xs leading-5">{payload}</code>
      <button type="button" title="คัดลอก URL สำหรับเขียนแท็ก" aria-label="คัดลอก URL สำหรับเขียนแท็ก" className="flex size-11 items-center justify-center rounded border border-slate-200" onClick={async () => {
        try { await navigator.clipboard.writeText(payload); setCopyMessage("คัดลอกแล้ว"); } catch { setCopyMessage("คัดลอกไม่ได้ กรุณาเลือก URL แล้วคัดลอก"); }
      }}><Copy size={20} /></button><span role="status" className="text-xs">{copyMessage}</span>
    </div> : <p className="text-sm text-amber-900">ยังไม่ได้ตั้งค่าโดเมน HTTPS สำหรับแท็ก</p>}
    {tag.status === "revoked" ? <><p className="flex items-center gap-2 text-sm text-red-800"><Warning size={18} />ยกเลิกถาวรแล้ว</p><NfcCreateForm checkinCodeId={tag.checkin_code_id} replacesTagId={tag.nfc_tag_id} /></> : <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
      event.preventDefault(); const data = new FormData(event.currentTarget);
      const common = { tagId: tag.nfc_tag_id, version: tag.version, reason: data.get("reason") };
      save("change", canVerify ? { ...common, operation: "verify", readBackUrl: data.get("readBackUrl"), verificationReference: data.get("reference") } : { ...common, operation: "status", status: target });
    }}>
      {canVerify ? <>
        <label className="text-sm font-semibold sm:col-span-2">URL ที่อ่านกลับจากแท็ก<input name="readBackUrl" type="url" required maxLength={500} className={field} /></label>
        <label className="text-sm font-semibold">หลักฐานอ้างอิงการตรวจ<input name="reference" required minLength={3} maxLength={500} className={field} /></label>
      </> : <label className="text-sm font-semibold">การดำเนินการ<select className={field} value={target} onChange={(event) => setTarget(event.target.value)}>
        {tag.status !== "active" ? <option value="active">เปิดใช้งาน</option> : <option value="inactive">พักใช้งาน</option>}
        <option value="revoked">ยกเลิกถาวร</option>
      </select></label>}
      <label className="text-sm font-semibold">เหตุผล<input name="reason" required minLength={3} maxLength={500} className={field} /></label>
      {!canVerify && target === "revoked" ? <label className="flex items-start gap-2 text-sm text-red-800 sm:col-span-2"><input type="checkbox" required className="mt-1" />ยืนยันยกเลิกแท็กถาวร ไม่สามารถเปิดแท็กเดิมกลับมาได้</label> : null}
      <div className="sm:col-span-2"><button className={button} disabled={pending || (canVerify && !payload)}><CheckCircle size={18} />{pending ? "กำลังบันทึก" : canVerify ? "ยืนยันผลตรวจ URL" : "บันทึกสถานะ"}</button><p role="status" className="mt-2 text-sm">{message}</p></div>
    </form>}
  </div>;
}

export function NfcTagHistory({ tagId }: { tagId: string }) {
  const [rows, setRows] = useState<AdminNfcEvent[]>([]);
  const [cursor, setCursor] = useState<number | null | undefined>();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return <div className="mt-5 border-t border-slate-100 pt-4">
    {rows.map((event) => <div key={event.version} className="border-b border-slate-100 py-3 text-sm">
      <p className="font-semibold">เวอร์ชัน {event.version} · {new Date(event.occurred_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</p>
      <p className="mt-1 break-words text-slate-600">{event.reason}</p>
    </div>)}
    {cursor !== null ? <button type="button" disabled={pending} className="min-h-11 text-sm font-bold text-orange-800 disabled:opacity-50" onClick={() => start(async () => {
      try {
        const result = await getAdminNfcHistoryAction({ tagId, beforeVersion: cursor });
        if (!result.success) { setMessage(result.message); return; }
        setRows((previous) => [...previous, ...result.rows]); setCursor(result.nextVersion);
        setMessage(result.rows.length ? "" : "ยังไม่มีประวัติ");
      } catch { setMessage("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่"); }
    })}>{pending ? "กำลังโหลด" : rows.length ? "ประวัติก่อนหน้า" : "ดูประวัติการเปลี่ยนแปลง"}</button> : null}
    <p role="status" className="text-sm">{message}</p>
  </div>;
}

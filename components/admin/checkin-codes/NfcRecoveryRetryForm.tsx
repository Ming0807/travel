"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowClockwise, CheckCircle } from "@phosphor-icons/react";
import { requestAdminNfcRecoveryRetryAction } from "@/app/actions/admin-nfc-retry-actions";
import { nfcRecoveryRetryInput, type NfcRecoveryRetryInput } from "@/lib/validation/nfc-recovery-retry";

export function NfcRecoveryRetryForm({ tagId, assetId, expectedAttemptCount, onClose, onScheduled }: {
  tagId: string; assetId: string; expectedAttemptCount: number; onClose: () => void; onScheduled: () => void;
}) {
  const [reason, setReason] = useState("provider_restored");
  const [attempt, setAttempt] = useState<NfcRecoveryRetryInput | null>(null);
  const [status, setStatus] = useState<"draft" | "pending" | "uncertain" | "rejected" | "scheduled">("draft");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  const reasonControl = useRef<HTMLSelectElement>(null);
  useEffect(() => { reasonControl.current?.focus(); }, []);
  async function submit() {
    if (submitting.current || status === "scheduled" || status === "rejected") return;
    submitting.current = true; setMessage(""); setStatus("pending");
    let scheduled = false;
    try {
      const value = attempt ?? nfcRecoveryRetryInput.parse({ requestId: crypto.randomUUID(), tagId, assetId, expectedAttemptCount, reason });
      setAttempt(value);
      const response = await requestAdminNfcRecoveryRetryAction(value);
      if (response.success && response.requestId === value.requestId) {
        scheduled = true; setStatus("scheduled"); setMessage("จัดคิวตรวจซ้ำแล้ว ยังไม่ได้ยืนยันว่ากู้คืนไฟล์สำเร็จ");
      } else if (!response.success) {
        setStatus(response.outcome); setMessage(response.message);
      } else {
        setStatus("uncertain"); setMessage("ยังยืนยันการจัดคิวไม่ได้ กรุณาส่งคำขอเดิมอีกครั้ง");
      }
    } catch {
      setStatus("uncertain"); setMessage("เชื่อมต่อไม่สำเร็จ ยังยืนยันการจัดคิวไม่ได้ กรุณาส่งคำขอเดิมอีกครั้ง");
    } finally { submitting.current = false; }
    // Refresh failures cannot change the already acknowledged mutation result.
    if (scheduled) onScheduled();
  }
  const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50";
  return <form aria-label="คำขอจัดคิวตรวจซ้ำ" aria-busy={status === "pending"} className="my-4 min-w-0 rounded border border-orange-200 bg-orange-50/50 p-4" onSubmit={event => { event.preventDefault(); void submit(); }}>
    <h4 className="text-sm font-bold text-slate-900">จัดคิวตรวจซ้ำ</h4>
    <p className="mt-1 break-all text-xs leading-5 text-slate-600">หลักฐาน {assetId} · ตรวจแล้ว {expectedAttemptCount} ครั้ง</p>
    <label className="mt-3 block text-sm font-medium text-slate-800">เหตุผลในการตรวจซ้ำ
      <select ref={reasonControl} value={reason} disabled={status !== "draft"} onChange={event => setReason(event.target.value)} className="mt-1 min-h-11 w-full min-w-0 rounded border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100">
        <option value="provider_restored">พื้นที่จัดเก็บกลับมาใช้งานได้</option>
        <option value="connectivity_restored">การเชื่อมต่อกลับมาใช้งานได้</option>
        <option value="recheck_requested">ต้องการตรวจสถานะไฟล์อีกครั้ง</option>
      </select>
    </label>
    {message && <p role={status === "rejected" || status === "uncertain" ? "alert" : "status"} className="mt-3 text-sm leading-6 text-slate-800">{message}</p>}
    {attempt && <p className="mt-2 break-all text-xs leading-5 text-slate-500">เลขคำขอ {attempt.requestId}</p>}
    <div className="mt-3 flex flex-wrap gap-2">
      {(status === "draft" || status === "pending" || status === "uncertain") && <button type="submit" disabled={status === "pending"} className={`${button} border-orange-700 bg-orange-700 text-white hover:bg-orange-800`}>
        {status === "uncertain" ? <ArrowClockwise size={18} /> : <CheckCircle size={18} />}{status === "pending" ? "กำลังส่งคำขอ" : status === "uncertain" ? "ส่งคำขอเดิมอีกครั้ง" : "ยืนยันจัดคิวตรวจซ้ำ"}
      </button>}
      {status !== "pending" && status !== "uncertain" && <button type="button" onClick={onClose} className={`${button} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}>{status === "draft" ? "ยกเลิก" : "ปิดคำขอ"}</button>}
    </div>
  </form>;
}

"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowClockwise, ImageSquare, Trash, X } from "@phosphor-icons/react";
import { loadNfcEvidencePhoto, uploadNfcEvidencePhoto } from "@/lib/media/nfc-evidence-client";

const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
type Photo = { assetId: string; url: string; sizeBytes: number };
export function NfcEvidencePicker({ tagId, version, disabled, onChange, onBlockedChange }: {
  tagId: string; version: number; disabled: boolean; onChange: (ids: string[]) => void; onBlockedChange: (blocked: boolean) => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [failed, setFailed] = useState<File | null>(null);
  const [stage, setStage] = useState<"preparing" | "uploading" | null>(null);
  const [error, setError] = useState("");
  const urls = useRef(new Set<string>());
  const alive = useRef(true);
  const working = useRef(false);
  useEffect(() => { alive.current = true; const owned = urls.current; return () => { alive.current = false; for (const url of owned) URL.revokeObjectURL(url); owned.clear(); }; }, []);
  async function upload(file: File) {
    if (disabled || working.current || photos.length >= 3) return;
    working.current = true; onBlockedChange(true); setError(""); setFailed(null);
    try {
      const result = await uploadNfcEvidencePhoto(file, { tagId, version }, next => { if (alive.current) setStage(next); });
      if (!alive.current) return;
      const url = URL.createObjectURL(result.previewFile); urls.current.add(url);
      const next = [...photos, { assetId: result.assetId, url, sizeBytes: result.sizeBytes }];
      setPhotos(next); onChange(next.map(photo => photo.assetId)); onBlockedChange(false);
    } catch (failure) {
      if (alive.current) { setFailed(file); setError(failure instanceof Error ? failure.message : "อัปโหลดไม่สำเร็จ กรุณาลองใหม่"); }
    } finally { working.current = false; if (alive.current) setStage(null); }
  }
  return <section aria-label="รูปหลักฐานการติดตั้ง" className="space-y-3 border-t border-slate-200 pt-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-sm font-bold">รูปหลักฐาน (ไม่บังคับ)</h4><span className="text-xs text-slate-500">{photos.length} / 3 รูป</span></div>
    <p className="text-xs leading-5 text-slate-600">รูปตำแหน่งติดตั้งเท่านั้น หลีกเลี่ยงใบหน้าและข้อมูลส่วนตัว · JPG, PNG, WebP ต้นฉบับไม่เกิน 10 MiB · จัดเก็บไม่เกิน 2 MiB ต่อรูป</p>
    <label className="block text-sm font-semibold">เลือกรูปหลักฐาน<input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || stage !== null || failed !== null || photos.length >= 3} className="mt-2 block min-h-11 w-full min-w-0 text-sm file:mr-3 file:rounded file:border-0 file:bg-orange-50 file:px-3 file:py-3 file:font-semibold file:text-orange-800" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} /></label>
    {stage && <p role="status" className="text-sm text-orange-800">{stage === "preparing" ? "กำลังปรับขนาดรูป…" : "กำลังอัปโหลดรูป…"}</p>}
    {error && <p role="alert" className="text-sm leading-6 text-rose-700">{error}</p>}
    {failed && <div className="flex flex-wrap gap-2"><button type="button" disabled={disabled} className={button} onClick={() => void upload(failed)}><ArrowClockwise size={18} />ลองอัปโหลดใหม่</button><button type="button" disabled={disabled} className={button} onClick={() => { setFailed(null); setError(""); onBlockedChange(false); }}><X size={18} />ยกเลิกรูปนี้</button></div>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo, index) => <figure key={photo.assetId} className="min-w-0 overflow-hidden rounded border border-slate-200">
      {/* Private/local evidence must not enter the public image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={`รูปหลักฐาน ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
      <figcaption className="flex items-center justify-between gap-1 px-2 py-1"><span className="text-xs text-slate-600">{Math.ceil(photo.sizeBytes / 1024)} KiB</span><button type="button" title={`เอารูป ${index + 1} ออก`} aria-label={`เอารูป ${index + 1} ออก`} disabled={disabled || stage !== null} className="inline-flex size-11 shrink-0 items-center justify-center text-rose-700 disabled:opacity-50" onClick={() => { URL.revokeObjectURL(photo.url); urls.current.delete(photo.url); const next = photos.filter(item => item.assetId !== photo.assetId); setPhotos(next); onChange(next.map(item => item.assetId)); }}><Trash size={18} /></button></figcaption>
    </figure>)}</div>
  </section>;
}

export function NfcEvidencePhoto({ assetId, tagId, position }: { assetId: string; tagId: string; position: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="min-w-0 space-y-2">
    <button type="button" disabled={busy} className={button} onClick={async () => {
      setBusy(true); setError("");
      try { setUrl(await loadNfcEvidencePhoto(assetId, tagId)); }
      catch { setError("ยังเปิดรูปไม่ได้ กรุณาลองโหลดใหม่"); }
      finally { setBusy(false); }
    }}><ImageSquare size={18} />{busy ? "กำลังโหลดรูป" : url ? `โหลดรูป ${position} ใหม่` : `ดูรูปหลักฐาน ${position}`}</button>
    {url && <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`รูปหลักฐานการตรวจ ${position}`} referrerPolicy="no-referrer" className="aspect-[4/3] w-full rounded border border-slate-200 object-contain" onError={() => { setUrl(null); setError("ลิงก์รูปอาจหมดอายุ กรุณาโหลดรูปใหม่"); }} />
    </>}
    {error && <p role="alert" className="text-xs leading-5 text-rose-700">{error}</p>}
  </div>;
}

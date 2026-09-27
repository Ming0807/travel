export function NfcEntryVerification({
  officialHost,
  attractionName,
  photoSpotName,
}: {
  officialHost: string;
  attractionName: string;
  photoSpotName?: string | null;
}) {
  return (
    <section aria-label="ตรวจสอบจุดเช็กอิน NFC" className="mb-6 border-y border-teal/20 py-4">
      <p className="text-sm font-bold text-teal">เช็กอินผ่าน NFC</p>
      <p className="mt-2 text-sm leading-6 text-ink">
        ตรวจสอบว่าคุณอยู่ที่ <strong>{attractionName}</strong>
        {photoSpotName ? <> · {photoSpotName}</> : null}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        ที่อยู่เว็บไซต์บนป้ายและในแถบที่อยู่ควรตรงกับ
        <span className="block break-all font-bold text-ink">{officialHost}</span>
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        หากสถานที่หรือเว็บไซต์ไม่ตรงกับป้าย ให้หยุดและสอบถามเจ้าหน้าที่ก่อนกรอกข้อมูล
      </p>
    </section>
  );
}

import { createRoot } from "react-dom/client";
import { NfcCreateForm, NfcTagControls } from "@/components/admin/checkin-codes/NfcManagementForms";
import type { AdminNfcTag } from "@/lib/repositories/admin-nfc.repository";
import "@/app/globals.css";
const tag: AdminNfcTag = {
  nfc_tag_id: "11111111-1111-4111-8111-111111111111", public_token: "11111111-1111-4111-8111-111111111111",
  checkin_code_id: 10, code_snapshot: "fixture-entry", label: "แท็กทดสอบทางเข้าหลัก", status: "draft", version: 1,
  verified_at: null, verification_reference: null, replaces_tag_id: null,
  created_at: "2026-09-05T00:00:00Z", updated_at: "2026-09-05T00:00:00Z",
};
createRoot(document.getElementById("root")!).render(<main className="min-h-screen bg-slate-50 p-4 sm:p-8"><section className="mx-auto max-w-4xl bg-white p-4 sm:p-6">
  <h1 className="text-2xl font-bold">NFC · จุดเช็กอินทดสอบ</h1><p className="my-3 text-sm">ข้อมูลจำลองสำหรับตรวจหน้าจอ ไม่มีการบันทึกจริง</p>
  <NfcCreateForm checkinCodeId={10} /><h2 className="mt-6 text-lg font-bold">{tag.label}</h2>
  <NfcTagControls tag={tag} payload={`https://tourism.example/c/fixture-entry?nfc=${tag.public_token}`} />
</section></main>);

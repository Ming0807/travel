export async function saveAdminNfcAction() { return { success: true as const }; }
export async function saveAdminNfcFieldCheckAction() { return { success: true as const, requestId: "11111111-1111-4111-8111-111111111111" }; }
export async function getAdminNfcFieldChecksAction() {
  return { success: true as const, page: 1, pageSize: 10, total: 1, rows: [{
    request_id: "11111111-1111-4111-8111-111111111111", nfc_tag_id: "11111111-1111-4111-8111-111111111111",
    tag_version: 1, tag_status: "draft" as const, actor_id: "22222222-2222-4222-8222-222222222222",
    location_note: "ป้ายทางเข้าหลักบริเวณจุดเช็กอิน", device_label: "Android Chrome อุปกรณ์ทดสอบหน้างาน", platform: "android" as const,
    nfc_result: "failed" as const, qr_result: "passed" as const, notes: "อ่านแท็กไม่สำเร็จ ต้องตรวจตำแหน่งติดตั้งและทดสอบใหม่", evidence_reference: "FIELD-QA-20260909", reported_at: "2026-09-09T03:00:00Z",
    photos: [{ asset_id: "33333333-3333-4333-8333-333333333333", position: 1 }],
  }] };
}
export async function getAdminNfcHistoryAction() { return { success: true as const, rows: [{ version: 1, event_type: "registered", status: "draft" as const, actor_name: "เจ้าหน้าที่ทดสอบประจำจุดเช็กอินทางเข้าหลัก", reason: "ลงทะเบียนแท็กทดสอบสำหรับตรวจหน้าจอ ไม่ใช่ข้อมูลจากสถานที่จริง", occurred_at: "2026-09-07T00:00:00Z" }], nextVersion: null }; }

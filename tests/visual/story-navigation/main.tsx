import { createRoot } from "react-dom/client";
import { SiteHeader } from "@/components/layout/site-header";
import { StoryVisualEditor } from "@/components/admin/stories/visual-editor/StoryVisualEditor";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import "@/app/globals.css";
import "../dashboard/fixture-fonts.css";

const params = new URLSearchParams(window.location.search);
const story: AdminStoryRow = {
  story_id: 42, title: "เรื่องเล่าจากยะลาที่มีชื่อยาวสำหรับตรวจการจัดวางหน้าจอ", slug: "fixture-yala-story",
  excerpt: "ข้อมูลสังเคราะห์สำหรับตรวจหน้าจอเท่านั้น", content: "<p>เรื่องราวการเดินทางสำหรับตรวจหน้าจอ ไม่มีข้อมูลผู้ใช้จริง</p>",
  content_document: null, content_schema_version: 1, province_id: 1, category: "วัฒนธรรม",
  is_published: false, published_at: null, created_at: "2026-09-30T00:00:00Z", updated_at: "2026-09-30T00:00:00Z",
  province_name_th: "ยะลา", author_type: params.has("tourist") ? "tourist" : "admin", tourist_id: null,
  status: params.has("tourist") ? "submitted" : "draft", tourist_name: null, topic_ids: [1],
  seo_description: null, geographic_scope: "province", primary_language: "th",
  cover_media: params.has("incomplete") ? null : { media_id: 3, is_active: true, alt_text_th: "ภาพทดสอบ", alt_text_en: null },
};
createRoot(document.getElementById("root")!).render(params.has("editor") ? <StoryVisualEditor
  story={story} editorialPermissions={params.has("restricted") ? ["story.update"] : ["system.all"]}
  provinces={[{ province_id: 1, province_name_th: "ยะลา" }]} topics={[{ id: 1, key: "culture", nameTh: "วัฒนธรรม", nameEn: "Culture" }]}
  coverMediaId={story.cover_media?.media_id} coverMediaUrl={story.cover_media ? "/site-media/homepage/yala-belonging-default.webp" : null}
/> : <><SiteHeader appName="ท่องเที่ยวยะลา" /><main style={{ maxWidth: 1000, margin: "60px auto", padding: 24 }}>
  <p style={{ color: "#914630" }}>ข้อมูลสังเคราะห์สำหรับตรวจ UI</p><h1 style={{ fontSize: 32, fontWeight: 700 }}>ค้นพบยะลาผ่านเรื่องเล่า</h1>
  <p>ตรวจ navbar หลังล็อกอิน ชื่อยาว เมนูบัญชี และการใช้งานผ่านคีย์บอร์ด</p>
</main></>);

"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Export, BookmarkSimple, ClockCounterClockwise, Image as ImageIcon } from "@phosphor-icons/react";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";
import { AdminReadinessPanel } from "@/components/admin/forms/AdminFormUX";
import { Drawer } from "@/components/admin/Drawer";
import { HeaderForm, ContentForm, SettingsForm, CoverForm } from "./SectionForms";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import { evaluateStoryReadiness } from "@/lib/content/story-readiness";
import {
  getStoryReadinessAdminItems,
  getStoryRevisionActionLabel,
} from "@/lib/content/story-editorial-presentation";
import { extractStoryOutline } from "@/lib/content/story-outline";
import { getStoryStatusPresentation } from "@/lib/content/story-library";

type StoryRevisionSummary = {
  revisionId: string;
  revisionNumber: number;
  sourceAction: string;
  changeSummary: string | null;
  createdAt: string;
};

type EditorSection = "header" | "content" | "settings" | "cover" | null;

interface StoryVisualEditorProps {
  story: AdminStoryRow;
  provinces: { province_id: number; province_name_th: string }[];
  topics?: {
    id: number;
    key: string;
    nameTh: string;
    nameEn: string | null;
  }[];
  revisions?: StoryRevisionSummary[];
  coverMediaId?: number | null;
  coverMediaUrl?: string | null;
}

function MissingImageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
        <ImageIcon size={28} weight="duotone" />
      </div>
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function StoryVisualEditor({
  story,
  provinces,
  topics = [],
  revisions = [],
  coverMediaId: initialCoverMediaId,
  coverMediaUrl: initialCoverMediaUrl,
}: StoryVisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>(null);
  const [contentDirty, setContentDirty] = useState(false);
  const [editorStory, setEditorStory] = useState(story);
  const [editorialUpdatedAt, setEditorialUpdatedAt] = useState(
    story.updated_at ?? story.created_at
  );
  const [revisionHistory, setRevisionHistory] = useState(revisions);

  const handleEditorialSaved = useCallback((result: {
    updatedAt: string;
    revisionNumber: number;
    patch: Partial<AdminStoryRow>;
  }) => {
    setEditorialUpdatedAt(result.updatedAt);
    setEditorStory((current) => ({
      ...current,
      ...result.patch,
      updated_at: result.updatedAt,
    }));
    if (result.revisionNumber > 0) {
      setRevisionHistory((current) => [
        {
          revisionId: `local-${result.revisionNumber}`,
          revisionNumber: result.revisionNumber,
          sourceAction: "save",
          changeSummary: null,
          createdAt: new Date().toISOString(),
        },
        ...current.filter(
          (revision) => revision.revisionNumber !== result.revisionNumber
        ),
      ].slice(0, 5));
    }
  }, []);

  const closeContentEditor = useCallback((force = false) => {
    if (
      !force &&
      contentDirty &&
      !window.confirm("มีการแก้ไขเนื้อหาที่ยังไม่ได้บันทึก ต้องการปิดหน้าต่างแก้ไขหรือไม่")
    ) {
      return;
    }
    setContentDirty(false);
    setActiveSection(null);
  }, [contentDirty]);

  useEffect(() => {
    let hash = window.location.hash.replace("#", "");
    if (hash === "gallery") hash = "cover"; // content-health maps media to cover
    const validSections: EditorSection[] = ["header", "content", "settings", "cover"];
    if (validSections.includes(hash as EditorSection)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection(hash as EditorSection);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const title = editorStory.title || "ยังไม่มีชื่อเรื่อง";
  const [coverMediaId, setCoverMediaId] = useState(initialCoverMediaId ?? null);
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialCoverMediaUrl ?? null);
  const [contentHtml, setContentHtml] = useState(editorStory.content ?? "");
  const coverImage = coverMediaUrl;
  const category = editorStory.category || "บทความทั่วไป";

  // Format date for display
  const dateStr = editorStory.published_at
    ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(editorStory.published_at))
    : "ยังไม่ได้เผยแพร่";
  const contentWords = contentHtml.trim() ? contentHtml.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length : 0;
  const readTimeThai =
    contentWords > 0
      ? `อ่านประมาณ ${Math.max(1, Math.ceil(contentWords / 220))} นาที`
      : "เพิ่มเนื้อหาเพื่อคำนวณเวลาอ่าน";
  const statusPresentation = getStoryStatusPresentation(editorStory.status);
  const outline = extractStoryOutline(editorStory.content_document);
  const readiness = evaluateStoryReadiness({
    title: editorStory.title,
    slug: editorStory.slug,
    excerpt: editorStory.excerpt,
    contentDocument: editorStory.content_document,
    legacyContent: contentHtml,
    cover: coverMediaUrl
      ? {
          mediaId: editorStory.cover_media?.media_id ?? 1,
          isActive: editorStory.cover_media?.is_active ?? true,
          altText:
            editorStory.cover_media?.alt_text_th ??
            editorStory.cover_media?.alt_text_en,
        }
      : null,
    provinceId: editorStory.province_id,
    geographicScope: editorStory.geographic_scope ?? "province",
    topicIds: editorStory.topic_ids ?? [],
    seoDescription: editorStory.seo_description,
    usesGeneratedSeo: false,
  });

  return (
    <div className="relative min-h-screen bg-background pb-20 text-slate-800">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/admin/stories" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-800">ตัวแก้ไขบทความ: {title}</h1>
            <p className="text-xs font-bold text-slate-500">คุณกำลังแก้ไขหน้าตาแบบเดียวกับที่แสดงผลจริง</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            สถานะ: <span>{statusPresentation.label}</span>
          </div>
          <button 
            onClick={() => setActiveSection("settings")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ตั้งค่า / สถานะ
          </button>
        </div>
      </div>

      {/* Editor Canvas (matches public layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-8">
            
            <EditableBlock id="header" label="ข้อมูลหลัก" isActive={activeSection === "header"} onEdit={() => setActiveSection("header")}>
              <div className="pointer-events-none">
                <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                  <span>หน้าแรก</span> <span>/</span> <span>บทความและเรื่องราว</span> <span>/</span> <span className="text-slate-800">{category}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-sm">{category}</span>
                  <span>{readTimeThai}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 leading-tight">
                  {title}
                </h1>
                <p className="text-slate-500 leading-relaxed text-lg mb-8">
                  {editorStory.excerpt || "ยังไม่มีเกริ่นนำ เพิ่มข้อความสรุปสั้น ๆ ก่อนส่งตรวจ"}
                </p>
              </div>
            </EditableBlock>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-200 mb-8 pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-black uppercase text-slate-400 shadow-sm overflow-hidden">
                  {editorStory.author_type === "tourist" ? "T" : "A"}
                </div>
                <div>
                  <p className="font-black text-slate-800">
                    {editorStory.author_type === "tourist" ? (editorStory.tourist_name ?? "นักท่องเที่ยว") : "ทีมบรรณาธิการ"}
                  </p>
                  <p className="text-xs text-slate-500">{dateStr} · {readTimeThai}</p>
                  {editorStory.author_type === "tourist" && (
                    <p className="mt-1 max-w-md text-xs uppercase font-bold tracking-wider text-orange-500">
                      เรื่องราวจากนักท่องเที่ยว
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button className="flex items-center gap-2 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-full"><Export size={14} /> แชร์</button>
                <button className="flex items-center gap-2 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-full"><BookmarkSimple size={14} /> บันทึก</button>
              </div>
            </div>

            <EditableBlock id="cover" label="รูปภาพปก" isActive={activeSection === "cover"} onEdit={() => setActiveSection("cover")}>
              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-sm border border-slate-200 pointer-events-none">
                {coverImage ? (
                  <Image src={coverImage} alt={title} fill className="object-cover" unoptimized />
                ) : (
                  <MissingImageState
                    title="ยังไม่มีรูปภาพปก"
                    description="เลือกรูปจากคลังสื่อและเพิ่มคำอธิบายภาพก่อนเผยแพร่"
                  />
                )}
              </div>
            </EditableBlock>

              <EditableBlock id="content" label="เนื้อหาบทความ" isActive={activeSection === "content"} onEdit={() => setActiveSection("content")}>
                {contentHtml && editorStory.author_type !== "tourist" && /<[a-z][\s\S]*>/i.test(contentHtml) ? (
                  <article 
                    className="prose prose-lg max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-black prose-a:text-orange-500 pointer-events-none prose-img:rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                ) : (
                  <article className="prose prose-lg max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-black prose-a:text-orange-500 pointer-events-none whitespace-pre-wrap">
                    {contentHtml || "ยังไม่มีเนื้อหาฉบับเต็ม เพิ่มเนื้อหาก่อนส่งตรวจ"}
                  </article>
                )}
              </EditableBlock>

          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <AdminReadinessPanel
                title="ความพร้อมก่อนเผยแพร่"
                items={getStoryReadinessAdminItems(readiness)}
              />

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ClockCounterClockwise
                    size={20}
                    weight="duotone"
                    className="text-[#0A6B62]"
                  />
                  <h3 className="text-sm font-black text-[#073F37]">
                    ประวัติการแก้ไข
                  </h3>
                </div>
                {revisionHistory.length ? (
                  <ol className="mt-4 space-y-4">
                    {revisionHistory.slice(0, 5).map((revision) => (
                      <li
                        key={revision.revisionId}
                        className="border-l-2 border-slate-200 pl-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-slate-800">
                            {revision.changeSummary ||
                              getStoryRevisionActionLabel(revision.sourceAction)}
                          </p>
                          <span className="shrink-0 text-xs font-bold text-slate-400">
                            #{revision.revisionNumber}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Intl.DateTimeFormat("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(revision.createdAt))}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    ยังไม่มีประวัติการแก้ไข บันทึกครั้งแรกเพื่อสร้าง revision
                  </p>
                )}
              </section>
              
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-[#073F37]">สารบัญ</h3>
                {outline.length ? (
                  <ol className="mt-4 space-y-3">
                    {outline.map((item) => (
                      <li
                        key={item.key}
                        className={`text-sm leading-5 text-slate-600 ${
                          item.level >= 3 ? "pl-4" : ""
                        }`}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    เพิ่มหัวข้อระดับ 2-4 ในเนื้อหาเพื่อสร้างสารบัญอัตโนมัติ
                  </p>
                )}
              </section>

              <div className="pointer-events-none">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">ผู้เขียน</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-black text-slate-500">
                      {editorStory.author_type === "tourist" ? "T" : "A"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {editorStory.author_type === "tourist" ? (editorStory.tourist_name ?? "นักท่องเที่ยว") : "ทีมบรรณาธิการ"}
                      </p>
                      <p className="text-xs text-slate-500">{editorStory.author_type === "tourist" ? "นักท่องเที่ยว" : "ทีมงาน"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Drawers */}
      <Drawer isOpen={activeSection === "header"} onClose={() => setActiveSection(null)} title="แก้ไขข้อมูลหลัก" bodyClassName="p-0">
        <HeaderForm
          story={editorStory}
          expectedUpdatedAt={editorialUpdatedAt}
          onEditorialSaved={handleEditorialSaved}
          onClose={() => setActiveSection(null)}
        />
      </Drawer>
      <Drawer isOpen={activeSection === "cover"} onClose={() => setActiveSection(null)} title="รูปภาพปก" bodyClassName="p-0">
        <CoverForm
          story={editorStory}
          onClose={() => setActiveSection(null)}
          coverMediaId={coverMediaId}
          coverMediaUrl={coverMediaUrl}
          onEditorialSaved={handleEditorialSaved}
          onCoverChange={(id, url) => {
            setCoverMediaId(id);
            setCoverMediaUrl(url);
          }}
        />
      </Drawer>
      <Drawer isOpen={activeSection === "content"} onClose={() => closeContentEditor()} title="เนื้อหาบทความ" size="lg" bodyClassName="p-0">
        <ContentForm
          story={editorStory}
          expectedUpdatedAt={editorialUpdatedAt}
          onEditorialSaved={handleEditorialSaved}
          onClose={() => closeContentEditor(true)}
          onDirtyChange={setContentDirty}
          onContentSaved={(html) => setContentHtml(html)}
        />
      </Drawer>
      <Drawer isOpen={activeSection === "settings"} onClose={() => setActiveSection(null)} title="ตั้งค่าหมวดหมู่และสถานะ" bodyClassName="p-0">
        <SettingsForm
          story={editorStory}
          provinces={provinces}
          topics={topics}
          expectedUpdatedAt={editorialUpdatedAt}
          onEditorialSaved={handleEditorialSaved}
          onClose={() => setActiveSection(null)}
        />
      </Drawer>

    </div>
  );
}

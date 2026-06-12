"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Export, BookmarkSimple, Image as ImageIcon } from "@phosphor-icons/react";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";
import { Drawer } from "@/components/admin/Drawer";
import { HeaderForm, ContentForm, SettingsForm, CoverForm } from "./SectionForms";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

type EditorSection = "header" | "content" | "settings" | "cover" | null;

interface StoryVisualEditorProps {
  story: AdminStoryRow;
  provinces: { province_id: number; province_name_th: string }[];
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

function PlannedContentState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Not configured</p>
      <h3 className="mt-2 font-black text-slate-800 text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function StoryVisualEditor({
  story,
  provinces,
  coverMediaId: initialCoverMediaId,
  coverMediaUrl: initialCoverMediaUrl,
}: StoryVisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>(() => {
    if (typeof window === "undefined") return null;
    let hash = window.location.hash.replace("#", "");
    if (hash === "gallery") hash = "cover";
    const validSections: EditorSection[] = ["header", "content", "settings", "cover"];
    if (validSections.includes(hash as EditorSection)) {
      window.history.replaceState(null, "", window.location.pathname);
      return hash as EditorSection;
    }
    return null;
  });

  const title = story.title || "ยังไม่มีชื่อเรื่อง";
  const [coverMediaId, setCoverMediaId] = useState(initialCoverMediaId ?? null);
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialCoverMediaUrl ?? null);
  const coverImage = coverMediaUrl;
  const category = story.category || "บทความทั่วไป";

  // Format date for display
  const dateStr = story.published_at 
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(story.published_at))
    : "Not published yet";
  const contentWords = story.content?.trim() ? story.content.trim().split(/\s+/).length : 0;
  const readTime = contentWords > 0 ? `Read ${Math.max(1, Math.ceil(contentWords / 220))} min` : "Add content for reading estimate";

  return (
    <div className="relative min-h-screen bg-background pb-20 text-slate-800">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/admin/stories" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-800">Visual Editor: {title}</h1>
            <p className="text-xs font-bold text-slate-500">คุณกำลังแก้ไขหน้าตาแบบเดียวกับที่แสดงผลจริง</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            สถานะ: <span className="uppercase">{story.status}</span>
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

                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-sm">{category}</span>
                  <span>{readTime}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 leading-tight">
                  {title}
                </h1>
                <p className="text-slate-500 leading-relaxed text-lg mb-8">
                  {story.excerpt || "Missing excerpt. Add a short summary before publishing this story."}
                </p>
              </div>
            </EditableBlock>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-200 mb-8 pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-[10px] font-black uppercase text-slate-400 shadow-sm overflow-hidden">
                  {story.author_type === "tourist" ? "T" : "A"}
                </div>
                <div>
                  <p className="font-black text-slate-800">
                    {story.author_type === "tourist" ? (story.tourist_name ?? "Unknown Tourist") : "Admin"}
                  </p>
                  <p className="text-xs text-slate-500">{dateStr} - {readTime}</p>
                  {story.author_type === "tourist" && (
                    <p className="mt-1 max-w-md text-[10px] uppercase font-bold tracking-wider text-orange-500">
                      Tourist UGC Story
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button className="flex items-center gap-2 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-full"><Export size={14} /> Share</button>
                <button className="flex items-center gap-2 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-full"><BookmarkSimple size={14} /> Save</button>
              </div>
            </div>

            <EditableBlock id="cover" label="รูปภาพปก" isActive={activeSection === "cover"} onEdit={() => setActiveSection("cover")}>
              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-sm border border-slate-200 pointer-events-none">
                {coverImage ? (
                  <Image src={coverImage} alt={title} fill className="object-cover" unoptimized />
                ) : (
                  <MissingImageState
                    title="Missing story cover image"
                    description="No saved cover image URL is set for this story. Add approved story media before treating this preview as publish-ready."
                  />
                )}
              </div>
            </EditableBlock>

              <EditableBlock id="content" label="เนื้อหาบทความ" isActive={activeSection === "content"} onEdit={() => setActiveSection("content")}>
                {story.content && story.author_type !== "tourist" && /<[a-z][\s\S]*>/i.test(story.content) ? (
                  <article 
                    className="prose prose-lg max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-black prose-a:text-orange-500 pointer-events-none prose-img:rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: story.content }}
                  />
                ) : (
                  <article className="prose prose-lg max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-black prose-a:text-orange-500 pointer-events-none whitespace-pre-wrap">
                    {story.content || "Missing story body. Add real editorial content before publishing this story."}
                  </article>
                )}
              </EditableBlock>

          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              
              <div className="pointer-events-none">
                <PlannedContentState
                  title="Table of contents unavailable"
                  description="Heading extraction is not implemented in the story schema yet. This sidebar stays in a planned state instead of showing a sample list."
                />
              </div>

              <div className="pointer-events-none">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">ผู้เขียน</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-black text-slate-500">
                      {story.author_type === "tourist" ? "T" : "A"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {story.author_type === "tourist" ? (story.tourist_name ?? "Unknown Tourist") : "Admin"}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{story.author_type}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Drawers */}
      <Drawer isOpen={activeSection === "header"} onClose={() => setActiveSection(null)} title="แก้ไขข้อมูลหลัก (Header)">
        <HeaderForm story={story} onClose={() => setActiveSection(null)} />
      </Drawer>
      <Drawer isOpen={activeSection === "cover"} onClose={() => setActiveSection(null)} title="รูปภาพปก (Cover Image)">
        <CoverForm
          story={story}
          onClose={() => setActiveSection(null)}
          coverMediaId={coverMediaId}
          coverMediaUrl={coverMediaUrl}
          onCoverChange={(id, url) => {
            setCoverMediaId(id);
            setCoverMediaUrl(url);
          }}
        />
      </Drawer>
      <Drawer isOpen={activeSection === "content"} onClose={() => setActiveSection(null)} title="เนื้อหาบทความ (Content)" size="lg">
        <ContentForm story={story} onClose={() => setActiveSection(null)} />
      </Drawer>
      <Drawer isOpen={activeSection === "settings"} onClose={() => setActiveSection(null)} title="ตั้งค่าหมวดหมู่และสถานะ">
        <SettingsForm story={story} provinces={provinces} onClose={() => setActiveSection(null)} />
      </Drawer>

    </div>
  );
}

"use client";

import { useCallback, useState, useEffect } from "react";
import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionTabs } from "@/components/attractions/attraction-tabs";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";
import { InlineEditableText } from "@/components/admin/forms/InlineEditableText";
import { Drawer } from "@/components/admin/Drawer";
import { HeaderForm, ContentForm, LocationForm, SettingsForm } from "./SectionForms";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import {
  RelatedContentWorkspace,
  type SelectedRelatedContentByType,
} from "./RelatedContentWorkspace";
import type {
  AdminAttractionRow,
  AdminRelatedContentSetting,
} from "@/lib/repositories/admin-attraction.repository";
import type { AdminMediaRow } from "@/lib/repositories/admin-media.repository";
import type { AdminSelectOption } from "@/components/admin/attractions/types";
import { MapPinLine, ArrowLeft, PencilSimple, Image as ImageIcon, Eye, QrCode, CheckCircle, WarningCircle, ChartLine } from "@phosphor-icons/react";
import Link from "next/link";
import { AttractionCardsRow } from "@/components/attractions/attraction-cards-row";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import type { ReviewCard, ReviewStats } from "@/types/tourism";
import type { PublicAttractionDetail } from "@/lib/repositories/public-content.repository";
import { buildAttractionSectionNavigation, getAttractionSectionLabel } from "@/lib/content/attraction-sections";
import { adminMediaPreviewUrl } from "@/lib/media/storage-paths";
import type { AttractionTypeAssignment } from "@/lib/repositories/attraction-category.repository";
import type { RelatedContentType } from "@/lib/content/attraction-related-content";

type EditorSection = "header" | "content" | "location" | "settings" | "gallery" | "related" | null;

const EDITOR_SECTIONS: Exclude<EditorSection, null>[] = [
  "header",
  "content",
  "location",
  "settings",
  "gallery",
  "related",
];

function getInitialEditorSection(): EditorSection {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("related_")) return "related";
  return EDITOR_SECTIONS.includes(hash as Exclude<EditorSection, null>)
    ? (hash as EditorSection)
    : null;
}

interface AttractionVisualEditorProps {
  attraction: AdminAttractionRow;
  media: AdminMediaRow[];
  provinces: AdminSelectOption[];
  districts: (AdminSelectOption & { provinceId: number })[];
  attractionTypes: AdminSelectOption[];
  categoryAssignments: AttractionTypeAssignment[];
  richContentPreview: {
    descriptionTh: string;
    historyTh: string;
  };
  publicDetail?: PublicAttractionDetail | null;
  reviewStats?: ReviewStats | null;
  publicReviews?: ReviewCard[] | null;
  relatedSettings: AdminRelatedContentSetting[];
  selectedRelatedContent: SelectedRelatedContentByType;
}

function MissingImageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[var(--admin-radius-panel)] border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--admin-radius-panel)] bg-white text-amber-600 shadow-sm">
        <ImageIcon size={28} weight="duotone" />
      </div>
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function ReadinessState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[var(--admin-radius-panel)] border-2 border-dashed border-slate-200 bg-slate-50 p-5 sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">ข้อมูลยังไม่ครบ (Missing content)</p>
      <h3 className="mt-2 text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {onAction && actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent-strong)]"
        >
          <PencilSimple size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

type PageMapItem = {
  id: string;
  label: string;
  publicSection: string;
  complete: boolean;
  help: string;
  actionLabel: string;
  targetSection?: Exclude<EditorSection, null>;
  href?: string;
};

function PageMap({
  items,
  activeSection,
  onOpenSection,
}: {
  items: PageMapItem[];
  activeSection: EditorSection;
  onOpenSection: (section: Exclude<EditorSection, null>) => void;
}) {
  const completeCount = items.filter((item) => item.complete).length;

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[var(--admin-radius-panel)] border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-coral">แผนผังส่วนประกอบหน้าเว็บ (Public Page Map)</p>
            <h2 className="mt-1 text-base font-black text-slate-900">จัดการเนื้อหาตามส่วนที่แสดงให้ผู้เข้าชมเห็นจริง</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              การ์ดแต่ละใบแสดงสถานะของข้อมูลในหน้าสาธารณะ ควรแก้ไขคำเตือนต่างๆ ให้เรียบร้อยก่อนกดเผยแพร่หรือแชร์ลิงก์ให้ผู้ใช้งาน
            </p>
          </div>
          <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
            พร้อมใช้งาน {completeCount}/{items.length} ส่วน
          </div>
        </div>

        <div className="mt-4 grid auto-cols-[minmax(15rem,82vw)] grid-flow-col gap-3 overflow-x-auto pb-2 md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4">
          {items.map((item) => {
            const card = (
              <div
                className={`h-full rounded-[var(--admin-radius-panel)] border p-3 text-left transition ${
                  activeSection === item.targetSection
                    ? "border-[var(--admin-accent)] bg-[#fff5f1]"
                    : item.complete
                      ? "border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50"
                      : "border-amber-200 bg-amber-50 hover:bg-amber-100/70"
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.complete ? (
                    <CheckCircle className="mt-0.5 shrink-0 text-emerald-700" size={18} weight="fill" />
                  ) : (
                    <WarningCircle className="mt-0.5 shrink-0 text-amber-700" size={18} weight="fill" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">{item.publicSection}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{item.help}</p>
                    <span className="mt-3 inline-flex text-xs font-black text-[var(--admin-accent-strong)]">{item.actionLabel}</span>
                  </div>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className="block rounded-[var(--admin-radius-panel)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30">
                  {card}
                </Link>
              );
            }

            if (item.targetSection) {
              return (
                <button key={item.id} type="button" onClick={() => onOpenSection(item.targetSection!)} className="min-h-11 text-left">
                  {card}
                </button>
              );
            }

            return <div key={item.id}>{card}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

export function AttractionVisualEditor({
  attraction,
  media,
  provinces,
  districts,
  attractionTypes,
  categoryAssignments,
  richContentPreview,
  publicDetail,
  reviewStats,
  publicReviews,
  relatedSettings,
  selectedRelatedContent,
}: AttractionVisualEditorProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>(getInitialEditorSection);
  const [relatedInitialType, setRelatedInitialType] = useState<RelatedContentType>("attractions");
  const [relatedWorkspaceDirty, setRelatedWorkspaceDirty] = useState(false);

  const closeRelatedWorkspace = useCallback(() => {
    setRelatedWorkspaceDirty(false);
    setActiveSection(null);
  }, []);

  const requestCloseRelatedWorkspace = useCallback(() => {
    if (
      !relatedWorkspaceDirty
      || window.confirm("มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกโดยไม่บันทึกหรือไม่?")
    ) {
      closeRelatedWorkspace();
    }
  }, [closeRelatedWorkspace, relatedWorkspaceDirty]);

  function openRelatedWorkspace(type: RelatedContentType) {
    setRelatedInitialType(type);
    setActiveSection("related");
  }

  useEffect(() => {
    if (window.location.hash && activeSection) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [activeSection]);

  // Derive display data to match frontend components
  const provinceName = provinces.find((p) => p.id === attraction.province_id)?.label ?? "ไม่ระบุจังหวัด";
  const name = attraction.name_th || "ยังไม่มีชื่อ";
  const description = attraction.description_th ?? "";
  const shortDescription = attraction.short_description_th ?? "";

  // Derive media
  const sortedMedia = [...media]
    .filter((item) => item.is_active && item.lifecycle_status === "active")
    .filter((item) => item.media_type === "image" || item.media_type === "panorama")
    .sort((a, b) => {
      if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  const previewImages = sortedMedia.flatMap((item) => {
    const url = adminMediaPreviewUrl(item.storage_path);
    return url ? [{ url, alt: item.alt_text_th || item.alt_text_en || name }] : [];
  });
  const hasGalleryImages = previewImages.length > 0;
  const publicThingsToDo = publicDetail?.thingsToDo ?? [];
  const publicWhereToStay = publicDetail?.whereToStay ?? [];
  const publicFoodAndDrink = publicDetail?.foodAndDrink ?? [];
  const publicArticles = publicDetail?.articles ?? [];
  const relatedMode = (type: RelatedContentType) =>
    relatedSettings.find((setting) => setting.contentType === type)?.mode
      ?? (selectedRelatedContent[type].length > 0 ? "manual" : "automatic");
  const locale = "th";
  const sectionLabel = (key: Parameters<typeof getAttractionSectionLabel>[0]) =>
    getAttractionSectionLabel(key, locale);
  const previewSections = buildAttractionSectionNavigation(
    {
      description,
      thingsToDo: publicThingsToDo,
      whereToStay: publicWhereToStay,
      foodAndDrink: publicFoodAndDrink,
      travelTips: attraction.travel_tips_th ? [attraction.travel_tips_th] : [],
      howToGetThere: attraction.how_to_get_there_th,
      articles: publicArticles,
    },
    { locale, includeReviews: true }
  );
  const photoSpotCount = attraction.photo_spot_count ?? 0;
  const checkinCodeCount = attraction.checkin_code_count ?? 0;
  const hasPublicText = Boolean(attraction.short_description_th || attraction.description_th);
  const hasLocationDetails = Boolean(attraction.address_text || attraction.how_to_get_there_th || (attraction.latitude !== null && attraction.longitude !== null));
  const hasRelatedContent = relatedSettings.some((setting) =>
    setting.mode === "automatic"
    || setting.mode === "hybrid"
    || (setting.mode === "manual" && selectedRelatedContent[setting.contentType].length > 0),
  );
  const pageMapItems: PageMapItem[] = [
    {
      id: "header",
      label: "ข้อมูลหลัก (Header)",
      publicSection: "ชื่อสถานที่, ลิงก์ (Slug), จังหวัด",
      complete: Boolean(attraction.name_th && attraction.slug && attraction.province_id && attraction.is_active),
      help: attraction.name_th && attraction.slug ? "ระบุข้อมูลพื้นฐานครบถ้วนแล้ว" : "กรุณาระบุชื่อสถานที่ภาษาไทย, ลิงก์ (Slug) และจังหวัด",
      actionLabel: "แก้ไขข้อมูลหลัก",
      targetSection: "header",
    },
    {
      id: "gallery",
      label: "รูปภาพ (Gallery)",
      publicSection: "รูปหน้าปก และ แกลเลอรี",
      complete: hasGalleryImages,
      help: hasGalleryImages ? `เชื่อมโยงรูปภาพแล้ว ${previewImages.length} รูป` : "เพิ่มรูปหน้าปกหรือแกลเลอรี เพื่อให้หน้าเว็บน่าสนใจ",
      actionLabel: "จัดการรูปภาพ",
      targetSection: "gallery",
    },
    {
      id: "content",
      label: sectionLabel("overview"),
      publicSection: `${sectionLabel("overview")}, ${sectionLabel("travel_tips")}`,
      complete: hasPublicText,
      help: hasPublicText ? "มีเนื้อหาคำอธิบายสถานที่แล้ว" : "เพิ่มคำอธิบายสั้น หรือ รายละเอียดแบบเต็มภาษาไทย",
      actionLabel: "แก้ไขเนื้อหา",
      targetSection: "content",
    },
    {
      id: "location",
      label: sectionLabel("how_to_get_there"),
      publicSection: sectionLabel("how_to_get_there"),
      complete: hasLocationDetails,
      help: hasLocationDetails ? "มีข้อมูลการเดินทางหรือพิกัดแล้ว" : "เพิ่มที่อยู่, คำแนะนำการเดินทาง หรือพิกัดแผนที่",
      actionLabel: "แก้ไขตำแหน่งที่ตั้ง",
      targetSection: "location",
    },
    {
      id: "qr",
      label: "QR เช็คอิน",
      publicSection: "ปุ่มเช็คอิน และ จุดถ่ายรูป",
      complete: photoSpotCount > 0 && checkinCodeCount > 0,
      help: `จุดถ่ายรูป ${photoSpotCount} จุด, QR โค้ด ${checkinCodeCount} รหัส`,
      actionLabel: photoSpotCount > 0 ? "จัดการ QR โค้ด" : "สร้างจุดถ่ายรูป",
      href: photoSpotCount > 0 ? `/admin/checkin-codes?attractionId=${attraction.attraction_id}` : `/admin/photo-spots/new?attraction_id=${attraction.attraction_id}`,
    },
    {
      id: "related",
      label: "สถานที่ที่เกี่ยวข้อง",
      publicSection: `${sectionLabel("things_to_do")}, ${sectionLabel("food_drink")}, ${sectionLabel("articles")}`,
      complete: hasRelatedContent,
      help: hasRelatedContent ? "มีการเชื่อมโยงเนื้อหาอย่างน้อย 1 รายการแล้ว" : "ทางเลือก: เชื่อมโยงที่พัก ร้านอาหาร บทความ หรือสถานที่ใกล้เคียง",
      actionLabel: "เลือกสถานที่ที่เกี่ยวข้อง",
      targetSection: "related",
    },
    {
      id: "publish",
      label: "การเผยแพร่ (Publish)",
      publicSection: "สถานะการแสดงผล",
      complete: Boolean(attraction.is_active && attraction.is_published),
      help: attraction.is_published ? "สถานที่นี้สามารถแสดงบนหน้าเว็บสาธารณะได้แล้ว" : "คงสถานะฉบับร่างไว้ จนกว่าเนื้อหาและรูปภาพจะพร้อม",
      actionLabel: "แก้ไขสถานะ",
      targetSection: "settings",
    },
  ];

  return (
    <div className="admin-app relative min-h-screen bg-[var(--admin-canvas)] pb-20 text-[var(--admin-ink)]">
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-30 flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center gap-3 lg:w-auto">
          <Link href="/admin/attractions" aria-label="กลับไปรายการสถานที่" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--admin-radius-control)] border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent-strong)]">
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-[#202020] sm:text-lg">แก้ไขหน้าสถานที่: {name}</h1>
            <p className="truncate text-xs font-bold text-slate-500">คุณกำลังแก้ไขหน้าตาแบบเดียวกับที่แสดงผลจริง</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 lg:w-auto lg:justify-end">
          <Link
            href={`/attractions/${attraction.slug}`}
            target="_blank"
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-[var(--admin-accent)] sm:flex-none"
          >
            <Eye size={16} weight="bold" />
            <span className="hidden sm:inline">Preview public page</span>
            <span className="sm:hidden">Preview</span>
          </Link>
          <Link
            href={`/admin/attractions/${attraction.attraction_id}/media`}
            className="hidden min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-[var(--admin-accent)] md:inline-flex"
          >
            <ImageIcon size={16} weight="bold" />
            Media
          </Link>
          <Link
            href={`/admin/checkin-codes?attractionId=${attraction.attraction_id}`}
            className="hidden min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-[var(--admin-accent)] xl:inline-flex"
          >
            <QrCode size={16} weight="bold" />
            QR
          </Link>
          <Link
            href={`/admin/attractions/${attraction.attraction_id}/improvements`}
            className="hidden min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-[var(--admin-accent)] xl:inline-flex"
          >
            <ChartLine size={16} weight="bold" />
            แผนปรับปรุง
          </Link>
          <div className="hidden border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 sm:block">
            สถานะ: {attraction.is_published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
          </div>
          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--admin-radius-control)] bg-[var(--admin-accent)] px-3 py-2 text-sm font-black text-white transition hover:bg-[var(--admin-accent-strong)] sm:flex-none"
          >
            <span className="sm:hidden">ตั้งค่า</span><span className="hidden sm:inline">ตั้งค่า / สถานะ</span>
          </button>
        </div>
      </div>

      <PageMap items={pageMapItems} activeSection={activeSection} onOpenSection={setActiveSection} />

      {/* Editor Canvas (matches public layout) */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">

        {/* Header Block */}
        <EditableBlock id="header" label="ข้อมูลหลัก" isActive={activeSection === "header"} onEdit={() => setActiveSection("header")}>
          <AttractionHeader
            name={name}
            province={provinceName}
            attractionType={attractionTypes.find((type) => type.id === attraction.attraction_type_id)?.label ?? ""}
            reviewState={reviewStats && reviewStats.totalReviews > 0 ? "available" : "empty"}
            rating={reviewStats?.averageRating ?? null}
            reviewCount={reviewStats?.totalReviews ?? null}
          />
        </EditableBlock>

        {/* Gallery Block */}
        <EditableBlock id="gallery" label="รูปภาพ (Gallery)" isActive={activeSection === "gallery"} onEdit={() => setActiveSection("gallery")}>
          <div className="mt-6 pointer-events-none">
            {hasGalleryImages ? (
              <AttractionGallery
                mainImage={previewImages[0] ?? null}
                gallery={previewImages}
                attractionName={name}
                unoptimized
              />
            ) : (
              <MissingImageState
                title="Missing attraction image"
                description="No official media is linked to this attraction yet. Add a cover or gallery image before treating this preview as publish-ready."
              />
            )}
          </div>
        </EditableBlock>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="min-w-0 space-y-12">
            <AttractionTabs sections={previewSections} mobileLabel="เลือกส่วนของหน้า" />

            {/* Overview / Content Block */}
            <EditableBlock id="content" label="เนื้อหา" isActive={activeSection === "content"} onEdit={() => setActiveSection("content")}>
              <div className="space-y-12">
                <section id="overview" className="scroll-mt-24">
                  <h2 className="mb-4 text-2xl font-bold text-slate-800">{sectionLabel("overview")}</h2>
                  {shortDescription ? (
                    <p className="mb-4 text-sm font-medium text-slate-500 leading-relaxed whitespace-pre-wrap">
                      {shortDescription}
                    </p>
                  ) : (
                    <p className="mb-4 text-sm italic text-slate-400">
                      <InlineEditableText
                        value=""
                        fieldName="shortDescriptionTh"
                        attractionId={attraction.attraction_id}
                        placeholder="คลิกเพื่อเพิ่มคำอธิบายสั้น..."
                        multiline
                        maxLength={500}
                      />
                    </p>
                  )}
                  {richContentPreview.descriptionTh ? (
                    <div
                      className="rich-content-media prose prose-lg max-w-[72ch] prose-headings:font-black prose-headings:text-slate-800 prose-p:leading-8 prose-p:text-slate-700 prose-a:font-bold prose-a:text-[#0A6B62] prose-img:h-auto prose-img:rounded-lg pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: richContentPreview.descriptionTh }}
                    />
                  ) : (
                    <p className="text-sm italic text-slate-400">ยังไม่มีคำอธิบายฉบับเต็ม กด “แก้ไข เนื้อหา” เพื่อเพิ่มข้อมูล</p>
                  )}
                </section>

                <section id="history" className="scroll-mt-24">
                  <h2 className="mb-4 text-2xl font-bold text-slate-800">ประวัติศาสตร์ / เรื่องเล่า</h2>
                  {richContentPreview.historyTh ? (
                    <div
                      className="rich-content-media prose prose-lg max-w-[72ch] prose-headings:font-black prose-headings:text-slate-800 prose-p:leading-8 prose-p:text-slate-700 prose-a:font-bold prose-a:text-[#0A6B62] prose-img:h-auto prose-img:rounded-lg pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: richContentPreview.historyTh }}
                    />
                  ) : null}
                  {!attraction.history_th ? (
                    <p className="mt-2 text-xs text-slate-400">
                      เพิ่มประวัติศาสตร์ของสถานที่เพื่อให้ผู้เยี่ยมชมเข้าใจบริบท
                    </p>
                  ) : null}
                </section>

                <section id="tips" className="scroll-mt-24 mt-8">
                  <h2 className="mb-4 text-2xl font-bold text-slate-800">{sectionLabel("travel_tips")}</h2>
                  <div className="rounded-2xl bg-amber-50 p-6 border border-amber-100">
                    <div className="text-base leading-relaxed text-amber-900">
                      <InlineEditableText
                        value={attraction.travel_tips_th ?? ""}
                        fieldName="travelTipsTh"
                        attractionId={attraction.attraction_id}
                        placeholder="คลิกเพื่อเพิ่มข้อแนะนำการเดินทาง..."
                        multiline
                        maxLength={5000}
                        className="text-amber-900"
                      />
                    </div>
                  </div>
                  {!attraction.travel_tips_th ? (
                    <p className="mt-2 text-xs text-amber-600/70">
                      แนะนำเวลาไปเที่ยวที่ดีที่สุด วิธีเดินทาง และข้อควรรู้
                    </p>
                  ) : null}
                </section>
              </div>
            </EditableBlock>

            {/* Relational Content Block (Rendered visually but edits navigate away) */}
            <div className="space-y-12 mt-12 relative border-t border-slate-200 pt-12">
              <div className="absolute top-0 right-0 -mt-3 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                ข้อมูลเชื่อมโยง (Relational Data)
              </div>

              {/* Things to Do */}
              {publicThingsToDo.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow
                      id="things-to-do"
                      title={sectionLabel("things_to_do")}
                      items={publicThingsToDo}
                      viewAllText="ดูทั้งหมด (View all)"
                      linkPrefix="/attractions"
                    />
                  </div>
                  <div className="pointer-events-auto absolute right-4 top-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button onClick={() => openRelatedWorkspace("attractions")} className="flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title={relatedMode("attractions") === "hidden" ? "ส่วนสถานที่ใกล้เคียงถูกซ่อน" : "ยังไม่มีสถานที่ใกล้เคียงที่พร้อมแสดง"}
                  description={relatedMode("attractions") === "automatic" || relatedMode("attractions") === "hybrid" ? "ระบบยังไม่พบสถานที่ที่ผ่านเงื่อนไขพื้นที่และความพร้อมของเนื้อหา" : "เลือกสถานที่จริงที่เกี่ยวข้อง หรือเปลี่ยนวิธีแสดงผลในพื้นที่จัดการ"}
                  actionLabel="จัดการสถานที่ใกล้เคียง"
                  onAction={() => openRelatedWorkspace("attractions")}
                />
              )}

              {/* Where to Stay */}
              {publicWhereToStay.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow
                      id="where-to-stay"
                      title={sectionLabel("where_to_stay")}
                      items={publicWhereToStay}
                      viewAllText="ดูที่พักทั้งหมด (View all hotels)"
                      linkPrefix="/accommodations"
                    />
                  </div>
                  <div className="pointer-events-auto absolute right-4 top-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button onClick={() => openRelatedWorkspace("accommodations")} className="flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title={relatedMode("accommodations") === "hidden" ? "ส่วนที่พักถูกซ่อน" : "ยังไม่มีที่พักที่พร้อมแสดง"}
                  description={relatedMode("accommodations") === "automatic" || relatedMode("accommodations") === "hybrid" ? "ระบบยังไม่พบที่พักที่ผ่านเงื่อนไขพื้นที่และความพร้อมของเนื้อหา" : "เลือกที่พักจริงที่เกี่ยวข้อง หรือเปลี่ยนวิธีแสดงผลในพื้นที่จัดการ"}
                  actionLabel="จัดการที่พัก"
                  onAction={() => openRelatedWorkspace("accommodations")}
                />
              )}

              {/* Food & Drink */}
              {publicFoodAndDrink.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow
                      id="food"
                      title={sectionLabel("food_drink")}
                      items={publicFoodAndDrink}
                      viewAllText="ดูร้านอาหารทั้งหมด (View all restaurants)"
                      linkPrefix="/restaurants"
                    />
                  </div>
                  <div className="pointer-events-auto absolute right-4 top-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button onClick={() => openRelatedWorkspace("restaurants")} className="flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title={relatedMode("restaurants") === "hidden" ? "ส่วนร้านอาหารถูกซ่อน" : "ยังไม่มีร้านอาหารที่พร้อมแสดง"}
                  description={relatedMode("restaurants") === "automatic" || relatedMode("restaurants") === "hybrid" ? "ระบบยังไม่พบร้านอาหารที่ผ่านเงื่อนไขพื้นที่และความพร้อมของเนื้อหา" : "เลือกร้านอาหารจริงที่เกี่ยวข้อง หรือเปลี่ยนวิธีแสดงผลในพื้นที่จัดการ"}
                  actionLabel="จัดการร้านอาหาร"
                  onAction={() => openRelatedWorkspace("restaurants")}
                />
              )}

              {/* Reviews Summary */}
              <div className="relative group">
                <div className="pointer-events-none">
                  <AttractionReviews
                    state={reviewStats && reviewStats.totalReviews > 0 ? "available" : "empty"}
                    stats={reviewStats ?? null}
                    reviews={publicReviews ?? []}
                    title={sectionLabel("reviews")}
                  />
                </div>
                <div className="absolute right-0 top-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <Link href={`/admin/reviews?attractionId=${attraction.attraction_id}`} className="flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                    <PencilSimple size={14} /> จัดการรีวิว
                  </Link>
                </div>
              </div>

              {/* Recommended Articles */}
              {publicArticles.length > 0 ? (
                <div className="relative group rounded-3xl border border-transparent hover:border-slate-300 p-2 -mx-2 transition-colors">
                  <div className="pointer-events-none">
                    <AttractionCardsRow
                      id="articles"
                      title={sectionLabel("articles")}
                      items={publicArticles}
                      viewAllText="ดูบทความทั้งหมด (View all articles)"
                      linkPrefix="/stories"
                    />
                  </div>
                  <div className="pointer-events-auto absolute right-4 top-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button onClick={() => openRelatedWorkspace("stories")} className="flex min-h-11 items-center gap-2 rounded-[var(--admin-radius-control)] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                      <PencilSimple size={14} /> เลือกเนื้อหา
                    </button>
                  </div>
                </div>
              ) : (
                <ReadinessState
                  title={relatedMode("stories") === "hidden" ? "ส่วนเรื่องราวถูกซ่อน" : "ยังไม่มีเรื่องราวที่เชื่อมโยงโดยตรง"}
                  description="เรื่องราวจะแสดงเมื่อผู้ดูแลยืนยันความสัมพันธ์กับสถานที่นี้เท่านั้น ระบบจะไม่แนะนำจากจังหวัดเดียวกันเพียงอย่างเดียว"
                  actionLabel="จัดการเรื่องราว"
                  onAction={() => openRelatedWorkspace("stories")}
                />
              )}
            </div>

            {/* Location / Map Block */}
            <EditableBlock id="location" label="พิกัด & แผนที่" isActive={activeSection === "location"} onEdit={() => setActiveSection("location")}>
              <section id="how-to-get-there" className="scroll-mt-24 pt-8 pointer-events-none">
                <h2 className="mb-4 text-2xl font-bold text-slate-800">{sectionLabel("how_to_get_there")}</h2>
                <div className="mb-6 text-sm leading-relaxed text-slate-600">
                  <InlineEditableText
                    value={attraction.how_to_get_there_th ?? ""}
                    fieldName="howToGetThereTh"
                    attractionId={attraction.attraction_id}
                    placeholder="คลิกเพื่อเพิ่มวิธีการเดินทาง..."
                    multiline
                    maxLength={5000}
                  />
                  <div className="mt-1 text-xs text-slate-400">
                    <span className="font-medium">ที่อยู่:</span>{' '}
                    <InlineEditableText
                      value={attraction.address_text ?? ""}
                      fieldName="addressText"
                      attractionId={attraction.attraction_id}
                      placeholder="คลิกเพื่อเพิ่มที่อยู่..."
                      className="inline"
                      whiteSpace="normal"
                    />
                  </div>
                </div>
                <div className="aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center relative text-center">
                  <div className="flex flex-col items-center px-6">
                    <MapPinLine size={48} className="text-coral/50" weight="duotone" />
                    <p className="mt-3 text-sm font-bold text-slate-800">
                      {attraction.latitude !== null && attraction.longitude !== null
                        ? `${attraction.latitude.toFixed(4)}, ${attraction.longitude.toFixed(4)}`
                        : "Missing coordinates"}
                    </p>
                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                      {attraction.latitude !== null && attraction.longitude !== null
                        ? "Saved coordinates are shown. A real map tile preview is not configured in this editor."
                        : "Add latitude and longitude before this location section is publish-ready."}
                    </p>
                  </div>
                </div>
              </section>
            </EditableBlock>
          </div>

          {/* Sidebar Area */}
          <aside className="hidden lg:block">
            <EditableBlock id="sidebar" label="ตั้งค่า / สถานะ" isActive={activeSection === "settings"} onEdit={() => setActiveSection("settings")}>
              <div className="pointer-events-none sticky top-24">
                <AttractionInfoSidebar
                  province={provinceName}
                  attractionType={attractionTypes.find((type) => type.id === attraction.attraction_type_id)?.label ?? ""}
                  address={attraction.address_text}
                  openingHours={attraction.opening_hours}
                  contactInfo={attraction.contact_info}
                />
              </div>
            </EditableBlock>
          </aside>
        </div>
      </div>

      {/* Drawers */}
      <Drawer
        isOpen={activeSection === "header"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขข้อมูลหลัก (Header)"
      >
        <HeaderForm attraction={attraction} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "content"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขเนื้อหา (Content)"
        size="lg"
      >
        <ContentForm attraction={attraction} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "location"}
        onClose={() => setActiveSection(null)}
        title="แก้ไขพิกัดและการติดต่อ (Location)"
        size="lg"
      >
        <LocationForm attraction={attraction} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "settings"}
        onClose={() => setActiveSection(null)}
        title="ตั้งค่าหมวดหมู่และสถานะ"
      >
        <SettingsForm attraction={attraction} provinces={provinces} districts={districts} attractionTypes={attractionTypes} categoryAssignments={categoryAssignments} onClose={() => setActiveSection(null)} />
      </Drawer>

      <Drawer
        isOpen={activeSection === "gallery"}
        onClose={() => setActiveSection(null)}
        title="จัดการรูปภาพ (Media Gallery)"
        size="xl"
      >
        <div className="pb-10">
          <MediaManager entityId={attraction.attraction_id} entityType="attraction" initialMedia={media} />
        </div>
      </Drawer>

      {/* One workspace owns every related-content field and display mode. */}
      <Drawer
        isOpen={activeSection === "related"}
        onClose={requestCloseRelatedWorkspace}
        title="จัดการเนื้อหาที่เกี่ยวข้อง"
        size="xl"
        bodyClassName="p-0"
      >
        <RelatedContentWorkspace
          attractionId={attraction.attraction_id}
          initialType={relatedInitialType}
          settings={relatedSettings}
          selectedByType={selectedRelatedContent}
          onDirtyChange={setRelatedWorkspaceDirty}
          onClose={closeRelatedWorkspace}
        />
      </Drawer>
    </div>
  );
}

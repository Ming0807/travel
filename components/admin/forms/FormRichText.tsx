"use client";

import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import NextImage from "next/image";
import {
  ImageSquare,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useCallback, useState } from "react";
import type { StoryDocument } from "@/lib/content/story-document";
import {
  fromTiptapJson,
  toTiptapJson,
} from "@/lib/content/tiptap-story-document";
import { createManagedStoryImageNode } from "@/lib/content/managed-story-image";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import {
  normalizeRichImageAlign,
  normalizeRichImageSize,
  type RichImageAlign,
  type RichImageSize,
} from "@/lib/content/rich-image-layout";
import {
  MediaPickerModal,
  type MediaPickerAsset,
} from "@/components/admin/media/MediaPickerModal";
import {
  FormLabel,
  FormError,
  FormHelp,
} from "@/components/admin/forms/FormField";

// ─── Toolbar Icon Components ────────────────────────────────────

function BoldIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="10" y1="4" y2="4" />
      <line x1="14" x2="5" y1="20" y2="20" />
      <line x1="15" x2="9" y1="4" y2="20" />
    </svg>
  );
}

function HeadingIcon({ level }: { level: number }) {
  return (
    <span className="text-[11px] font-black leading-none tracking-tight">
      H{level}
    </span>
  );
}

function ListUlIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function ListOlIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="21" y1="6" y2="6" />
      <line x1="10" x2="21" y1="12" y2="12" />
      <line x1="10" x2="21" y1="18" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function BlockquoteIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.994V14c0 1.25.75 2 2 2" />
      <path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.994V14c0 1.25.75 2 2 2" />
    </svg>
  );
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function UndoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

// ─── Toolbar Button ─────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex min-h-8 min-w-8 items-center justify-center rounded-lg border text-sm transition
        ${
          isActive
            ? "border-[#0A6B62] bg-[#E6F4EF] text-[#0A6B62]"
            : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
        }`}
    >
      {children}
    </button>
  );
}

// ─── Toolbar Separator ──────────────────────────────────────────

function ToolbarSeparator() {
  return <div className="mx-0.5 h-6 w-px bg-slate-200" />;
}

const IMAGE_SIZE_OPTIONS: { value: RichImageSize; label: string; ariaLabel: string }[] = [
  { value: "full", label: "เต็ม", ariaLabel: "ขนาดเต็ม" },
  { value: "large", label: "ใหญ่", ariaLabel: "ขนาดใหญ่" },
  { value: "medium", label: "กลาง", ariaLabel: "ขนาดกลาง" },
  { value: "small", label: "เล็ก", ariaLabel: "ขนาดเล็ก" },
];

const IMAGE_ALIGN_OPTIONS: {
  value: RichImageAlign;
  label: string;
  icon: typeof TextAlignLeft;
}[] = [
  { value: "left", label: "ชิดซ้าย", icon: TextAlignLeft },
  { value: "center", label: "กึ่งกลาง", icon: TextAlignCenter },
  { value: "right", label: "ชิดขวา", icon: TextAlignRight },
];

function ImageLayoutControls({
  size,
  align,
  onSizeChange,
  onAlignChange,
  compact = false,
}: {
  size: RichImageSize;
  align: RichImageAlign;
  onSizeChange: (value: RichImageSize) => void;
  onAlignChange: (value: RichImageAlign) => void;
  compact?: boolean;
}) {
  const buttonClass = (active: boolean) =>
    `${compact ? "min-h-11 min-w-11 px-2.5 text-xs" : "min-h-11 px-3 text-sm"} inline-flex items-center justify-center gap-1.5 border font-bold transition ${
      active
        ? "border-[#0A6B62] bg-[#E6F4EF] text-[#075E54]"
        : "border-slate-300 bg-white text-slate-700 hover:border-[#0A6B62] hover:text-[#075E54]"
    }`;

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-2"}`}>
      <fieldset>
        <legend className="mb-1.5 text-xs font-bold text-slate-600">ขนาดรูปภาพ</legend>
        <div className="grid grid-cols-4" role="group" aria-label="ขนาดรูปภาพ">
          {IMAGE_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.ariaLabel}
              aria-pressed={size === option.value}
              onClick={() => onSizeChange(option.value)}
              className={buttonClass(size === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-xs font-bold text-slate-600">ตำแหน่งรูปภาพ</legend>
        <div className="grid grid-cols-3" role="group" aria-label="ตำแหน่งรูปภาพ">
          {IMAGE_ALIGN_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                aria-pressed={align === option.value}
                onClick={() => onAlignChange(option.value)}
                className={buttonClass(align === option.value)}
              >
                <Icon aria-hidden="true" size={16} weight="bold" />
                {compact ? null : <span>{option.label}</span>}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Editor Toolbar ─────────────────────────────────────────────

function EditorToolbar({
  editor,
  onOpenMedia,
  imageLayoutControls,
}: {
  editor: Editor;
  onOpenMedia: () => void;
  imageLayoutControls: boolean;
}) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const selectedImage = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      active: currentEditor.isActive("image"),
      size: normalizeRichImageSize(currentEditor.getAttributes("image").imageSize),
      align: normalizeRichImageAlign(currentEditor.getAttributes("image").imageAlign),
    }),
  });

  const handleSetLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-3 py-2">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <ItalicIcon />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <HeadingIcon level={2} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <HeadingIcon level={3} />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <ListUlIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOlIcon />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Blockquote */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <BlockquoteIcon />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Link */}
      <ToolbarButton
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
          } else {
            const previousUrl = editor.getAttributes("link").href;
            setLinkUrl(previousUrl || "");
            setShowLinkInput(true);
          }
        }}
        isActive={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon />
      </ToolbarButton>

      <ToolbarButton onClick={onOpenMedia} title="แทรกรูปจากคลังสื่อ">
        <ImageSquare size={18} weight="bold" />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RedoIcon />
        </ToolbarButton>
      </div>

      {/* Link URL input — shown inline when toggled */}
      {showLinkInput ? (
        <div className="flex w-full items-center gap-2 border-t border-slate-200 pt-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="min-h-8 flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#0A6B62]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSetLink();
              }
              if (e.key === "Escape") {
                setShowLinkInput(false);
              }
            }}
          />
          <button
            type="button"
            onClick={handleSetLink}
            className="min-h-7 rounded-md bg-[#0A6B62] px-3 text-xs font-bold text-white transition hover:bg-[#073F37]"
          >
            ใช้ลิงก์
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="min-h-7 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            ยกเลิก
          </button>
        </div>
      ) : null}
      {imageLayoutControls ? (
        <div className="w-full border-t border-slate-200 pt-2">
          {selectedImage.active ? (
            <ImageLayoutControls
              compact
              size={selectedImage.size}
              align={selectedImage.align}
              onSizeChange={(imageSize) =>
                editor.chain().focus().updateAttributes("image", { imageSize }).run()
              }
              onAlignChange={(imageAlign) =>
                editor.chain().focus().updateAttributes("image", { imageAlign }).run()
              }
            />
          ) : (
            <p className="py-1 text-xs font-semibold text-slate-600">
              คลิกรูปในเนื้อหาเพื่อปรับขนาดและตำแหน่ง
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── FormRichText ───────────────────────────────────────────────

interface FormRichTextProps {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string | null;
  help?: string;
  required?: boolean;
  placeholder?: string;
  minHeight?: number;
  defaultDocument?: StoryDocument | null;
  documentName?: string;
  imageLayoutControls?: boolean;
  onValueChange?: (value: {
    html: string;
    document: StoryDocument | null;
  }) => void;
}

const ManagedStoryImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-asset-id"),
        renderHTML: (attributes) =>
          attributes.assetId
            ? { "data-asset-id": String(attributes.assetId) }
            : {},
      },
      storagePath: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-path"),
        renderHTML: (attributes) =>
          attributes.storagePath
            ? { "data-storage-path": String(attributes.storagePath) }
            : {},
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption"),
        renderHTML: (attributes) =>
          attributes.caption
            ? { "data-caption": String(attributes.caption) }
            : {},
      },
      imageSize: {
        default: "full",
        parseHTML: (element) =>
          normalizeRichImageSize(element.getAttribute("data-image-size")),
        renderHTML: (attributes) => ({
          "data-image-size": normalizeRichImageSize(attributes.imageSize),
        }),
      },
      imageAlign: {
        default: "center",
        parseHTML: (element) =>
          normalizeRichImageAlign(element.getAttribute("data-image-align")),
        renderHTML: (attributes) => ({
          "data-image-align": normalizeRichImageAlign(attributes.imageAlign),
        }),
      },
    };
  },
}).configure({
  inline: false,
  allowBase64: false,
  HTMLAttributes: {
    class: "h-auto rounded-lg object-cover",
  },
});

export function FormRichText({
  label,
  name,
  defaultValue = "",
  error,
  help,
  required,
  placeholder,
  minHeight = 300,
  defaultDocument = null,
  documentName,
  imageLayoutControls = false,
  onValueChange,
}: FormRichTextProps) {
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState(defaultValue);
  const [document, setDocument] = useState<StoryDocument | null>(
    defaultDocument,
  );
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaPickerAsset | null>(
    null,
  );
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageSize, setImageSize] = useState<RichImageSize>("full");
  const [imageAlign, setImageAlign] = useState<RichImageAlign>("center");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const updateEditorValue = useCallback(
    (ed: Editor) => {
      const updatedHtml = ed.getHTML();
      setHtml(updatedHtml);
      try {
        const updatedDocument = fromTiptapJson(ed.getJSON());
        setDocument(updatedDocument);
        setDocumentError(null);
        onValueChange?.({ html: updatedHtml, document: updatedDocument });
      } catch {
        setDocument(null);
        setDocumentError(
          "เนื้อหามีรูปแบบที่ระบบยังไม่รองรับ กรุณานำส่วนนั้นออกก่อนบันทึก",
        );
        onValueChange?.({ html: updatedHtml, document: null });
      }
      if (hiddenRef.current) hiddenRef.current.value = updatedHtml;
    },
    [onValueChange],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "พิมพ์ข้อความ หรือ / สำหรับคำสั่ง...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-[#0A6B62] underline underline-offset-2 hover:text-[#073F37]",
        },
      }),
      ManagedStoryImage,
    ],
    content: defaultDocument ? toTiptapJson(defaultDocument) : defaultValue,
    onCreate: ({ editor: ed }) => updateEditorValue(ed),
    onUpdate: ({ editor: ed }) => updateEditorValue(ed),
  });

  const handleEditorClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!editor || !imageLayoutControls) return;
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;

      const position = editor.view.posAtDOM(target, 0);
      editor.chain().focus().setNodeSelection(position).run();
    },
    [editor, imageLayoutControls],
  );

  // Sync if defaultValue changes externally (e.g., form reset with new data)
  useEffect(() => {
    if (editor && !defaultDocument && defaultValue !== editor.getHTML()) {
      editor.commands.setContent(defaultValue, { emitUpdate: false });
    }
  }, [defaultDocument, defaultValue, editor]);

  useEffect(() => {
    if (!editor || !defaultDocument) return;
    const next = toTiptapJson(defaultDocument);
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [defaultDocument, editor]);

  const closeImageDetails = useCallback(() => {
    setSelectedMedia(null);
    setImageAlt("");
    setImageCaption("");
    setImageSize("full");
    setImageAlign("center");
    setMediaError(null);
  }, []);

  const handleSelectMedia = useCallback((asset: MediaPickerAsset) => {
    if (!asset.mime_type.startsWith("image/")) {
      setMediaError("เลือกได้เฉพาะไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (asset.lifecycle_status && asset.lifecycle_status !== "active") {
      setMediaError("รูปภาพนี้ยังไม่พร้อมใช้งาน กรุณาเลือกรูปที่มีสถานะใช้งาน");
      return;
    }
    setIsMediaPickerOpen(false);
    setSelectedMedia(asset);
    setImageAlt("");
    setImageCaption("");
    setImageSize("full");
    setImageAlign("center");
    setMediaError(null);
  }, []);

  const handleInsertImage = useCallback(() => {
    if (!editor || !selectedMedia) return;
    try {
      const node = createManagedStoryImageNode({
        assetId: selectedMedia.id,
        storagePath: selectedMedia.storage_path,
        alt: imageAlt,
        caption: imageCaption,
      });
      const tiptapNode = toTiptapJson({
        type: "doc",
        version: 2,
        content: [node],
      }).content[0];
      if (!tiptapNode) throw new Error("INVALID_MANAGED_STORY_IMAGE");
      const imageNode = {
        ...tiptapNode,
        attrs: {
          ...tiptapNode.attrs,
          ...(imageLayoutControls ? { imageSize, imageAlign } : {}),
        },
      };
      editor
        .chain()
        .focus()
        .insertContent([imageNode, { type: "paragraph" }])
        .run();
      closeImageDetails();
    } catch {
      setMediaError("กรุณาใส่คำอธิบายรูปภาพก่อนแทรก");
    }
  }, [
    closeImageDetails,
    editor,
    imageAlign,
    imageAlt,
    imageCaption,
    imageLayoutControls,
    imageSize,
    selectedMedia,
  ]);

  if (!mounted) {
    // SSR fallback — render a static textarea so forms still work
    return (
      <label className={`block`}>
        <FormLabel required={required}>{label}</FormLabel>
        <textarea
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
          name={name}
          defaultValue={defaultValue}
          rows={Math.ceil(minHeight / 24)}
          readOnly
        />
        <FormError error={error} />
        {documentName ? (
          <input
            type="hidden"
            name={documentName}
            value={JSON.stringify(defaultDocument)}
          />
        ) : null}
        {help ? <FormHelp>{help}</FormHelp> : null}
      </label>
    );
  }

  return (
    <>
      <div className="block">
        <FormLabel required={required}>{label}</FormLabel>
        <div
          className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#0A6B62] focus-within:ring-2 focus-within:ring-[#0A6B62]/15"
          style={{ minHeight }}
        >
          <EditorToolbar
            editor={editor}
            imageLayoutControls={imageLayoutControls}
            onOpenMedia={() => {
              setMediaError(null);
              setIsMediaPickerOpen(true);
            }}
          />
          <div className="px-4 py-3" onClick={handleEditorClick}>
            <EditorContent
              editor={editor}
              className="rich-content-media prose prose-sm prose-headings:font-black prose-headings:text-slate-800 prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-p:text-slate-700 prose-p:leading-7 prose-a:text-[#0A6B62] prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-[#0A6B62] prose-blockquote:text-slate-600 max-w-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
            />
          </div>
        </div>
        <input type="hidden" name={name} ref={hiddenRef} value={html} />
        {documentName ? (
          <input
            type="hidden"
            name={documentName}
            value={document ? JSON.stringify(document) : ""}
          />
        ) : null}
        <FormError error={error ?? documentError ?? mediaError} />
        {help ? <FormHelp>{help}</FormHelp> : null}
      </div>
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={() => undefined}
        onSelectAsset={handleSelectMedia}
        title="เลือกรูปสำหรับเนื้อหา"
      />
      {selectedMedia ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-image-dialog-title"
        >
          <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-lg bg-white sm:rounded-lg">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2
                  id="story-image-dialog-title"
                  className="text-lg font-black text-slate-900"
                >
                  รายละเอียดรูปภาพ
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  คำอธิบายช่วยให้ผู้ใช้โปรแกรมอ่านหน้าจอเข้าใจเนื้อหาของรูป
                </p>
              </div>
              <button
                type="button"
                onClick={closeImageDetails}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
                <NextImage
                  src={
                    siteMediaImageUrl(selectedMedia.storage_path) ??
                    selectedMedia.url
                  }
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 576px"
                  className="object-cover"
                />
              </div>
              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  คำอธิบายรูปภาพ <span className="text-rose-600">*</span>
                </span>
                <input
                  type="text"
                  aria-label="คำอธิบายรูปภาพ"
                  value={imageAlt}
                  onChange={(event) => {
                    setImageAlt(event.target.value);
                    setMediaError(null);
                  }}
                  maxLength={255}
                  autoFocus
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  placeholder="เช่น มัสยิดกลางปัตตานียามเย็น"
                />
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  อธิบายสิ่งสำคัญในภาพแบบสั้นและชัดเจน
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  คำบรรยายใต้ภาพ
                </span>
                <textarea
                  aria-label="คำบรรยายใต้ภาพ"
                  value={imageCaption}
                  onChange={(event) => setImageCaption(event.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
                  placeholder="ข้อมูลเพิ่มเติม เครดิตภาพ หรือสถานที่ถ่ายภาพ (ไม่บังคับ)"
                />
              </label>
              {imageLayoutControls ? (
                <ImageLayoutControls
                  size={imageSize}
                  align={imageAlign}
                  onSizeChange={setImageSize}
                  onAlignChange={setImageAlign}
                />
              ) : null}
              {mediaError ? (
                <p role="alert" className="text-sm font-bold text-rose-700">
                  {mediaError}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={closeImageDetails}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="min-h-11 rounded-lg bg-[#075E54] px-4 text-sm font-bold text-white hover:bg-[#064C44]"
              >
                แทรกรูปภาพ
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

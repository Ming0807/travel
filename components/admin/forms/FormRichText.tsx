"use client";

import {
  useEditor,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  FormLabel,
  FormError,
  FormHelp,
} from "@/components/admin/forms/FormField";

// ─── Toolbar Icon Components ────────────────────────────────────

function BoldIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.994V14c0 1.25.75 2 2 2" />
      <path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.994V14c0 1.25.75 2 2 2" />
    </svg>
  );
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function UndoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// ─── Editor Toolbar ─────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

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
            Set
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="min-h-7 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
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
}

export function FormRichText({
  label,
  name,
  defaultValue = "",
  error,
  help,
  required,
  placeholder,
  minHeight = 300,
}: FormRichTextProps) {
  const [mounted, setMounted] = useState(false);
  const [html, setHtml] = useState(defaultValue);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
          class: "text-[#0A6B62] underline underline-offset-2 hover:text-[#073F37]",
        },
      }),
    ],
    content: defaultValue,
    onUpdate: ({ editor: ed }) => {
      const updatedHtml = ed.getHTML();
      setHtml(updatedHtml);
      if (hiddenRef.current) {
        hiddenRef.current.value = updatedHtml;
      }
    },
  });

  // Sync if defaultValue changes externally (e.g., form reset with new data)
  useEffect(() => {
    if (editor && defaultValue !== editor.getHTML()) {
      editor.commands.setContent(defaultValue, { emitUpdate: false });
    }
  }, [defaultValue, editor]);

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
        {help ? <FormHelp>{help}</FormHelp> : null}
      </label>
    );
  }

  return (
    <div className={`block`}>
      <FormLabel required={required}>{label}</FormLabel>
      <div
        className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#0A6B62] focus-within:ring-2 focus-within:ring-[#0A6B62]/15"
        style={{ minHeight }}
      >
        <EditorToolbar editor={editor} />
        <div className="px-4 py-3">
          <EditorContent
            editor={editor}
            className="prose prose-sm prose-headings:font-black prose-headings:text-slate-800 prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-p:text-slate-700 prose-p:leading-7 prose-a:text-[#0A6B62] prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-[#0A6B62] prose-blockquote:text-slate-600 max-w-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
          />
        </div>
      </div>
      <input type="hidden" name={name} ref={hiddenRef} value={html} />
      <FormError error={error} />
      {help ? <FormHelp>{help}</FormHelp> : null}
    </div>
  );
}

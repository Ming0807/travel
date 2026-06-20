"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useRef, useState } from "react";
import { Image as ImageIcon, TextB, TextItalic, ListBullets, ListNumbers, Quotes, TextAlignLeft, TextAlignCenter, TextAlignRight } from "@phosphor-icons/react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

type StoryImageUploadResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

const MenuBar = ({ editor }: { editor: Editor }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const addImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as StoryImageUploadResponse | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองอีกครั้ง");
      }
      
      if (data?.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        throw new Error("ไม่พบลิงก์รูปภาพหลังอัปโหลด กรุณาลองอีกครั้ง");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 p-2 mb-4">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive("bold") ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <TextB size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive("italic") ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <TextItalic size={20} />
      </button>
      
      <div className="w-px h-6 bg-ink/10 mx-2" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive("bulletList") ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <ListBullets size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive("orderedList") ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <ListNumbers size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive("blockquote") ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <Quotes size={20} />
      </button>

      <div className="w-px h-6 bg-ink/10 mx-2" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive({ textAlign: "left" }) ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <TextAlignLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive({ textAlign: "center" }) ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <TextAlignCenter size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-2 rounded hover:bg-ink/5 transition-colors ${
          editor.isActive({ textAlign: "right" }) ? "bg-ink/10 text-ink" : "text-ink/60"
        }`}
      >
        <TextAlignRight size={20} />
      </button>

      <div className="w-px h-6 bg-ink/10 mx-2" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={addImage}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`p-2 rounded hover:bg-ink/5 transition-colors flex items-center gap-2 ${
          isUploading ? "text-ink/30 cursor-not-allowed" : "text-ink/60"
        }`}
        title="เพิ่มรูปภาพ"
      >
        {isUploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
        ) : (
          <ImageIcon size={20} />
        )}
        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline-block">
          {isUploading ? "กำลังอัปโหลด..." : "เพิ่มรูปภาพ"}
        </span>
      </button>
    </div>
  );
};

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-6",
        },
      }),
      Placeholder.configure({
        placeholder: "เล่าเรื่องราวการเดินทางของคุณ...",
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-ink/20 rounded-xl overflow-hidden bg-white focus-within:border-ink transition-colors">
      {editor ? <MenuBar editor={editor} /> : null}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

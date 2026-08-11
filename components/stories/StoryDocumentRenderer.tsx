import Image from "next/image";
import type { ReactNode } from "react";
import type {
  StoryDocument,
  StoryDocumentNode,
} from "@/lib/content/story-document";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { plainTextFromLegacyHtml } from "@/lib/content/plain-text";

export type StoryTableOfContentsItem = {
  id: string;
  level: number;
  label: string;
};

function nodeText(node: StoryDocumentNode): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(nodeText).join("");
}

export function buildStoryTableOfContents(
  document: StoryDocument
): StoryTableOfContentsItem[] {
  let headingIndex = 0;
  return document.content.flatMap((node) => {
    if (node.type !== "heading") return [];
    headingIndex += 1;
    const label = nodeText(node).trim();
    if (!label) return [];
    return [
      {
        id: `story-section-${headingIndex}`,
        level: Number(node.attrs?.level ?? 2),
        label,
      },
    ];
  });
}

function renderMarkedText(node: StoryDocumentNode, key: string): ReactNode {
  let content: ReactNode = node.text ?? "";
  for (const [index, mark] of (node.marks ?? []).entries()) {
    const markKey = `${key}-mark-${index}`;
    if (mark.type === "bold") content = <strong key={markKey}>{content}</strong>;
    if (mark.type === "italic") content = <em key={markKey}>{content}</em>;
    if (mark.type === "strike") content = <s key={markKey}>{content}</s>;
    if (mark.type === "code") content = <code key={markKey}>{content}</code>;
    if (mark.type === "link") {
      const opensNewTab = mark.attrs?.target === "_blank";
      content = (
        <a
          key={markKey}
          href={mark.attrs?.href}
          target={mark.attrs?.target}
          rel={opensNewTab ? "noopener noreferrer" : undefined}
        >
          {content}
        </a>
      );
    }
  }
  return content;
}

function renderChildren(
  nodes: StoryDocumentNode[] | undefined,
  keyPrefix: string,
  headingIds: Map<StoryDocumentNode, string>
): ReactNode[] {
  return (nodes ?? []).map((node, index) =>
    renderNode(node, `${keyPrefix}-${index}`, headingIds)
  );
}

function renderNode(
  node: StoryDocumentNode,
  key: string,
  headingIds: Map<StoryDocumentNode, string>
): ReactNode {
  if (node.type === "text") return renderMarkedText(node, key);
  if (node.type === "hardBreak") return <br key={key} />;
  if (node.type === "horizontalRule") return <hr key={key} />;
  if (node.type === "paragraph") {
    return <p key={key}>{renderChildren(node.content, key, headingIds)}</p>;
  }
  if (node.type === "heading") {
    const id = headingIds.get(node);
    const children = renderChildren(node.content, key, headingIds);
    const level = Number(node.attrs?.level ?? 2);
    if (level === 3) return <h3 key={key} id={id}>{children}</h3>;
    if (level === 4) return <h4 key={key} id={id}>{children}</h4>;
    return <h2 key={key} id={id}>{children}</h2>;
  }
  if (node.type === "bulletList") {
    return <ul key={key}>{renderChildren(node.content, key, headingIds)}</ul>;
  }
  if (node.type === "orderedList") {
    return <ol key={key}>{renderChildren(node.content, key, headingIds)}</ol>;
  }
  if (node.type === "listItem") {
    return <li key={key}>{renderChildren(node.content, key, headingIds)}</li>;
  }
  if (node.type === "blockquote") {
    return (
      <blockquote key={key}>
        {renderChildren(node.content, key, headingIds)}
      </blockquote>
    );
  }
  if (node.type === "image") {
    const storagePath =
      typeof node.attrs?.storagePath === "string"
        ? node.attrs.storagePath
        : null;
    const imageUrl = siteMediaImageUrl(storagePath);
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
    const caption =
      typeof node.attrs?.caption === "string" ? node.attrs.caption : null;
    if (!imageUrl || !alt) return null;
    return (
      <figure key={key} className="my-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 720px"
            className="object-cover"
          />
        </div>
        {caption ? (
          <figcaption className="mt-3 text-center text-sm leading-6 text-slate-600">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  return null;
}

export function StoryDocumentRenderer({
  document,
}: {
  document: StoryDocument;
}) {
  const toc = buildStoryTableOfContents(document);
  const headings = document.content.filter((node) => node.type === "heading");
  const headingIds = new Map(
    headings.map((node, index) => [
      node,
      toc[index]?.id ?? `story-section-${index + 1}`,
    ])
  );

  return (
    <div className="prose prose-lg mx-auto max-w-[70ch] prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-ink prose-p:leading-8 prose-p:text-slate-800 prose-a:font-bold prose-a:text-[#075E54] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-slate-300 prose-blockquote:text-slate-700 md:prose-xl">
      {renderChildren(document.content, "story", headingIds)}
    </div>
  );
}

export function LegacyStoryContent({
  content,
  fallback,
}: {
  content: string | null;
  fallback: string;
}) {
  const source = content?.trim() || fallback.trim();
  const withoutExecutableBlocks = source.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
    " ",
  );
  const paragraphs = withoutExecutableBlocks
    .split(/<\/(?:p|div|h[1-6]|li|blockquote)>|<br\b[^>]*\/?>|\n{2,}|\r?\n/gi)
    .map((paragraph) => plainTextFromLegacyHtml(paragraph))
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="prose prose-lg mx-auto max-w-[70ch] prose-p:leading-8 prose-p:text-slate-800 md:prose-xl">
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))
      ) : (
        <div className="border-y border-slate-200 py-12 text-center text-sm font-semibold text-slate-600">
          เรื่องนี้ยังไม่มีเนื้อหาฉบับเต็ม
        </div>
      )}
    </div>
  );
}

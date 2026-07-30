import {
  STORY_DOCUMENT_SCHEMA_VERSION,
  storyDocumentSchema,
  type StoryDocument,
  type StoryDocumentNode,
} from "@/lib/content/story-document";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

const supportedNodes = new Set([
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "text",
  "hardBreak",
  "blockquote",
  "horizontalRule",
  "image",
]);

function normalizeMarks(value: unknown): StoryDocumentNode["marks"] {
  if (!Array.isArray(value)) return undefined;
  return value.map((rawMark) => {
    const mark = asRecord(rawMark);
    const type = String(mark.type);
    if (!new Set(["bold", "italic", "strike", "code", "link"]).has(type)) {
      throw new Error("INVALID_STORY_DOCUMENT");
    }
    if (type !== "link") return { type: type as "bold" | "italic" | "strike" | "code" };
    const attrs = asRecord(mark.attrs);
    return {
      type: "link" as const,
      attrs: {
        href: typeof attrs.href === "string" ? attrs.href : "",
        ...(attrs.target === "_self" || attrs.target === "_blank" ? { target: attrs.target } : {}),
      },
    };
  });
}

function normalizeNode(value: unknown): StoryDocumentNode {
  const node = asRecord(value);
  const type = String(node.type);
  if (!supportedNodes.has(type)) throw new Error("INVALID_STORY_DOCUMENT");

  if (type === "text") {
    return {
      type: "text",
      text: typeof node.text === "string" ? node.text : "",
      ...(node.marks ? { marks: normalizeMarks(node.marks) } : {}),
    };
  }

  if (type === "hardBreak" || type === "horizontalRule") {
    return { type } as StoryDocumentNode;
  }

  if (type === "heading") {
    const attrs = asRecord(node.attrs);
    return {
      type: "heading",
      attrs: { level: Number(attrs.level) },
      content: Array.isArray(node.content) ? node.content.map(normalizeNode) : [],
    };
  }

  if (type === "image") {
    const attrs = asRecord(node.attrs);
    return {
      type: "image",
      attrs: {
        mediaId: Number(attrs.mediaId),
        alt: typeof attrs.alt === "string" ? attrs.alt : "",
        ...(typeof attrs.caption === "string" ? { caption: attrs.caption } : {}),
      },
    };
  }

  if (type === "orderedList" && node.attrs) {
    const attrs = asRecord(node.attrs);
    const keys = Object.keys(attrs);
    const hasOnlyTiptapDefaults = keys.every((key) => key === "start" || key === "type");
    if (
      !hasOnlyTiptapDefaults ||
      (attrs.start !== undefined && attrs.start !== 1) ||
      (attrs.type !== undefined && attrs.type !== null)
    ) {
      throw new Error("INVALID_STORY_DOCUMENT");
    }
  } else if (node.attrs && Object.keys(asRecord(node.attrs)).length > 0) {
    throw new Error("INVALID_STORY_DOCUMENT");
  }

  return {
    type: type as StoryDocumentNode["type"],
    content: Array.isArray(node.content) ? node.content.map(normalizeNode) : [],
  };
}

export function fromTiptapJson(value: unknown): StoryDocument {
  const root = asRecord(value);
  if (root.type !== "doc" || !Array.isArray(root.content)) throw new Error("INVALID_STORY_DOCUMENT");
  const candidate = {
    type: "doc" as const,
    version: STORY_DOCUMENT_SCHEMA_VERSION,
    content: root.content.map(normalizeNode),
  };
  const parsed = storyDocumentSchema.safeParse(candidate);
  if (!parsed.success) throw new Error("INVALID_STORY_DOCUMENT");
  return parsed.data as StoryDocument;
}

export function toTiptapJson(document: StoryDocument): { type: "doc"; content: StoryDocumentNode[] } {
  return { type: "doc", content: document.content };
}

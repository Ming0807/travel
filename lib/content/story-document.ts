import { z } from "zod";

export const STORY_DOCUMENT_SCHEMA_VERSION = 1 as const;
const MAX_DOCUMENT_NODES = 2_000;
const MAX_DOCUMENT_DEPTH = 12;
const MAX_TEXT_LENGTH = 20_000;

type StoryMark = {
  type: "bold" | "italic" | "strike" | "code" | "link";
  attrs?: { href: string; target?: "_self" | "_blank" };
};

export type StoryDocumentNode = {
  type:
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "text"
    | "hardBreak"
    | "blockquote"
    | "horizontalRule"
    | "image";
  attrs?: Record<string, unknown>;
  content?: StoryDocumentNode[];
  text?: string;
  marks?: StoryMark[];
};

export type StoryDocument = {
  type: "doc";
  version: typeof STORY_DOCUMENT_SCHEMA_VERSION;
  content: StoryDocumentNode[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isSafeLink(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2_048) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validateMarks(marks: unknown, path: PropertyKey[], ctx: z.RefinementCtx): void {
  if (!Array.isArray(marks)) {
    ctx.addIssue({ code: "custom", message: "Marks must be an array.", path });
    return;
  }

  for (const [index, mark] of marks.entries()) {
    const markPath = [...path, index];
    if (!isRecord(mark) || !hasOnlyKeys(mark, ["type", "attrs"])) {
      ctx.addIssue({ code: "custom", message: "Invalid text mark.", path: markPath });
      continue;
    }
    if (!["bold", "italic", "strike", "code", "link"].includes(String(mark.type))) {
      ctx.addIssue({ code: "custom", message: "Unsupported text mark.", path: [...markPath, "type"] });
      continue;
    }
    if (mark.type !== "link" && mark.attrs !== undefined) {
      ctx.addIssue({ code: "custom", message: "This mark does not accept attributes.", path: [...markPath, "attrs"] });
    }
    if (mark.type === "link") {
      if (
        !isRecord(mark.attrs) ||
        !hasOnlyKeys(mark.attrs, ["href", "target"]) ||
        !isSafeLink(mark.attrs.href) ||
        (mark.attrs.target !== undefined && !["_self", "_blank"].includes(String(mark.attrs.target)))
      ) {
        ctx.addIssue({ code: "custom", message: "Invalid or unsafe link.", path: [...markPath, "attrs"] });
      }
    }
  }
}

const childRules: Record<string, readonly string[]> = {
  paragraph: ["text", "hardBreak"],
  heading: ["text", "hardBreak"],
  bulletList: ["listItem"],
  orderedList: ["listItem"],
  listItem: ["paragraph", "bulletList", "orderedList"],
  blockquote: ["paragraph", "heading"],
};

function validateNode(
  node: unknown,
  path: PropertyKey[],
  depth: number,
  state: { count: number },
  ctx: z.RefinementCtx
): void {
  state.count += 1;
  if (state.count > MAX_DOCUMENT_NODES) {
    ctx.addIssue({ code: "custom", message: "Story document contains too many nodes.", path });
    return;
  }
  if (depth > MAX_DOCUMENT_DEPTH) {
    ctx.addIssue({ code: "custom", message: "Story document is nested too deeply.", path });
    return;
  }
  if (!isRecord(node)) {
    ctx.addIssue({ code: "custom", message: "Story node must be an object.", path });
    return;
  }

  const type = typeof node.type === "string" ? node.type : "";
  const supportedTypes = [
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
  ];
  if (!supportedTypes.includes(type)) {
    ctx.addIssue({ code: "custom", message: "Unsupported story node type.", path: [...path, "type"] });
    return;
  }

  const allowedNodeKeys = type === "text" ? ["type", "text", "marks"] : ["type", "attrs", "content"];
  if (!hasOnlyKeys(node, allowedNodeKeys)) {
    ctx.addIssue({ code: "custom", message: "Story node contains unsupported fields.", path });
  }

  if (type === "text") {
    if (typeof node.text !== "string" || node.text.length > MAX_TEXT_LENGTH) {
      ctx.addIssue({ code: "custom", message: "Invalid story text.", path: [...path, "text"] });
    }
    if (node.marks !== undefined) validateMarks(node.marks, [...path, "marks"], ctx);
    return;
  }

  if (type === "heading") {
    if (
      !isRecord(node.attrs) ||
      !hasOnlyKeys(node.attrs, ["level"]) ||
      ![2, 3, 4].includes(Number(node.attrs.level))
    ) {
      ctx.addIssue({ code: "custom", message: "Headings must use level 2, 3, or 4.", path: [...path, "attrs"] });
    }
  } else if (type === "image") {
    if (
      !isRecord(node.attrs) ||
      !hasOnlyKeys(node.attrs, ["mediaId", "alt", "caption"]) ||
      !Number.isInteger(node.attrs.mediaId) ||
      Number(node.attrs.mediaId) <= 0 ||
      typeof node.attrs.alt !== "string" ||
      node.attrs.alt.trim().length === 0 ||
      node.attrs.alt.length > 255 ||
      (node.attrs.caption !== undefined &&
        (typeof node.attrs.caption !== "string" || node.attrs.caption.length > 500))
    ) {
      ctx.addIssue({ code: "custom", message: "Images must reference managed media and include alt text.", path: [...path, "attrs"] });
    }
  } else if (node.attrs !== undefined) {
    ctx.addIssue({ code: "custom", message: "This node does not accept attributes.", path: [...path, "attrs"] });
  }

  const leaf = ["hardBreak", "horizontalRule", "image"].includes(type);
  if (leaf) {
    if (node.content !== undefined) {
      ctx.addIssue({ code: "custom", message: "Leaf nodes cannot contain child nodes.", path: [...path, "content"] });
    }
    return;
  }

  if (!Array.isArray(node.content)) {
    ctx.addIssue({ code: "custom", message: "This story node requires content.", path: [...path, "content"] });
    return;
  }

  const allowedChildren = childRules[type] ?? [];
  for (const [index, child] of node.content.entries()) {
    if (isRecord(child) && !allowedChildren.includes(String(child.type))) {
      ctx.addIssue({
        code: "custom",
        message: `The ${type} node cannot contain ${String(child.type)}.`,
        path: [...path, "content", index, "type"],
      });
    }
    validateNode(child, [...path, "content", index], depth + 1, state, ctx);
  }
}

export const storyDocumentSchema = z
  .object({
    type: z.literal("doc"),
    version: z.literal(STORY_DOCUMENT_SCHEMA_VERSION),
    content: z.array(z.unknown()),
  })
  .strict()
  .superRefine((document, ctx) => {
    const state = { count: 0 };
    const rootNodeTypes = [
      "paragraph",
      "heading",
      "bulletList",
      "orderedList",
      "blockquote",
      "horizontalRule",
      "image",
    ];
    for (const [index, node] of document.content.entries()) {
      if (isRecord(node) && !rootNodeTypes.includes(String(node.type))) {
        ctx.addIssue({
          code: "custom",
          message: "This node type is not allowed at the document root.",
          path: ["content", index, "type"],
        });
      }
      validateNode(node, ["content", index], 1, state, ctx);
    }
  });

export function parseStoryDocument(value: unknown): StoryDocument {
  return storyDocumentSchema.parse(value) as StoryDocument;
}

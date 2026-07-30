import {
  storyDocumentSchema,
  type StoryDocumentNode,
} from "@/lib/content/story-document";

export type StoryOutlineItem = {
  key: string;
  level: number;
  text: string;
};

function nodeText(node: StoryDocumentNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  return (node.content ?? []).map(nodeText).join("");
}

export function extractStoryOutline(value: unknown): StoryOutlineItem[] {
  const parsed = storyDocumentSchema.safeParse(value);
  if (!parsed.success) return [];

  let headingNumber = 0;
  return parsed.data.content.flatMap((node) => {
    const storyNode = node as StoryDocumentNode;
    if (storyNode.type !== "heading") return [];
    const text = nodeText(storyNode)
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return [];
    headingNumber += 1;
    return [{
      key: `heading-${headingNumber}`,
      level: Number(storyNode.attrs?.level ?? 2),
      text,
    }];
  });
}

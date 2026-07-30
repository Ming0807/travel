import {
  STORY_DOCUMENT_SCHEMA_VERSION,
  parseStoryDocument,
  type StoryDocumentNode,
} from "@/lib/content/story-document";

type ManagedStoryImageInput = {
  assetId: string;
  storagePath: string;
  alt: string;
  caption?: string;
};

export function createManagedStoryImageNode(
  input: ManagedStoryImageInput,
): StoryDocumentNode {
  const caption = input.caption?.trim();
  const node: StoryDocumentNode = {
    type: "image",
    attrs: {
      assetId: input.assetId.trim(),
      storagePath: input.storagePath.trim(),
      alt: input.alt.trim(),
      ...(caption ? { caption } : {}),
    },
  };

  try {
    parseStoryDocument({
      type: "doc",
      version: STORY_DOCUMENT_SCHEMA_VERSION,
      content: [node],
    });
    return node;
  } catch {
    throw new Error("INVALID_MANAGED_STORY_IMAGE");
  }
}

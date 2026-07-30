import { z } from "zod";

const nonceSchema = z
  .string()
  .min(32)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

const commonFields = {
  storyId: z.number().int().positive(),
  locale: z.enum(["th", "en"]),
  nonce: nonceSchema,
};

const storyEngagementPayloadSchema = z.discriminatedUnion("event", [
  z
    .object({
      event: z.literal("story_impression"),
      surface: z.literal("story_hub"),
      position: z.number().int().min(1).max(24),
      ...commonFields,
    })
    .strict(),
  z
    .object({
      event: z.literal("story_open"),
      surface: z.literal("story_detail"),
      ...commonFields,
    })
    .strict(),
  z
    .object({
      event: z.literal("related_content_click"),
      surface: z.literal("related_rail"),
      relatedStoryId: z.number().int().positive(),
      position: z.number().int().min(1).max(24),
      ...commonFields,
    })
    .strict()
    .refine((value) => value.storyId !== value.relatedStoryId, {
      message: "A Story cannot recommend itself.",
      path: ["relatedStoryId"],
    }),
  z
    .object({
      event: z.literal("meaningful_read_complete"),
      surface: z.literal("story_detail"),
      ...commonFields,
    })
    .strict(),
]);

export type StoryEngagementPayload = z.infer<
  typeof storyEngagementPayloadSchema
>;

export type StoryEngagementPersistedPayload =
  StoryEngagementPayload extends infer Payload
    ? Payload extends { nonce: string }
      ? Omit<Payload, "nonce">
      : never
    : never;

export function parseStoryEngagementPayload(
  input: unknown,
): StoryEngagementPayload {
  return storyEngagementPayloadSchema.parse(input);
}

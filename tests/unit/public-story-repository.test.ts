import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { chain, client } = vi.hoisted(() => {
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    "select",
    "eq",
    "or",
    "order",
    "range",
    "maybeSingle",
    "limit",
    "in",
  ]) {
    query[method] = vi.fn();
    query[method].mockReturnValue(query);
  }
  return {
    chain: query,
    client: { from: vi.fn().mockReturnValue(query) },
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(client),
}));

import {
  getPublicStory,
  listPublicStoryPage,
} from "@/lib/repositories/public-content.repository";

describe("public story repository pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const method of [
      "select",
      "eq",
      "or",
      "order",
      "range",
      "maybeSingle",
      "limit",
      "in",
    ]) {
      chain[method].mockReturnValue(chain);
    }
    client.from.mockReturnValue(chain);
  });

  it("applies published-only filters and returns exact page metadata", async () => {
    chain.range.mockResolvedValueOnce({
      data: [
        {
          slug: "pattani-old-town",
          title: "เสน่ห์เมืองเก่าปัตตานี",
          excerpt: "เดินชมชุมชน",
          published_at: "2026-07-20T00:00:00.000Z",
          author_type: "admin",
          reading_minutes: 6,
          primary_language: "th",
          tourists: null,
          provinces: {
            province_name_th: "ปัตตานี",
            province_name_en: "Pattani",
          },
          content_media: [
            {
              storage_path: "stories/pattani.webp",
              alt_text_th: "อาคารเก่าในปัตตานี",
              is_cover: true,
              is_active: true,
              lifecycle_status: "active",
              display_order: 0,
            },
          ],
          story_topic_links: [
            {
              is_primary: true,
              story_topics: {
                topic_key: "culture",
                name_th: "วัฒนธรรมและประวัติศาสตร์",
                name_en: "Culture and History",
              },
            },
          ],
        },
      ],
      error: null,
      count: 25,
    });

    const result = await listPublicStoryPage({
      search: "เมือง_เก่า",
      province: "Pattani",
      topic: "culture",
      authorType: "admin",
      page: 2,
      pageSize: 12,
    });

    expect(chain.eq).toHaveBeenCalledWith("status", "published");
    expect(chain.eq).toHaveBeenCalledWith("is_published", true);
    expect(chain.eq).toHaveBeenCalledWith(
      "provinces.province_name_en",
      "Pattani"
    );
    expect(chain.eq).toHaveBeenCalledWith("author_type", "admin");
    expect(chain.eq).toHaveBeenCalledWith(
      "topic_filter.story_topics.topic_key",
      "culture"
    );
    expect(chain.or).toHaveBeenCalledWith(
      expect.not.stringContaining("เมือง_เก่า")
    );
    expect(chain.range).toHaveBeenCalledWith(12, 23);
    expect(chain.order).toHaveBeenCalledWith("story_id", {
      ascending: false,
    });
    expect(result).toMatchObject({
      total: 25,
      page: 2,
      pageSize: 12,
      totalPages: 3,
      loadError: false,
      items: [
        {
          id: "pattani-old-town",
          imageAlt: "อาคารเก่าในปัตตานี",
          readingMinutes: 6,
          primaryTopic: {
            key: "culture",
            name: "วัฒนธรรมและประวัติศาสตร์",
          },
        },
      ],
    });
  });

  it("distinguishes a repository failure from a legitimate empty result", async () => {
    chain.range.mockResolvedValueOnce({
      data: null,
      error: { message: "schema cache unavailable" },
      count: null,
    });

    const result = await listPublicStoryPage({
      page: 1,
      pageSize: 12,
    });

    expect(result).toMatchObject({
      items: [],
      total: 0,
      loadError: true,
    });
  });

  it("does not expose legacy external cover URLs as managed public media", async () => {
    chain.range.mockResolvedValueOnce({
      data: [
        {
          slug: "legacy-stock-cover",
          title: "เรื่องที่ต้องเปลี่ยนภาพ",
          excerpt: "",
          status: "published",
          is_published: true,
          author_type: "admin",
          content_media: [
            {
              storage_path: "https://images.unsplash.com/photo-demo",
              is_cover: true,
              is_active: true,
              lifecycle_status: "active",
            },
          ],
          story_topic_links: [],
        },
      ],
      error: null,
      count: 1,
    });

    const result = await listPublicStoryPage({
      page: 1,
      pageSize: 12,
    });

    expect(result.items[0]?.imageUrl).toBeNull();
  });

  it("loads canonical structured content for a published story detail", async () => {
    chain.maybeSingle.mockResolvedValueOnce({
      data: {
        slug: "pattani-old-town",
        title: "เสน่ห์เมืองเก่าปัตตานี",
        excerpt: "เดินชมชุมชน",
        content: "<p>เนื้อหาเดิม</p>",
        content_document: {
          type: "doc",
          version: 2,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "เนื้อหาโครงสร้าง" }],
            },
          ],
        },
        content_schema_version: 2,
        status: "published",
        is_published: true,
        author_type: "admin",
        published_at: "2026-07-20T00:00:00.000Z",
        content_media: [],
        story_topic_links: [],
      },
      error: null,
    });
    chain.limit.mockResolvedValueOnce({ data: [], error: null });

    const result = await getPublicStory("pattani-old-town");

    expect(chain.eq).toHaveBeenCalledWith("status", "published");
    expect(chain.eq).toHaveBeenCalledWith("is_published", true);
    expect(result?.story.contentDocument).toEqual(
      expect.objectContaining({ version: 2 })
    );
  });
});

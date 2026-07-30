import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { storyRecommendationMutationSchema } from "@/lib/validation/story";

const { searchCandidates, saveRecommendations } = vi.hoisted(() => ({
  searchCandidates: vi.fn(),
  saveRecommendations: vi.fn(),
}));

vi.mock("@/app/actions/admin-story-actions", () => ({
  searchStoryRecommendationCandidatesAction: searchCandidates,
  saveStoryRecommendationsAction: saveRecommendations,
}));

import { StoryRecommendationManager } from "@/components/admin/stories/editor/StoryRecommendationManager";

describe("story recommendation management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects duplicate, self-referencing, and non-contiguous selections", () => {
    const duplicate = storyRecommendationMutationSchema.safeParse({
      sourceStoryId: 4,
      items: [
        { targetStoryId: 8, displayOrder: 0, reason: null },
        { targetStoryId: 8, displayOrder: 2, reason: null },
      ],
    });
    const selfReference = storyRecommendationMutationSchema.safeParse({
      sourceStoryId: 4,
      items: [{ targetStoryId: 4, displayOrder: 0, reason: null }],
    });

    expect(duplicate.success).toBe(false);
    expect(selfReference.success).toBe(false);
  });

  it("searches, adds, explains, and saves an ordered recommendation", async () => {
    const user = userEvent.setup();
    searchCandidates.mockResolvedValue({
      success: true,
      data: [
        {
          storyId: 9,
          title: "เส้นทางวัฒนธรรมปัตตานี",
          slug: "pattani-culture-route",
          provinceName: "ปัตตานี",
        },
      ],
    });
    saveRecommendations.mockResolvedValue({
      success: true,
      data: [
        {
          targetStoryId: 9,
          title: "เส้นทางวัฒนธรรมปัตตานี",
          slug: "pattani-culture-route",
          provinceName: "ปัตตานี",
          displayOrder: 0,
          reason: "อ่านต่อเพื่อวางแผนเส้นทาง",
        },
      ],
    });

    render(
      <StoryRecommendationManager
        storyId={4}
        initialItems={[]}
        onClose={vi.fn()}
        onDirtyChange={vi.fn()}
      />
    );

    await user.type(
      screen.getByLabelText("ค้นหาจากชื่อหรือ slug"),
      "วัฒนธรรม"
    );
    await user.click(
      screen.getByRole("button", { name: "ค้นหาบทความ" })
    );
    await user.click(
      await screen.findByRole("button", {
        name: "เพิ่ม เส้นทางวัฒนธรรมปัตตานี",
      })
    );
    await user.type(
      screen.getByLabelText("เหตุผลที่แนะนำ (ไม่บังคับ)"),
      "อ่านต่อเพื่อวางแผนเส้นทาง"
    );
    await user.click(
      screen.getByRole("button", { name: "บันทึกบทความแนะนำ" })
    );

    expect(saveRecommendations).toHaveBeenCalledWith({
      sourceStoryId: 4,
      items: [
        {
          targetStoryId: 9,
          displayOrder: 0,
          reason: "อ่านต่อเพื่อวางแผนเส้นทาง",
        },
      ],
    });
    expect(
      await screen.findByText("บันทึกบทความแนะนำแล้ว")
    ).toBeInTheDocument();
  });

  it("does not restore stale results after the search input is cleared", async () => {
    const user = userEvent.setup();
    let resolveSearch:
      | ((value: {
          success: true;
          data: Array<{
            storyId: number;
            title: string;
            slug: string;
            provinceName: string;
          }>;
        }) => void)
      | undefined;
    searchCandidates.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      })
    );

    render(
      <StoryRecommendationManager
        storyId={4}
        initialItems={[]}
        onClose={vi.fn()}
        onDirtyChange={vi.fn()}
      />
    );

    const input = screen.getByLabelText("ค้นหาจากชื่อหรือ slug");
    await user.type(input, "ยะลา");
    await user.click(
      screen.getByRole("button", { name: "ค้นหาบทความ" })
    );
    await user.clear(input);
    await act(async () => {
      resolveSearch?.({
        success: true,
        data: [
          {
            storyId: 10,
            title: "ผลลัพธ์เก่า",
            slug: "stale-result",
            provinceName: "ยะลา",
          },
        ],
      });
    });

    expect(
      screen.queryByRole("button", { name: "เพิ่ม ผลลัพธ์เก่า" })
    ).not.toBeInTheDocument();
  });
});

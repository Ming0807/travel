"use client";

import type { PublicStoryCard as PublicStoryCardData } from "@/lib/repositories/public-content.repository";
import { PublicStoryCard } from "./PublicStoryCard";
import { StorySidebar } from "./StorySidebar";

export function StoryDirectoryClient({
  latestStory,
  stories,
  engagementEnabled = false,
}: {
  latestStory?: PublicStoryCardData | null;
  stories: PublicStoryCardData[];
  engagementEnabled?: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* 1. Featured Latest Story Spotlight Cover */}
      {latestStory ? (
        <div className="w-full">
          <PublicStoryCard
            story={latestStory}
            featured
            label="เรื่องล่าสุด"
            tracking={engagementEnabled ? { surface: "story_hub", position: 1 } : undefined}
          />
        </div>
      ) : null}

      {/* 2. Main Discovery Workspace: Stories Grid + Sticky Right Sidebar */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Left Column: Stories Cards Grid */}
        <div className="min-w-0">
          {stories.length > 0 ? (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              aria-label="รายการเรื่องราว"
            >
              {stories.map((story, index) => (
                <PublicStoryCard
                  key={story.id}
                  story={story}
                  tracking={
                    engagementEnabled
                      ? { surface: "story_hub", position: index + (latestStory ? 2 : 1) }
                      : undefined
                  }
                />
              ))}
            </div>
          ) : latestStory ? null : (
            <div className="rounded-xl border border-orange-100 bg-white p-8 text-center text-sm font-bold text-muted">
              ไม่พบเรื่องราวเพิ่มเติม
            </div>
          )}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="hidden lg:sticky lg:top-24 lg:block">
          <StorySidebar />
        </div>
      </div>
    </div>
  );
}

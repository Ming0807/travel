export type StoryEngagementAggregateRow = {
  storyId: number;
  eventName: string;
  eventCount: number;
  uniqueSessionCount: number;
};

export type StoryEngagementSignal = {
  engagementScore: number;
  engagementSampleSize: number;
};

export function buildStoryEngagementSignals(
  rows: readonly StoryEngagementAggregateRow[],
): Map<number, StoryEngagementSignal> {
  const counts = new Map<
    number,
    { opens: number; completed: number }
  >();

  for (const row of rows) {
    if (!Number.isInteger(row.storyId) || row.storyId <= 0) continue;
    const current = counts.get(row.storyId) ?? { opens: 0, completed: 0 };
    if (row.eventName === "story_open") {
      current.opens += Math.max(0, row.uniqueSessionCount);
    } else if (row.eventName === "meaningful_read_complete") {
      current.completed += Math.max(0, row.uniqueSessionCount);
    }
    counts.set(row.storyId, current);
  }

  const signals = new Map<number, StoryEngagementSignal>();
  for (const [storyId, count] of counts) {
    if (count.opens <= 0) continue;
    signals.set(storyId, {
      engagementSampleSize: count.opens,
      engagementScore: Math.min(10, (count.completed / count.opens) * 10),
    });
  }

  return signals;
}

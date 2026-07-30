"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { StoryEngagementPayload } from "@/lib/validation/story-engagement";

const NONCE_STORAGE_KEY = "story-engagement-session-v1";
const NONCE_TTL_MS = 24 * 60 * 60 * 1000;
const MINIMUM_ACTIVE_READING_MS = 15_000;

type StoredNonce = {
  nonce: string;
  createdAt: number;
};

type StoryEngagementPayloadWithoutNonce =
  StoryEngagementPayload extends infer Payload
    ? Payload extends { nonce: string }
      ? Omit<Payload, "nonce">
      : never
    : never;

function analyticsDisabled(): boolean {
  const privacyNavigator = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  return (
    privacyNavigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1"
  );
}

function createNonce(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function getSessionNonce(): string | null {
  if (analyticsDisabled()) return null;

  const now = Date.now();
  try {
    const stored = sessionStorage.getItem(NONCE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredNonce;
      if (
        typeof parsed.nonce === "string" &&
        /^[A-Za-z0-9_-]{32,128}$/.test(parsed.nonce) &&
        Number.isFinite(parsed.createdAt) &&
        now - parsed.createdAt < NONCE_TTL_MS
      ) {
        return parsed.nonce;
      }
    }

    const next = { nonce: createNonce(), createdAt: now };
    sessionStorage.setItem(NONCE_STORAGE_KEY, JSON.stringify(next));
    return next.nonce;
  } catch {
    return null;
  }
}

function sendStoryEvent(
  payload: StoryEngagementPayloadWithoutNonce,
): void {
  const nonce = getSessionNonce();
  if (!nonce) return;

  void fetch("/api/content/events", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, nonce }),
  }).catch(() => undefined);
}

export type StoryCardTracking = {
  surface: "story_hub" | "related_rail";
  position: number;
  sourceStoryId?: number;
};

export function StoryCardEngagement({
  storyId,
  locale,
  tracking,
  children,
}: {
  storyId: number;
  locale: "th" | "en";
  tracking: StoryCardTracking;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const impressionSentRef = useRef(false);

  useEffect(() => {
    if (tracking.surface !== "story_hub" || !containerRef.current) return;

    const element = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !impressionSentRef.current &&
          entries.some((entry) => entry.isIntersecting)
        ) {
          impressionSentRef.current = true;
          sendStoryEvent({
            event: "story_impression",
            storyId,
            surface: "story_hub",
            locale,
            position: tracking.position,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [locale, storyId, tracking.position, tracking.surface]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        tracking.surface !== "related_rail" ||
        !tracking.sourceStoryId ||
        !(event.target as HTMLElement).closest("a")
      ) {
        return;
      }

      sendStoryEvent({
        event: "related_content_click",
        storyId: tracking.sourceStoryId,
        relatedStoryId: storyId,
        surface: "related_rail",
        locale,
        position: tracking.position,
      });
    },
    [locale, storyId, tracking],
  );

  return (
    <div ref={containerRef} onClickCapture={handleClick} className="h-full">
      {children}
    </div>
  );
}

export function StoryDetailEngagement({
  storyId,
  locale,
}: {
  storyId: number;
  locale: "th" | "en";
}) {
  const completionRef = useRef<HTMLSpanElement>(null);
  const completionSentRef = useRef(false);

  useEffect(() => {
    sendStoryEvent({
      event: "story_open",
      storyId,
      surface: "story_detail",
      locale,
    });
  }, [locale, storyId]);

  useEffect(() => {
    if (!completionRef.current) return;

    let reachedArticleEnd = false;
    let activeSince =
      document.visibilityState === "visible" ? performance.now() : null;
    let activeReadingMs = 0;

    const updateActiveReading = () => {
      const now = performance.now();
      if (activeSince !== null) {
        activeReadingMs += now - activeSince;
        activeSince = now;
      }
    };

    const maybeRecordCompletion = () => {
      updateActiveReading();
      if (
        reachedArticleEnd &&
        !completionSentRef.current &&
        document.visibilityState === "visible" &&
        activeReadingMs >= MINIMUM_ACTIVE_READING_MS
      ) {
        completionSentRef.current = true;
        sendStoryEvent({
          event: "meaningful_read_complete",
          storyId,
          surface: "story_detail",
          locale,
        });
        observer.disconnect();
      }
    };

    const handleVisibilityChange = () => {
      updateActiveReading();
      activeSince =
        document.visibilityState === "visible" ? performance.now() : null;
      maybeRecordCompletion();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        reachedArticleEnd =
          reachedArticleEnd || entries.some((entry) => entry.isIntersecting);
        maybeRecordCompletion();
      },
      { threshold: 0.75 },
    );
    observer.observe(completionRef.current);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const timer = window.setInterval(maybeRecordCompletion, 1_000);

    return () => {
      observer.disconnect();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      window.clearInterval(timer);
    };
  }, [locale, storyId]);

  return <span ref={completionRef} className="block h-px" aria-hidden="true" />;
}

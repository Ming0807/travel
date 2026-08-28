"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  parseTripShortlist,
  serializeTripShortlist,
  TRIP_SHORTLIST_KEY,
  TRIP_SHORTLIST_LIMIT,
} from "@/lib/trip-shortlist/storage";

interface TripShortlistContextValue {
  slugs: string[];
  hydrated: boolean;
  announcement: string;
  has: (slug: string) => boolean;
  toggle: (slug: string, label: string) => void;
  remove: (slug: string, label: string) => void;
  clear: () => void;
}

const TripShortlistContext = createContext<TripShortlistContextValue | null>(null);

function readStoredSlugs(storageKey: string) {
  try {
    return parseTripShortlist(window.localStorage.getItem(storageKey));
  } catch {
    return [];
  }
}

export function TripShortlistProvider({
  children,
  storageKey = TRIP_SHORTLIST_KEY,
  itemNoun = "สถานที่",
}: {
  children: ReactNode;
  storageKey?: string;
  itemNoun?: string;
}) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSlugs(readStoredSlugs(storageKey));
      setHydrated(true);
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setSlugs(parseTripShortlist(event.newValue));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, serializeTripShortlist(slugs));
    } catch {
      // The shortlist remains usable for this page when browser storage is unavailable.
    }
  }, [hydrated, slugs, storageKey]);

  const remove = useCallback((slug: string, label: string) => {
    setSlugs((current) => current.filter((item) => item !== slug));
    setAnnouncement(`นำ${label}ออกจากทริปแล้ว`);
  }, []);

  const toggle = useCallback((slug: string, label: string) => {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return;

    setSlugs((current) => {
      if (current.includes(normalizedSlug)) {
        setAnnouncement(`นำ${label}ออกจากทริปแล้ว`);
        return current.filter((item) => item !== normalizedSlug);
      }
      if (current.length >= TRIP_SHORTLIST_LIMIT) {
        setAnnouncement(`บันทึกได้สูงสุด ${TRIP_SHORTLIST_LIMIT} ${itemNoun}`);
        return current;
      }
      setAnnouncement(`บันทึก${label}ไว้ในทริปแล้ว`);
      return [...current, normalizedSlug];
    });
  }, [itemNoun]);

  const clear = useCallback(() => {
    setSlugs([]);
    setAnnouncement(`ล้าง${itemNoun}ที่บันทึกไว้แล้ว`);
  }, [itemNoun]);

  const value = useMemo<TripShortlistContextValue>(
    () => ({
      slugs,
      hydrated,
      announcement,
      has: (slug) => slugs.includes(slug),
      toggle,
      remove,
      clear,
    }),
    [announcement, clear, hydrated, remove, slugs, toggle],
  );

  return (
    <TripShortlistContext.Provider value={value}>
      {children}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </TripShortlistContext.Provider>
  );
}

export function useTripShortlist() {
  const value = useContext(TripShortlistContext);
  if (!value) throw new Error("useTripShortlist must be used within TripShortlistProvider");
  return value;
}

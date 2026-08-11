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

function readStoredSlugs() {
  try {
    return parseTripShortlist(window.localStorage.getItem(TRIP_SHORTLIST_KEY));
  } catch {
    return [];
  }
}

export function TripShortlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSlugs(readStoredSlugs());
      setHydrated(true);
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TRIP_SHORTLIST_KEY) setSlugs(parseTripShortlist(event.newValue));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TRIP_SHORTLIST_KEY, serializeTripShortlist(slugs));
    } catch {
      // The shortlist remains usable for this page when browser storage is unavailable.
    }
  }, [hydrated, slugs]);

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
        setAnnouncement(`บันทึกได้สูงสุด ${TRIP_SHORTLIST_LIMIT} สถานที่`);
        return current;
      }
      setAnnouncement(`บันทึก${label}ไว้ในทริปแล้ว`);
      return [...current, normalizedSlug];
    });
  }, []);

  const clear = useCallback(() => {
    setSlugs([]);
    setAnnouncement("ล้างสถานที่ในทริปแล้ว");
  }, []);

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

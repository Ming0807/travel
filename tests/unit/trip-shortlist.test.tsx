import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { TripShortlistBar } from "../../components/trip-shortlist/TripShortlistBar";
import { TripShortlistButton } from "../../components/trip-shortlist/TripShortlistButton";
import { TripShortlistPanel } from "../../components/trip-shortlist/TripShortlistPanel";
import { TripShortlistProvider } from "../../components/trip-shortlist/TripShortlistProvider";
import {
  parseTripShortlist,
  serializeTripShortlist,
  TRIP_SHORTLIST_KEY,
  TRIP_SHORTLIST_LIMIT,
} from "../../lib/trip-shortlist/storage";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe("trip shortlist storage", () => {
  it("accepts only version 1 and normalizes unique non-empty slugs", () => {
    expect(parseTripShortlist('{"version":1,"slugs":["a"," a ","","b",7]}')).toEqual(["a", "b"]);
    expect(parseTripShortlist('{"version":2,"slugs":["a"]}')).toEqual([]);
    expect(parseTripShortlist("not-json")).toEqual([]);
    expect(parseTripShortlist(null)).toEqual([]);
  });

  it("caps storage at the documented limit", () => {
    const slugs = Array.from({ length: TRIP_SHORTLIST_LIMIT + 5 }, (_, index) => `place-${index}`);
    const parsed = JSON.parse(serializeTripShortlist(slugs)) as { version: number; slugs: string[] };

    expect(parsed.version).toBe(1);
    expect(parsed.slugs).toHaveLength(TRIP_SHORTLIST_LIMIT);
  });
});

describe("trip shortlist UI", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("adds and removes an attraction with accessible state and persistence", async () => {
    const user = userEvent.setup();
    render(
      <TripShortlistProvider>
        <TripShortlistButton slug="aiyerweng-skywalk" label="สกายวอล์คอัยเยอร์เวง" />
      </TripShortlistProvider>,
    );

    const addButton = await screen.findByRole("button", { name: "บันทึกสกายวอล์คอัยเยอร์เวงไว้ในทริป" });
    expect(addButton).toHaveAttribute("aria-pressed", "false");

    await user.click(addButton);

    const removeButton = screen.getByRole("button", { name: "นำสกายวอล์คอัยเยอร์เวงออกจากทริป" });
    expect(removeButton).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(parseTripShortlist(window.localStorage.getItem(TRIP_SHORTLIST_KEY))).toEqual(["aiyerweng-skywalk"]));

    await user.click(removeButton);
    expect(screen.getByRole("button", { name: "บันทึกสกายวอล์คอัยเยอร์เวงไว้ในทริป" })).toHaveAttribute("aria-pressed", "false");
  });

  it("renders truthful desktop and mobile summaries with a real routes link", async () => {
    window.localStorage.setItem(TRIP_SHORTLIST_KEY, serializeTripShortlist(["bang-lang-dam"]));

    render(
      <TripShortlistProvider>
        <TripShortlistPanel items={[{ slug: "bang-lang-dam", name: "เขื่อนบางลาง", href: "/attractions/bang-lang-dam" }]} />
        <TripShortlistBar />
      </TripShortlistProvider>,
    );

    expect(await screen.findByText("เขื่อนบางลาง")).toBeVisible();
    expect(screen.getAllByText("1 สถานที่ในทริป")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "วางแผนจากรายการนี้" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "วางแผนจากรายการนี้" })[0]).toHaveAttribute(
      "href",
      "/routes?selected=bang-lang-dam",
    );
    expect(screen.queryByText("สร้างเส้นทาง")).not.toBeInTheDocument();
  });
});

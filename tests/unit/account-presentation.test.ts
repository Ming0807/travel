import { describe, expect, it } from "vitest";
import { getAccountDisplayName, getDisplayInitials } from "@/lib/account/presentation";

describe("account presentation", () => {
  it("ignores invalid metadata and uses the first usable display name", () => {
    expect(getAccountDisplayName({ email: "mail@example.test", user_metadata: { display_name: {}, full_name: "  Mali Traveler  " } })).toBe("Mali Traveler");
    expect(getAccountDisplayName({ user_metadata: { display_name: " ", name: "นักเดินทาง" } })).toBe("นักเดินทาง");
  });
  it("uses email username or a neutral fallback without exposing the full email", () => {
    expect(getAccountDisplayName({ email: "mali@example.test" })).toBe("mali");
    expect(getAccountDisplayName({})).toBe("นักเดินทาง");
  });
  it("keeps initials short for Thai, long names and unicode", () => {
    expect(getDisplayInitials("Mali Wonderful Traveler")).toBe("MT");
    expect(getDisplayInitials("นักเดินทางยะลา")).toBe("น");
    expect(getDisplayInitials(" ")).toBe("น");
    expect(getDisplayInitials("🌏 Traveler")).toBe("🌏T");
  });
});

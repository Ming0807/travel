import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260919001000_scope_na_tham_pilot_catalog.sql"),
  "utf8",
);

describe("Ban Na Tham pilot catalog migration", () => {
  it("keeps the eleven confirmed attractions and local hospitality records", () => {
    for (const slug of [
      "your-father",
      "sleeping-buddha-cave",
      "kampan",
      "golden-junk-cave",
      "nang-monto-cave",
      "srivijaya",
      "dark-cave",
      "simiya-community",
      "tigercave",
      "artcave",
      "wat-khuha-phimuk",
      "lae-pha-ban-na-tham",
      "krua-rim-harn",
      "glieb-bua",
      "uncle-kills-duck-eggs",
      "bantham",
      "counting-stars-homestay",
      "garden-house-camping",
      "ban-lae-pha",
    ]) {
      expect(migration).toContain(`'${slug}'`);
    }
  });

  it("archives catalog and entry configuration without deleting research history", () => {
    expect(migration).toContain("UPDATE public.attractions");
    expect(migration).toContain("UPDATE public.checkin_codes");
    expect(migration).toContain("UPDATE public.research_checkin_codes");
    expect(migration).toContain("UPDATE public.nfc_tags");
    expect(migration).toContain("UPDATE public.restaurants");
    expect(migration).toContain("UPDATE public.accommodations");
    expect(migration).not.toMatch(/DELETE\s+FROM\s+public\.(visits|satisfaction_surveys|certificates|tourist_stamps|funnel_events)/i);
  });
});

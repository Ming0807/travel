import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ExecutiveEntryPanel } from "@/components/dashboard/ExecutiveEntryPanel";

it("explains unsupported filters and clears only post-entry conditions", () => {
  render(<ExecutiveEntryPanel result={{ status: "unsupported_filters", asOf: null, data: null, unsupportedFilters: ["ageGroup"] }} filters={{ dateFrom: "2026-09-01", dateTo: "2026-09-10", evidenceScope: "field_claim", attractionId: 4, ageGroup: "18-24" }} />);
  const link = screen.getByRole("link", { name: "ดูผลจากผู้เริ่มทั้งหมดในขอบเขตนี้" });
  expect(link.getAttribute("href")).toContain("attraction_id=4");
  expect(link.getAttribute("href")).toContain("date_from=2026-09-01");
  expect(link.getAttribute("href")).toContain("evidence_scope=field_claim");
  expect(link.getAttribute("href")).not.toContain("age_group");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
it.each(["disabled", "incomplete", "unavailable"] as const)("renders %s without invented metrics", status => {
  render(<ExecutiveEntryPanel result={{ status, asOf: null, data: null, unsupportedFilters: [] }} filters={{ dateFrom: "2026-09-01", dateTo: "2026-09-10", evidenceScope: "field_claim" }} />);
  expect(screen.getByRole("heading", { name: "จาก QR / NFC สู่การเช็กอิน" })).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

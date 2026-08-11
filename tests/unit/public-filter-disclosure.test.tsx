import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PublicFilterDisclosure } from "@/components/public/directory/PublicFilterDisclosure";

describe("public mobile filter disclosure", () => {
  it("exposes the filter state and toggles the form region", async () => {
    const user = userEvent.setup();

    render(
      <PublicFilterDisclosure id="restaurant-filters" openLabel="เปิดตัวกรองร้านอาหาร" closeLabel="ซ่อนตัวกรองร้านอาหาร">
        <form aria-label="ตัวกรองร้านอาหาร" />
      </PublicFilterDisclosure>,
    );

    const trigger = screen.getByRole("button", { name: "เปิดตัวกรองร้านอาหาร" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("public-filter-region")).toHaveClass("hidden");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAccessibleName("ซ่อนตัวกรองร้านอาหาร");
    expect(screen.getByTestId("public-filter-region")).toHaveClass("block");
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MinimalForm } from "@/components/checkin/MinimalForm";

vi.mock("@/app/actions/checkin-actions", () => ({
  initiateCheckin: vi.fn(),
}));

const countries = [
  { id: 1, labelTh: "ไทย", labelEn: "Thailand", iso2Code: "TH" },
  { id: 2, labelTh: "มาเลเซีย", labelEn: "Malaysia", iso2Code: "MY" },
];

const provinces = [
  { id: 10, labelTh: "กรุงเทพมหานคร", labelEn: "Bangkok" },
  { id: 11, labelTh: "ปัตตานี", labelEn: "Pattani" },
  { id: 12, labelTh: "ยะลา", labelEn: "Yala" },
];

describe("MinimalForm", () => {
  it("opens the province list on focus and filters Thai or English names", async () => {
    const user = userEvent.setup();
    render(<MinimalForm checkinCode="PTN001" countries={countries} provinces={provinces} />);

    const provinceInput = screen.getByRole("combobox", { name: "จังหวัดที่เดินทางมา" });
    await user.click(provinceInput);

    const listbox = screen.getByRole("listbox", { name: "รายชื่อจังหวัด" });
    expect(within(listbox).getByText("กรุงเทพมหานคร")).toBeInTheDocument();
    expect(within(listbox).getByText("ปัตตานี")).toBeInTheDocument();

    await user.type(provinceInput, "pat");
    expect(within(listbox).getByText("ปัตตานี")).toBeInTheDocument();
    expect(within(listbox).queryByText("ยะลา")).not.toBeInTheDocument();
  });

  it("stores the selected province id and closes the list", async () => {
    const user = userEvent.setup();
    render(<MinimalForm checkinCode="PTN001" countries={countries} provinces={provinces} />);

    await user.click(screen.getByRole("combobox", { name: "จังหวัดที่เดินทางมา" }));
    await user.click(screen.getByRole("option", { name: /ปัตตานี/ }));

    expect(screen.getByRole("combobox", { name: "จังหวัดที่เดินทางมา" })).toHaveValue("ปัตตานี");
    expect(document.querySelector('input[name="originProvinceId"]')).toHaveValue("11");
    expect(screen.queryByRole("listbox", { name: "รายชื่อจังหวัด" })).not.toBeInTheDocument();
  });

  it("hides and clears province when a foreign country is selected", async () => {
    const user = userEvent.setup();
    render(<MinimalForm checkinCode="PTN001" countries={countries} provinces={provinces} />);

    await user.selectOptions(screen.getByLabelText("ประเทศที่เดินทางมา"), "2");

    expect(screen.queryByRole("combobox", { name: "จังหวัดที่เดินทางมา" })).not.toBeInTheDocument();
    expect(document.querySelector('input[name="originProvinceId"]')).toHaveValue("");
  });

  it("shows a compact returning profile before exposing edit fields", async () => {
    const user = userEvent.setup();
    render(
      <MinimalForm
        checkinCode="PTN001"
        countries={countries}
        provinces={provinces}
        initialProfile={{
          displayName: "นักเดินทางเดิม",
          originCountryId: 1,
          originProvinceId: 11,
          ageGroup: "25_34",
          hasCurrentConsent: true,
        }}
      />,
    );

    expect(screen.getByText("ยินดีต้อนรับกลับ")).toBeInTheDocument();
    expect(screen.getByText("นักเดินทางเดิม")).toBeInTheDocument();
    expect(screen.queryByLabelText("ชื่อที่แสดงบนใบประกาศ")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ใช้ข้อมูลเดิมและดำเนินการต่อ" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "แก้ไขข้อมูล" }));
    expect(screen.getByLabelText("ชื่อที่แสดงบนใบประกาศ")).toHaveValue("นักเดินทางเดิม");
    expect(screen.getByRole("combobox", { name: "จังหวัดที่เดินทางมา" })).toHaveValue("ปัตตานี");
  });

  it("restores saved location when a returning tourist cancels editing", async () => {
    const user = userEvent.setup();
    render(
      <MinimalForm
        checkinCode="PTN001"
        countries={countries}
        provinces={provinces}
        initialProfile={{
          displayName: "นักเดินทางเดิม",
          originCountryId: 1,
          originProvinceId: 11,
          ageGroup: "25_34",
          hasCurrentConsent: true,
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "แก้ไขข้อมูล" }));
    await user.selectOptions(screen.getByLabelText("ประเทศที่เดินทางมา"), "2");
    await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(screen.getByText(/ไทย · ปัตตานี/)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSelect } from "@/components/admin/FilterBar";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/attractions",
  useSearchParams: () => mockSearchParams,
}));

describe("FilterSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("status");
    mockSearchParams.delete("page");
  });

  const options = [
    { value: "true", label: "Published" },
    { value: "false", label: "Draft" },
  ];

  it("renders correctly with default 'allLabel'", () => {
    render(<FilterSelect label="สถานะ" paramKey="status" options={options} />);
    expect(screen.getByText("สถานะ")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("ทั้งหมด")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("uses currentValue from searchParams", () => {
    mockSearchParams.set("status", "true");
    render(<FilterSelect label="สถานะ" paramKey="status" options={options} />);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("true");
  });

  it("updates URL with selected option and resets page to 1", async () => {
    mockSearchParams.set("page", "5");
    render(<FilterSelect label="สถานะ" paramKey="status" options={options} />);

    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "false");

    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushedUrl = mockPush.mock.calls[0][0];
    const url = new URL(pushedUrl, "http://localhost");
    expect(url.pathname).toBe("/admin/attractions");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("status")).toBe("false");
  });

  it("removes paramKey when 'all' option is selected", async () => {
    mockSearchParams.set("status", "true");
    mockSearchParams.set("page", "2");

    render(<FilterSelect label="สถานะ" paramKey="status" options={options} />);

    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, ""); // "" is the default value for "ทั้งหมด"

    // 'status' should be removed, 'page' should be set to 1
    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushedUrl = mockPush.mock.calls[0][0];
    const url = new URL(pushedUrl, "http://localhost");
    expect(url.pathname).toBe("/admin/attractions");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.has("status")).toBe(false);
  });
});
